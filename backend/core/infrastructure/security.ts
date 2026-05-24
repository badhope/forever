/**
 * Forever Core - Security System
 * 参考 OpenClaw 架构
 */

import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual, scryptSync } from 'crypto';
import fs from 'fs';
import path from 'path';
import { getLogger } from './logging';

const logger = getLogger('security');

export interface SecurityConfig {
  enableSSRFPermitLocalhost: boolean;
  enableTimingSafeAuth: boolean;
  enableAuditLog: boolean;
  allowedSSRFWhitelist: string[];
  blocklistSSRF: string[];
  secretsDir: string;
}

export interface SecretRef {
  id: string;
  type: 'env' | 'file' | 'secret';
  key?: string;
  path?: string;
  encryptedValue?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  type: 'auth' | 'ssrf' | 'permission' | 'error' | 'tool_exec' | 'secret_access';
  action: string;
  userId?: string;
  sessionId?: string;
  metadata: Record<string, any>;
}

export class SecurityManager {
  private config: SecurityConfig;
  private auditLog: AuditEntry[] = [];
  private masterKey?: Buffer;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enableSSRFPermitLocalhost: config.enableSSRFPermitLocalhost ?? false,
      enableTimingSafeAuth: config.enableTimingSafeAuth ?? true,
      enableAuditLog: config.enableAuditLog ?? true,
      allowedSSRFWhitelist: config.allowedSSRFWhitelist ?? [],
      blocklistSSRF: config.blocklistSSRF ?? ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', 'localhost', '127.0.0.1'],
      secretsDir: config.secretsDir ?? './secrets',
    };
    this.initMasterKey();
  }

  private initMasterKey() {
    const keyPath = path.join(this.config.secretsDir, '.master.key');
    if (fs.existsSync(keyPath)) {
      this.masterKey = Buffer.from(fs.readFileSync(keyPath, 'utf-8'), 'hex');
    } else {
      this.masterKey = randomBytes(32);
      if (!fs.existsSync(this.config.secretsDir)) {
        fs.mkdirSync(this.config.secretsDir, { recursive: true });
      }
      fs.writeFileSync(keyPath, this.masterKey.toString('hex'));
    }
  }

  validateSSRFUrl(url: string): { allowed: boolean; reason?: string } {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      const port = parsedUrl.port ? parseInt(parsedUrl.port) : (parsedUrl.protocol === 'https:' ? 443 : 80);

      if (port < 1 || port > 65535) {
        return { allowed: false, reason: `Port out of range: ${port}` };
      }

      const blockedPorts = [22, 23, 25, 110, 143, 445, 1433, 1521, 3306, 3389, 5432, 5900, 6379, 27017];
      if (blockedPorts.includes(port)) {
        return { allowed: false, reason: `Port blocked: ${port}` };
      }

      if (this.config.blocklistSSRF.some(blocked => {
        if (blocked.includes('/')) {
          return this.isIpInRange(hostname, blocked);
        }
        return hostname.includes(blocked);
      })) {
        this.audit('ssrf', 'blocked_request', { hostname, url });
        return { allowed: false, reason: `Hostname blocked by SSRF blocklist: ${hostname}` };
      }

      if (!this.config.enableSSRFPermitLocalhost) {
        const loopbackHosts = ['localhost', '127.0.0.1', '[::1]', '0.0.0.0', '[::]'];
        if (loopbackHosts.includes(hostname)) {
          this.audit('ssrf', 'blocked_loopback', { hostname, url });
          return { allowed: false, reason: 'Localhost access not allowed' };
        }
      }

      if (this.config.allowedSSRFWhitelist.length > 0) {
        const isAllowed = this.config.allowedSSRFWhitelist.some(allowed => {
          if (allowed.includes('*')) {
            const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
            return regex.test(hostname);
          }
          return hostname.endsWith(allowed);
        });

        if (!isAllowed) {
          this.audit('ssrf', 'blocked_not_whitelisted', { hostname, url });
          return { allowed: false, reason: `Hostname not in SSRF whitelist: ${hostname}` };
        }
      }

      this.audit('ssrf', 'allowed_request', { hostname, url });
      return { allowed: true };
    } catch (err) {
      this.audit('ssrf', 'parse_failed', { url });
      return { allowed: false, reason: `URL parsing failed` };
    }
  }

  private isIpInRange(ip: string, cidr: string): boolean {
    try {
      const [subnet, bitsStr] = cidr.split('/');
      const bits = parseInt(bitsStr);
      const ipNum = this.ipToNum(ip);
      const subnetNum = this.ipToNum(subnet);
      const mask = -1 << (32 - bits);
      return (ipNum & mask) === (subnetNum & mask);
    } catch {
      return false;
    }
  }

  private ipToNum(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  timingSafeStringCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');

    if (bufA.length !== bufB.length) {
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  }

  encryptSecret(plaintext: string): string {
    if (!this.masterKey) throw new Error('Master key not initialized');
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.masterKey, iv);
    let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decryptSecret(encrypted: string): string {
    if (!this.masterKey) throw new Error('Master key not initialized');
    const [ivHex, encryptedHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', this.masterKey, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }

  resolveSecretRef(secretRef: SecretRef): string | null {
    try {
      this.audit('secret_access', 'resolve', { secretId: secretRef.id, type: secretRef.type });
      
      switch (secretRef.type) {
        case 'env':
          return process.env[secretRef.key ?? ''] ?? null;
        case 'file':
          return this.tryReadFile(secretRef.path);
        case 'secret':
          return secretRef.encryptedValue ? this.decryptSecret(secretRef.encryptedValue) : null;
        default:
          return null;
      }
    } catch (err) {
      logger.error('[Security] Failed to resolve secret:', err);
      this.audit('error', 'secret_resolve_failed', { secretId: secretRef.id, error: String(err) });
      return null;
    }
  }

  private tryReadFile(pathStr?: string): string | null {
    if (!pathStr) return null;
    try {
      const fullPath = path.isAbsolute(pathStr) 
        ? pathStr 
        : path.join(this.config.secretsDir, pathStr);
      return fs.readFileSync(fullPath, 'utf-8').trim();
    } catch {
      return null;
    }
  }

  storeSecret(id: string, value: string): SecretRef {
    const encrypted = this.encryptSecret(value);
    return {
      id,
      type: 'secret',
      encryptedValue: encrypted,
    };
  }

  audit(
    type: AuditEntry['type'], 
    action: string, 
    metadata: Record<string, any> = {},
    userId?: string,
    sessionId?: string
  ) {
    if (!this.config.enableAuditLog) return;

    const entry: AuditEntry = {
      id: randomBytes(16).toString('hex'),
      timestamp: new Date(),
      type,
      action,
      userId,
      sessionId,
      metadata,
    };

    this.auditLog.push(entry);
    logger.info(`[Audit] ${type}: ${action}`, { userId, sessionId, ...metadata });
  }

  getAuditLog(since?: Date, limit = 100, type?: AuditEntry['type']): AuditEntry[] {
    let logs = this.auditLog
      .filter(log => !since || log.timestamp >= since)
      .filter(log => !type || log.type === type)
      .slice(-limit);

    return logs;
  }

  exportAuditLog(since?: Date): string {
    return JSON.stringify(this.getAuditLog(since, 100000), null, 2);
  }

  validateToolPermission(
    userId: string, 
    toolName: string,
    action: 'read' | 'write' | 'admin'
  ): boolean {
    this.audit('permission', 'tool_access', {
      toolName,
      action,
      granted: true,
    }, userId);
    return true;
  }
}

export class RateLimiter {
  private limits: Map<string, { count: number; resetAt: number }> = new Map();

  checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; resetAt: number; remaining: number } {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const windowKey = `${key}:${windowStart}`;

    let entry = this.limits.get(windowKey);
    if (!entry) {
      entry = { count: 0, resetAt: windowStart + windowMs };
      this.limits.set(windowKey, entry);
    }

    entry.count++;

    const remaining = maxRequests - entry.count;

    if (entry.count > maxRequests) {
      return { allowed: false, resetAt: entry.resetAt, remaining };
    }

    return { allowed: true, resetAt: entry.resetAt, remaining };
  }

  reset(key: string, windowMs: number): void {
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
    const windowKey = `${key}:${windowStart}`;
    this.limits.delete(windowKey);
  }
}

export const securityManager = new SecurityManager();
export const rateLimiter = new RateLimiter();

