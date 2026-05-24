import { EventEmitter } from 'eventemitter3';
import { getLogger } from '../infrastructure/logging';
import { securityManager } from '../infrastructure';

const logger = getLogger('tool-approval');

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';

export interface ToolApprovalRequest {
  id: string;
  toolName: string;
  toolArgs: Record<string, any>;
  userId: string;
  sessionId?: string;
  status: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  reason?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  executionResult?: any;
}

export interface ApprovalPolicy {
  toolName?: string;
  toolCategory?: string;
  requiresApproval: boolean;
  timeout: number;
  allowAutoApprove: boolean;
  maxUses?: number;
  permissions?: string[];
}

const DEFAULT_POLICIES: ApprovalPolicy[] = [
  {
    toolCategory: 'system',
    requiresApproval: true,
    timeout: 300000,
    allowAutoApprove: false,
  },
  {
    toolCategory: 'file_write',
    requiresApproval: true,
    timeout: 300000,
    allowAutoApprove: false,
  },
  {
    toolCategory: 'default',
    requiresApproval: false,
    timeout: 60000,
    allowAutoApprove: true,
  },
];

export class ToolApprovalManager extends EventEmitter {
  private requests: Map<string, ToolApprovalRequest> = new Map();
  private policies: ApprovalPolicy[] = [...DEFAULT_POLICIES];
  private autoApproveRules: Set<string> = new Set();
  private approvalCallbacks: Map<string, (approved: boolean, reason?: string) => void> = new Map();

  constructor() {
    super();
    this.startCleanupTimer();
  }

  addPolicy(policy: ApprovalPolicy): void {
    this.policies.unshift(policy);
    logger.info('Added approval policy', { policy });
  }

  setAutoApprove(toolName: string, enabled: boolean): void {
    if (enabled) {
      this.autoApproveRules.add(toolName);
    } else {
      this.autoApproveRules.delete(toolName);
    }
  }

  getPolicyForTool(toolName: string, category?: string): ApprovalPolicy {
    for (const policy of this.policies) {
      if (policy.toolName === toolName) return policy;
      if (policy.toolCategory === category) return policy;
    }
    return DEFAULT_POLICIES[DEFAULT_POLICIES.length - 1];
  }

  async requestApproval(
    toolName: string,
    toolArgs: Record<string, any>,
    userId: string,
    options?: {
      sessionId?: string;
      category?: string;
      timeout?: number;
    }
  ): Promise<ToolApprovalRequest> {
    const policy = this.getPolicyForTool(toolName, options?.category);
    const timeout = options?.timeout || policy.timeout;

    // Check auto-approve
    if (!policy.requiresApproval || this.autoApproveRules.has(toolName)) {
      const request = this.createRequest(toolName, toolArgs, userId, options?.sessionId, timeout);
      request.status = 'approved';
      request.resolvedAt = new Date();
      this.requests.set(request.id, request);
      this.emit('approved', request);
      logger.info('Auto-approved tool execution', { toolName, requestId: request.id });
      return request;
    }

    const request = this.createRequest(toolName, toolArgs, userId, options?.sessionId, timeout);
    this.requests.set(request.id, request);
    
    securityManager.audit('tool_exec', 'approval_requested', { toolName, toolArgs }, userId, options?.sessionId);
    this.emit('requested', request);
    logger.info('Tool approval requested', { toolName, requestId: request.id });

    return request;
  }

  private createRequest(
    toolName: string,
    toolArgs: Record<string, any>,
    userId: string,
    sessionId: string | undefined,
    timeout: number
  ): ToolApprovalRequest {
    const now = new Date();
    return {
      id: `approval_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      toolName,
      toolArgs,
      userId,
      sessionId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + timeout),
    };
  }

  async approve(requestId: string, resolvedBy?: string, reason?: string): Promise<ToolApprovalRequest | undefined> {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'pending') return undefined;

    request.status = 'approved';
    request.resolvedBy = resolvedBy;
    request.resolvedAt = new Date();
    request.reason = reason;
    request.updatedAt = new Date();

    securityManager.audit('tool_exec', 'approved', { requestId, reason }, resolvedBy, request.sessionId);
    this.emit('approved', request);

    const callback = this.approvalCallbacks.get(requestId);
    if (callback) {
      callback(true, reason);
      this.approvalCallbacks.delete(requestId);
    }

    logger.info('Tool approval granted', { requestId, toolName: request.toolName });
    return request;
  }

  async reject(requestId: string, resolvedBy?: string, reason?: string): Promise<ToolApprovalRequest | undefined> {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'pending') return undefined;

    request.status = 'rejected';
    request.resolvedBy = resolvedBy;
    request.resolvedAt = new Date();
    request.reason = reason;
    request.updatedAt = new Date();

    securityManager.audit('tool_exec', 'rejected', { requestId, reason }, resolvedBy, request.sessionId);
    this.emit('rejected', request);

    const callback = this.approvalCallbacks.get(requestId);
    if (callback) {
      callback(false, reason);
      this.approvalCallbacks.delete(requestId);
    }

    logger.info('Tool approval rejected', { requestId, toolName: request.toolName });
    return request;
  }

  async waitForApproval(requestId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const request = this.requests.get(requestId);
      if (!request) {
        resolve(false);
        return;
      }

      if (request.status === 'approved') {
        resolve(true);
        return;
      }

      if (request.status !== 'pending') {
        resolve(false);
        return;
      }

      const timeout = request.expiresAt.getTime() - Date.now();
      const timer = setTimeout(() => {
        const req = this.requests.get(requestId);
        if (req && req.status === 'pending') {
          req.status = 'expired';
          req.updatedAt = new Date();
          this.emit('expired', req);
        }
        this.approvalCallbacks.delete(requestId);
        resolve(false);
      }, Math.max(timeout, 0));

      this.approvalCallbacks.set(requestId, (approved) => {
        clearTimeout(timer);
        resolve(approved);
      });
    });
  }

  getRequest(requestId: string): ToolApprovalRequest | undefined {
    return this.requests.get(requestId);
  }

  getPendingRequests(userId?: string): ToolApprovalRequest[] {
    const requests = Array.from(this.requests.values()).filter(r => r.status === 'pending');
    if (userId) {
      return requests.filter(r => r.userId === userId);
    }
    return requests;
  }

  setExecutionResult(requestId: string, result: any): void {
    const request = this.requests.get(requestId);
    if (request) {
      request.executionResult = result;
      request.updatedAt = new Date();
    }
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 60000);
  }

  private cleanupExpired(): void {
    const now = new Date();
    for (const [id, request] of this.requests.entries()) {
      if (request.status === 'pending' && now > request.expiresAt) {
        request.status = 'expired';
        request.updatedAt = now;
        this.emit('expired', request);

        const callback = this.approvalCallbacks.get(id);
        if (callback) {
          callback(false, 'Request expired');
          this.approvalCallbacks.delete(id);
        }
      }
    }

    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    for (const [id, request] of this.requests.entries()) {
      if (request.updatedAt < cutoff) {
        this.requests.delete(id);
      }
    }
  }
}

export const toolApprovalManager = new ToolApprovalManager();
