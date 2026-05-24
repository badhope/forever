/**
 * Forever Core - Gateway Server (HTTP + WebSocket)
 * 参考 OpenClaw 架构
 */

import express, { Express, Request, Response } from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { healthChecker, HealthCheckResult } from './health-check';
import { metricsCollector } from './metrics';
import { circuitBreakerRegistry } from './circuit-breaker';

export interface GatewayConfig {
  port: number;
  host: string;
  enableCors: boolean;
  enableHealthProbes: boolean;
  enableWebSocket: boolean;
}

export interface WebSocketMessage {
  id: string;
  method: string;
  params: Record<string, any>;
  timestamp: number;
}

export interface WebSocketResponse {
  id: string;
  result?: any;
  error?: string;
  timestamp: number;
}

export class GatewayServer {
  private app: Express;
  private server: http.Server;
  private wss?: WebSocketServer;
  private config: GatewayConfig;
  private activeConnections: Map<string, WebSocket> = new Map();
  private isRunning: boolean = false;

  constructor(config: Partial<GatewayConfig> = {}) {
    this.config = {
      port: config.port ?? 8080,
      host: config.host ?? '0.0.0.0',
      enableCors: config.enableCors ?? true,
      enableHealthProbes: config.enableHealthProbes ?? true,
      enableWebSocket: config.enableWebSocket ?? true,
    };

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.server = http.createServer(this.app);
  }

  private setupMiddleware() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    if (this.config.enableCors) {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }
        next();
      });
    }

    this.app.use((req, res, next) => {
      const start = Date.now();
      const metrics = metricsCollector;
      
      metrics.counter('http_requests_total', 1, { path: req.path, method: req.method });
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        metrics.histogram('http_request_duration_ms', duration, { path: req.path, method: req.method, status: res.statusCode.toString() });
        
        if (res.statusCode >= 400) {
          metrics.counter('http_requests_error_total', 1, { path: req.path, method: req.method, status: res.statusCode.toString() });
        }
      });
      
      next();
    });
  }

  private setupRoutes() {
    if (this.config.enableHealthProbes) {
      this.app.get('/health', (req, res) => this.handleHealthCheck(req, res, false));
      this.app.get('/healthz', (req, res) => this.handleHealthCheck(req, res, false));
      this.app.get('/ready', (req, res) => this.handleHealthCheck(req, res, true));
      this.app.get('/readyz', (req, res) => this.handleHealthCheck(req, res, true));
    }

    this.app.get('/metrics', (req, res) => {
      res.json({
        http: metricsCollector.export(),
        circuit_breakers: circuitBreakerRegistry.getAllStats(),
        gateway: {
          active_connections: this.activeConnections.size,
          uptime_ms: this.isRunning ? Date.now() - this.startTime : 0,
        },
      });
    });

    this.app.get('/api/v1/status', (req, res) => {
      res.json({
        status: 'ok',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      });
    });

    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Not Found', path: req.path });
    });
  }

  private handleHealthCheck(req: Request, res: Response, isReady: boolean) {
    const overallStatus = healthChecker.getOverallStatus();
    
    if (isReady && overallStatus !== 'healthy') {
      return res.status(503).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: Array.from(healthChecker['results'].entries()),
      });
    }

    res.status(overallStatus === 'unhealthy' ? 503 : 200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: Array.from(healthChecker['results'].entries()),
    });
  }

  private setupWebSocket() {
    if (!this.config.enableWebSocket) return;

    this.wss = new WebSocketServer({ server: this.server });
    
    this.wss.on('connection', (ws) => {
      const connectionId = uuidv4();
      this.activeConnections.set(connectionId, ws);
      console.log(`[Gateway] WebSocket connected: ${connectionId}`);

      ws.on('message', async (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          await this.handleWebSocketMessage(connectionId, ws, message);
        } catch (err) {
          ws.send(JSON.stringify({
            id: 'unknown',
            error: 'Invalid message format',
            timestamp: Date.now(),
          } as WebSocketResponse));
        }
      });

      ws.on('close', () => {
        this.activeConnections.delete(connectionId);
        console.log(`[Gateway] WebSocket disconnected: ${connectionId}`);
      });

      ws.on('error', (err) => {
        console.error(`[Gateway] WebSocket error ${connectionId}:`, err);
        this.activeConnections.delete(connectionId);
      });
    });

    console.log('[Gateway] WebSocket server started');
  }

  private async handleWebSocketMessage(connectionId: string, ws: WebSocket, message: WebSocketMessage) {
    try {
      let result: any;
      
      switch (message.method) {
        case 'ping':
          result = { pong: Date.now() };
          break;
        
        case 'get_status':
          result = {
            status: 'ok',
            connection_id: connectionId,
            timestamp: Date.now(),
          };
          break;
        
        case 'get_metrics':
          result = {
            metrics: metricsCollector.export(),
          };
          break;
        
        default:
          result = { error: `Unknown method: ${message.method}` };
      }

      ws.send(JSON.stringify({
        id: message.id,
        result,
        timestamp: Date.now(),
      } as WebSocketResponse));
    } catch (err) {
      ws.send(JSON.stringify({
        id: message.id,
        error: err instanceof Error ? err.message : String(err),
        timestamp: Date.now(),
      } as WebSocketResponse));
    }
  }

  private startTime: number = Date.now();

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('[Gateway] Server is already running');
      return;
    }

    this.setupWebSocket();
    this.isRunning = true;
    this.startTime = Date.now();

    await new Promise<void>((resolve) => {
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`[Gateway] Server listening on ${this.config.host}:${this.config.port}`);
        resolve();
      });
    });

    await healthChecker.checkAll();
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    for (const [id, ws] of this.activeConnections) {
      ws.close();
    }
    this.activeConnections.clear();

    await new Promise<void>((resolve) => {
      this.server.close(() => {
        console.log('[Gateway] Server stopped');
        resolve();
      });
    });
  }

  getActiveConnections(): number {
    return this.activeConnections.size;
  }

  isHealthy(): boolean {
    return healthChecker.getOverallStatus() === 'healthy';
  }
}

export const gatewayServer = new GatewayServer();

