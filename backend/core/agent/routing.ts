import { configManager } from '../infrastructure/config';
import { getLogger } from '../infrastructure/logging';

const logger = getLogger('routing');

export interface ChannelBinding {
  channelId: string;
  agentId: string;
  scope: 'dm' | 'group' | 'all';
  priority: number;
}

export interface RoutingContext {
  channelId: string;
  channelType: string;
  senderId: string;
  threadId?: string;
  isDirectMessage: boolean;
  metadata: Record<string, any>;
}

export class Router {
  private bindings: Map<string, ChannelBinding[]> = new Map();
  private defaultAgentId: string;

  constructor(defaultAgentId: string = 'default') {
    this.defaultAgentId = defaultAgentId;
    this.loadBindingsFromConfig();
  }

  private loadBindingsFromConfig() {
    const config = configManager.get();
    config.channels.bindings.forEach((binding: any, index: number) => {
      this.addBinding({
        channelId: binding.channel,
        agentId: binding.agent,
        scope: binding.scope,
        priority: 100 - index,
      });
    });
    if (config.channels.default) {
      this.defaultAgentId = config.channels.default;
    }
  }

  addBinding(binding: ChannelBinding): void {
    const channelBindings = this.bindings.get(binding.channelId) || [];
    channelBindings.push(binding);
    channelBindings.sort((a, b) => b.priority - a.priority);
    this.bindings.set(binding.channelId, channelBindings);
    logger.debug('Added channel binding', { channelId: binding.channelId, agentId: binding.agentId });
  }

  removeBinding(channelId: string, agentId: string): void {
    const channelBindings = this.bindings.get(channelId) || [];
    this.bindings.set(
      channelId,
      channelBindings.filter(b => b.agentId !== agentId)
    );
    logger.debug('Removed channel binding', { channelId, agentId });
  }

  resolveAgentRoute(context: RoutingContext): string {
    const channelBindings = this.bindings.get(context.channelId) || [];

    for (const binding of channelBindings) {
      if (this.matchesScope(binding.scope, context)) {
        logger.debug('Resolved agent route', { channelId: context.channelId, agentId: binding.agentId });
        return binding.agentId;
      }
    }

    logger.debug('Using default agent', { channelId: context.channelId, agentId: this.defaultAgentId });
    return this.defaultAgentId;
  }

  private matchesScope(scope: string, context: RoutingContext): boolean {
    switch (scope) {
      case 'dm':
        return context.isDirectMessage;
      case 'group':
        return !context.isDirectMessage;
      case 'all':
        return true;
      default:
        return false;
    }
  }

  buildSessionKey(context: RoutingContext): string {
    const agentId = this.resolveAgentRoute(context);
    const parts = [agentId, context.channelId, context.senderId];
    if (context.threadId) {
      parts.push(context.threadId);
    }
    return parts.join(':');
  }

  getBindings(channelId?: string): ChannelBinding[] {
    if (channelId) {
      return this.bindings.get(channelId) || [];
    }
    return Array.from(this.bindings.values()).flat();
  }

  setDefaultAgent(agentId: string): void {
    this.defaultAgentId = agentId;
    logger.info('Set default agent', { agentId });
  }
}

export const router = new Router();
