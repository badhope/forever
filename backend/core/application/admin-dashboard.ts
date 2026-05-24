
/**
 * Forever AI - Admin Dashboard Framework
 * 第五层：应用生态层 - 管理后台基础框架
 */

import { EventEmitter } from 'events';
import { logger } from '../logger';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'table' | 'log' | 'custom';
  data?: any;
  refreshInterval?: number;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
}

export interface DashboardLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

export class AdminDashboard extends EventEmitter {
  private widgets: Map<string, DashboardWidget> = new Map();
  private users: Map<string, AdminUser> = new Map();
  private logs: DashboardLog[] = [];

  constructor() {
    super();
    this.registerDefaultWidgets();
  }

  /**
   * 注册组件
   */
  registerWidget(widget: DashboardWidget): void {
    this.widgets.set(widget.id, widget);
    logger.debug('application:admin-dashboard', 'Dashboard widget registered', { widgetId: widget.id });
  }

  /**
   * 获取所有组件
   */
  getWidgets(): DashboardWidget[] {
    return Array.from(this.widgets.values());
  }

  /**
   * 获取单个组件
   */
  getWidget(id: string): DashboardWidget | undefined {
    return this.widgets.get(id);
  }

  /**
   * 更新组件数据
   */
  updateWidgetData(id: string, data: any): void {
    const widget = this.widgets.get(id);
    if (widget) {
      widget.data = data;
      this.emit('widget:updated', { widgetId: id, data });
    }
  }

  /**
   * 注册用户
   */
  registerUser(user: AdminUser): void {
    this.users.set(user.id, user);
    logger.info('application:admin-dashboard', 'Admin user registered', { userId: user.id, username: user.username });
  }

  /**
   * 获取用户
   */
  getUser(id: string): AdminUser | undefined {
    return this.users.get(id);
  }

  /**
   * 验证权限
   */
  hasPermission(userId: string, permission: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  }

  /**
   * 添加日志
   */
  addLog(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any
  ): void {
    const log: DashboardLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      data,
    };

    this.logs.unshift(log);

    // 保留最近 1000 条
    if (this.logs.length > 1000) {
      this.logs.pop();
    }

    this.emit('log:added', log);
  }

  /**
   * 获取日志
   */
  getLogs(
    level?: 'info' | 'warn' | 'error' | 'debug',
    limit: number = 100
  ): DashboardLog[] {
    let logs = this.logs;
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    return logs.slice(0, limit);
  }

  /**
   * 获取仪表板数据
   */
  getDashboardData(): {
    widgets: DashboardWidget[];
    recentLogs: DashboardLog[];
    stats: {
      widgetCount: number;
      userCount: number;
      logCount: number;
    };
  } {
    return {
      widgets: this.getWidgets(),
      recentLogs: this.getLogs(undefined, 20),
      stats: {
        widgetCount: this.widgets.size,
        userCount: this.users.size,
        logCount: this.logs.length,
      },
    };
  }

  /**
   * 注册默认组件
   */
  private registerDefaultWidgets(): void {
    // 系统状态组件
    this.registerWidget({
      id: 'system_status',
      title: 'System Status',
      type: 'stat',
      data: { status: 'healthy', uptime: 0 },
      refreshInterval: 5000,
    });

    // Agent 数量组件
    this.registerWidget({
      id: 'agent_count',
      title: 'Active Agents',
      type: 'stat',
      data: { count: 0 },
      refreshInterval: 3000,
    });

    // 消息队列组件
    this.registerWidget({
      id: 'message_queue',
      title: 'Message Queue',
      type: 'stat',
      data: { pending: 0, processed: 0 },
      refreshInterval: 2000,
    });

    // 最近日志组件
    this.registerWidget({
      id: 'recent_logs',
      title: 'Recent Logs',
      type: 'log',
      refreshInterval: 1000,
    });
  }
}

// 单例实例
export const adminDashboard = new AdminDashboard();

