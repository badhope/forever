import { EventEmitter } from 'eventemitter3';
import { router, RoutingContext } from './routing';
import { getLogger } from '../infrastructure/logging';
import { securityManager } from '../infrastructure';

const logger = getLogger('auto-reply');

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  metadata: Record<string, any>;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url?: string;
  data?: Buffer;
  mimeType: string;
  filename?: string;
}

export interface Directive {
  type: 'skip' | 'delegate' | 'require_approval' | 'modify';
  reason?: string;
  targetAgentId?: string;
  modifiedContent?: string;
}

export interface Command {
  name: string;
  args: string[];
  message: Message;
}

export interface PipelineContext {
  message: Message;
  routingContext: RoutingContext;
  sessionKey: string;
  agentId: string;
  directives: Directive[];
  commands: Command[];
  metadata: Record<string, any>;
}

export type PipelineStage = 'dispatch' | 'directives' | 'commands' | 'agent_run' | 'delivery';

export class AutoReplyPipeline extends EventEmitter {
  private directiveHandlers: Array<(ctx: PipelineContext) => Directive | null> = [];
  private commandHandlers: Map<string, (cmd: Command, ctx: PipelineContext) => Promise<any>> = new Map();
  private agentRunner?: (ctx: PipelineContext) => Promise<string>;
  private deliveryHandler?: (response: string, ctx: PipelineContext) => Promise<void>;

  constructor() {
    super();
  }

  addDirectiveHandler(handler: (ctx: PipelineContext) => Directive | null): void {
    this.directiveHandlers.push(handler);
  }

  addCommandHandler(name: string, handler: (cmd: Command, ctx: PipelineContext) => Promise<any>): void {
    this.commandHandlers.set(name, handler);
  }

  setAgentRunner(runner: (ctx: PipelineContext) => Promise<string>): void {
    this.agentRunner = runner;
  }

  setDeliveryHandler(handler: (response: string, ctx: PipelineContext) => Promise<void>): void {
    this.deliveryHandler = handler;
  }

  async processMessage(message: Message, routingContext: RoutingContext): Promise<void> {
    const sessionKey = router.buildSessionKey(routingContext);
    const agentId = router.resolveAgentRoute(routingContext);

    const ctx: PipelineContext = {
      message,
      routingContext,
      sessionKey,
      agentId,
      directives: [],
      commands: [],
      metadata: {},
    };

    try {
      this.emit('stage_start', 'dispatch', ctx);
      await this.stageDispatch(ctx);
      this.emit('stage_complete', 'dispatch', ctx);

      if (this.shouldSkip(ctx)) return;

      this.emit('stage_start', 'directives', ctx);
      await this.stageDirectives(ctx);
      this.emit('stage_complete', 'directives', ctx);

      if (this.shouldSkip(ctx)) return;

      this.emit('stage_start', 'commands', ctx);
      await this.stageCommands(ctx);
      this.emit('stage_complete', 'commands', ctx);

      if (this.shouldSkip(ctx)) return;

      this.emit('stage_start', 'agent_run', ctx);
      const response = await this.stageAgentRun(ctx);
      this.emit('stage_complete', 'agent_run', ctx);

      this.emit('stage_start', 'delivery', ctx);
      await this.stageDelivery(response, ctx);
      this.emit('stage_complete', 'delivery', ctx);

      this.emit('pipeline_complete', ctx);
    } catch (error) {
      logger.error('Pipeline error', { error, messageId: message.id });
      this.emit('pipeline_error', error, ctx);
      throw error;
    }
  }

  private async stageDispatch(ctx: PipelineContext): Promise<void> {
    logger.debug('Dispatch stage', { messageId: ctx.message.id, agentId: ctx.agentId });
    securityManager.audit('ssrf', 'message_dispatched', { messageId: ctx.message.id, agentId: ctx.agentId }, ctx.routingContext.senderId);
  }

  private async stageDirectives(ctx: PipelineContext): Promise<void> {
    for (const handler of this.directiveHandlers) {
      const directive = handler(ctx);
      if (directive) {
        ctx.directives.push(directive);
        logger.debug('Directive applied', { type: directive.type, messageId: ctx.message.id });
      }
    }
  }

  private async stageCommands(ctx: PipelineContext): Promise<void> {
    const commands = this.extractCommands(ctx.message);
    ctx.commands = commands;

    for (const cmd of commands) {
      const handler = this.commandHandlers.get(cmd.name);
      if (handler) {
        logger.debug('Executing command', { command: cmd.name, messageId: ctx.message.id });
        await handler(cmd, ctx);
      }
    }
  }

  private extractCommands(message: Message): Command[] {
    const commands: Command[] = [];
    const content = message.content.trim();

    if (content.startsWith('/')) {
      const parts = content.slice(1).split(/\s+/);
      const name = parts[0].toLowerCase();
      const args = parts.slice(1);
      commands.push({ name, args, message });
    }

    return commands;
  }

  private async stageAgentRun(ctx: PipelineContext): Promise<string> {
    if (!this.agentRunner) {
      throw new Error('No agent runner configured');
    }

    logger.debug('Running agent', { agentId: ctx.agentId, messageId: ctx.message.id });
    return this.agentRunner(ctx);
  }

  private async stageDelivery(response: string, ctx: PipelineContext): Promise<void> {
    if (!this.deliveryHandler) {
      logger.warn('No delivery handler configured, skipping delivery');
      return;
    }

    logger.debug('Delivering response', { messageId: ctx.message.id });
    await this.deliveryHandler(response, ctx);
  }

  private shouldSkip(ctx: PipelineContext): boolean {
    return ctx.directives.some(d => d.type === 'skip' || d.type === 'require_approval');
  }
}

export const autoReplyPipeline = new AutoReplyPipeline();

export function createSkipDirective(reason: string): Directive {
  return { type: 'skip', reason };
}

export function createDelegateDirective(targetAgentId: string, reason?: string): Directive {
  return { type: 'delegate', targetAgentId, reason };
}

export function createApprovalDirective(reason: string): Directive {
  return { type: 'require_approval', reason };
}

export function createModifyDirective(modifiedContent: string, reason?: string): Directive {
  return { type: 'modify', modifiedContent, reason };
}
