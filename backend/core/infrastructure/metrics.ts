/**
 * Forever Core - Metrics System
 * 监控指标系统 - 参考 Prometheus + OpenTelemetry 设计
 */

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricLabels {
  [key: string]: string;
}

export interface MetricPoint {
  value: number;
  timestamp: number;
  labels?: MetricLabels;
}

export class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private summaries: Map<string, { values: number[]; count: number; sum: number }> = new Map();
  
  private labels: Map<string, MetricLabels> = new Map();
  private maxHistogramBuckets = 100;

  private getKey(name: string, labels?: MetricLabels): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels).sort().map(([k, v]) => `${k}="${v}"`).join(',');
    return `${name}{${labelStr}}`;
  }

  counter(name: string, value: number = 1, labels?: MetricLabels): void {
    const key = this.getKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    this.labels.set(key, labels || {});
  }

  gauge(name: string, value: number, labels?: MetricLabels): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);
    this.labels.set(key, labels || {});
  }

  histogram(name: string, value: number, labels?: MetricLabels): void {
    const key = this.getKey(name, labels);
    const buckets = this.histograms.get(key) || [];
    buckets.push(value);
    if (buckets.length > this.maxHistogramBuckets) {
      buckets.shift();
    }
    this.histograms.set(key, buckets);
    this.labels.set(key, labels || {});
  }

  summary(name: string, value: number, labels?: MetricLabels): void {
    const key = this.getKey(name, labels);
    let summary = this.summaries.get(key);
    if (!summary) {
      summary = { values: [], count: 0, sum: 0 };
    }
    summary.values.push(value);
    summary.count++;
    summary.sum += value;
    this.summaries.set(key, summary);
    this.labels.set(key, labels || {});
  }

  getCounter(name: string, labels?: MetricLabels): number {
    return this.counters.get(this.getKey(name, labels)) || 0;
  }

  getGauge(name: string, labels?: MetricLabels): number {
    return this.gauges.get(this.getKey(name, labels)) || 0;
  }

  getHistogram(name: string, labels?: MetricLabels): { count: number; sum: number; min: number; max: number; avg: number; p50: number; p95: number; p99: number } {
    const buckets = this.histograms.get(this.getKey(name, labels)) || [];
    if (buckets.length === 0) {
      return { count: 0, sum: 0, min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
    }
    
    const sorted = [...buckets].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const count = sorted.length;
    
    return {
      count,
      sum,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sum / count,
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    };
  }

  getSummary(name: string, labels?: MetricLabels): { count: number; sum: number; avg: number } {
    const summary = this.summaries.get(this.getKey(name, labels));
    if (!summary) {
      return { count: 0, sum: 0, avg: 0 };
    }
    return {
      count: summary.count,
      sum: summary.sum,
      avg: summary.sum / summary.count,
    };
  }

  reset(name?: string): void {
    if (name) {
      this.counters.delete(name);
      this.gauges.delete(name);
      this.histograms.delete(name);
      this.summaries.delete(name);
    } else {
      this.counters.clear();
      this.gauges.clear();
      this.histograms.clear();
      this.summaries.clear();
    }
  }

  export(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of this.counters) {
      result[`counter:${key}`] = value;
    }
    
    for (const [key, value] of this.gauges) {
      result[`gauge:${key}`] = value;
    }
    
    for (const [key, buckets] of this.histograms) {
      const sorted = [...buckets].sort((a, b) => a - b);
      result[`histogram:${key}`] = {
        count: sorted.length,
        sum: sorted.reduce((a, b) => a + b, 0),
        min: sorted[0],
        max: sorted[sorted.length - 1],
      };
    }
    
    for (const [key, summary] of this.summaries) {
      result[`summary:${key}`] = {
        count: summary.count,
        sum: summary.sum,
        avg: summary.sum / summary.count,
      };
    }
    
    return result;
  }
}

export interface AgentMetrics {
  requestsTotal: number;
  requestsSuccess: number;
  requestsFailed: number;
  requestDurationMs: number;
  activeRequests: number;
  errorsByType: Map<string, number>;
  memoryUsageBytes: number;
  lastRequestTimestamp: number;
}

export class AgentMetricsCollector {
  private metrics: MetricsCollector;
  private agentMetrics: Map<string, AgentMetrics> = new Map();

  constructor() {
    this.metrics = new MetricsCollector();
  }

  recordRequest(agentId: string, success: boolean, durationMs: number): void {
    this.metrics.counter('agent_requests_total', 1, { agent_id: agentId, status: success ? 'success' : 'failure' });
    
    if (success) {
      this.metrics.counter('agent_requests_success_total', 1, { agent_id: agentId });
    } else {
      this.metrics.counter('agent_requests_failed_total', 1, { agent_id: agentId });
    }
    
    this.metrics.histogram('agent_request_duration_ms', durationMs, { agent_id: agentId });
    
    let metrics = this.agentMetrics.get(agentId);
    if (!metrics) {
      metrics = this.createEmptyMetrics();
      this.agentMetrics.set(agentId, metrics);
    }
    
    metrics.requestsTotal++;
    if (success) {
      metrics.requestsSuccess++;
    } else {
      metrics.requestsFailed++;
    }
    metrics.requestDurationMs += durationMs;
    metrics.lastRequestTimestamp = Date.now();
  }

  recordError(agentId: string, errorType: string): void {
    this.metrics.counter('agent_errors_total', 1, { agent_id: agentId, error_type: errorType });
    
    const metrics = this.agentMetrics.get(agentId);
    if (metrics) {
      const count = metrics.errorsByType.get(errorType) || 0;
      metrics.errorsByType.set(errorType, count + 1);
    }
  }

  setActiveRequests(agentId: string, count: number): void {
    this.metrics.gauge('agent_active_requests', count, { agent_id: agentId });
  }

  setMemoryUsage(agentId: string, bytes: number): void {
    this.metrics.gauge('agent_memory_usage_bytes', bytes, { agent_id: agentId });
  }

  getMetrics(agentId?: string): Record<string, any> {
    const base = this.metrics.export();
    
    if (agentId) {
      const agentMetric = this.agentMetrics.get(agentId);
      return {
        ...base,
        agent: agentMetric || this.createEmptyMetrics(),
      };
    }
    
    return {
      ...base,
      agents: Object.fromEntries(this.agentMetrics),
    };
  }

  private createEmptyMetrics(): AgentMetrics {
    return {
      requestsTotal: 0,
      requestsSuccess: 0,
      requestsFailed: 0,
      requestDurationMs: 0,
      activeRequests: 0,
      errorsByType: new Map(),
      memoryUsageBytes: 0,
      lastRequestTimestamp: 0,
    };
  }
}

export const metricsCollector = new MetricsCollector();
export const agentMetricsCollector = new AgentMetricsCollector();