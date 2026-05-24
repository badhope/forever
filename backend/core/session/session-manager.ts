/**
 * Forever Core - Session Manager
 * 会话管理器 - 负责会话的生命周期管理
 */

import {
  SessionState,
  SessionConfig,
  SessionManagerConfig,
  SessionEvent,
  SessionEventListener,
  Message,
  SessionMetadata,
} from './types';
import { LocalSessionStorage } from './local-storage';
import { EmotionDynamicsEngine } from '../personality/emotion-engine';
import {
  OceanPersonality,
  DEFAULT_OCEAN_PERSONALITY,
  DEFAULT_BASELINE_PAD,
  EmotionLabel,
  EmotionIntensity,
} from '../personality/personality-types';

const DEFAULT_CONFIG: SessionConfig = {
  maxHistory: 100,
  enableEmotion: true,
  enableMemory: true,
  autoSaveInterval: 30000,
  emotionDecayRate: {
    pleasure: 0.15,
    arousal: 0.35,
    dominance: 0.08,
  },
};

export class SessionManager {
  private sessions: Map<string, SessionState> = new Map();
  private emotionEngines: Map<string, EmotionDynamicsEngine> = new Map();
  private listeners: Map<string, Set<SessionEventListener>> = new Map();
  private storage: LocalSessionStorage;
  private config: SessionManagerConfig;
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config?: Partial<SessionManagerConfig>) {
    this.config = {
      defaultConfig: DEFAULT_CONFIG,
      autoSave: config?.autoSave ?? true,
      storage: config?.storage,
    };

    this.storage = this.config.storage as LocalSessionStorage || new LocalSessionStorage();
    console.log('[SessionManager] Initialized');
  }

  // ==================== 事件管理 ====================

  on(eventType: SessionEvent['type'], listener: SessionEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  private emit(event: SessionEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('[SessionManager] Listener error:', error);
        }
      });
    }
  }

  // ==================== 会话管理 ====================

  async createSession(
    userId: string,
    characterId: string,
    options?: {
      metadata?: Partial<SessionMetadata>;
      oceanPersonality?: OceanPersonality;
      config?: Partial<SessionConfig>;
    }
  ): Promise<SessionState> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();

    const baselinePAD = DEFAULT_BASELINE_PAD;
    const emotionEngine = new EmotionDynamicsEngine(baselinePAD);
    const currentEmotion = {
      label: emotionEngine.getEmotionLabel(),
      intensity: emotionEngine.getEmotionIntensity(),
      pad: emotionEngine.getCurrentEmotion(),
      timestamp: now,
    };

    const session: SessionState = {
      id: sessionId,
      userId,
      characterId,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      isActive: true,
      messageCount: 0,
      currentEmotion,
      emotionHistory: [currentEmotion],
      context: {},
      oceanPersonality: options?.oceanPersonality || DEFAULT_OCEAN_PERSONALITY,
      metadata: {
        ...options?.metadata,
        customFields: {
          ...options?.metadata?.customFields,
          ...(options?.config || {}),
        },
      },
    };

    this.sessions.set(sessionId, session);
    this.emotionEngines.set(sessionId, emotionEngine);

    await this.storage.save(session);

    // 设置自动保存
    if (this.config.autoSave) {
      this.setupAutoSave(sessionId);
    }

    this.emit({
      type: 'created',
      sessionId,
      timestamp: now,
      data: session,
    });

    console.log(`[SessionManager] Created session: ${sessionId}`);
    return session;
  }

  async getSession(sessionId: string): Promise<SessionState | undefined> {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = await this.storage.load(sessionId) || undefined;
      if (session) {
        this.sessions.set(sessionId, session);

        // 恢复情绪引擎
        const emotionEngine = new EmotionDynamicsEngine(session.currentEmotion.pad);
        this.emotionEngines.set(sessionId, emotionEngine);

        if (this.config.autoSave) {
          this.setupAutoSave(sessionId);
        }
      }
    }

    return session;
  }

  async getOrCreateSession(
    userId: string,
    characterId: string,
    options?: Parameters<typeof this.createSession>[2]
  ): Promise<SessionState> {
    const existingSessions = await this.listSessionsByUser(userId);
    const latestSession = existingSessions
      .filter(s => s.characterId === characterId && s.isActive)
      .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime())[0];

    if (latestSession) {
      return this.activateSession(latestSession.id);
    }

    return this.createSession(userId, characterId, options);
  }

  async activateSession(sessionId: string): Promise<SessionState> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.isActive = true;
    session.lastActiveAt = new Date();
    this.sessions.set(sessionId, session);

    this.emit({
      type: 'active',
      sessionId,
      timestamp: new Date(),
      data: session,
    });

    return session;
  }

  async deactivateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.isActive = false;
    this.sessions.set(sessionId, session);

    this.clearAutoSave(sessionId);
    await this.storage.save(session);

    this.emit({
      type: 'inactive',
      sessionId,
      timestamp: new Date(),
      data: session,
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.clearAutoSave(sessionId);
    this.sessions.delete(sessionId);
    this.emotionEngines.delete(sessionId);
    await this.storage.delete(sessionId);

    this.emit({
      type: 'deleted',
      sessionId,
      timestamp: new Date(),
    });

    console.log(`[SessionManager] Deleted session: ${sessionId}`);
  }

  async listSessionsByUser(userId: string): Promise<SessionState[]> {
    return this.storage.listByUser(userId);
  }

  async listSessionsByCharacter(characterId: string): Promise<SessionState[]> {
    return this.storage.listByCharacter(characterId);
  }

  async searchSessions(query: string, options?: any): Promise<SessionState[]> {
    return this.storage.search(query, options);
  }

  // ==================== 消息管理 ====================

  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Message['metadata']
  ): Promise<Message> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      metadata,
    };

    await this.storage.addMessage(sessionId, message);

    session.messageCount++;
    session.lastActiveAt = new Date();
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);
    await this.storage.save(session);

    this.emit({
      type: 'messageAdded',
      sessionId,
      timestamp: new Date(),
      data: message,
    });

    return message;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return this.storage.getMessages(sessionId);
  }

  // ==================== 情绪管理 ====================

  async updateEmotion(sessionId: string, userInput?: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    const emotionEngine = this.emotionEngines.get(sessionId);

    if (!session || !emotionEngine) return;

    if (userInput) {
      emotionEngine.updateFromText(userInput);
    } else {
      emotionEngine.update({ pleasure: 0, arousal: 0, dominance: 0 });
    }

    const newEmotion = {
      label: emotionEngine.getEmotionLabel(),
      intensity: emotionEngine.getEmotionIntensity(),
      pad: emotionEngine.getCurrentEmotion(),
      timestamp: new Date(),
    };

    session.currentEmotion = newEmotion;
    session.emotionHistory.push(newEmotion);

    // 限制历史记录数量
    if (session.emotionHistory.length > 100) {
      session.emotionHistory = session.emotionHistory.slice(-100);
    }

    session.updatedAt = new Date();
    session.lastActiveAt = new Date();
    this.sessions.set(sessionId, session);
    await this.storage.save(session);

    this.emit({
      type: 'emotionChanged',
      sessionId,
      timestamp: new Date(),
      data: newEmotion,
    });
  }

  setEmotion(sessionId: string, label: EmotionLabel, intensity: EmotionIntensity = 'medium'): void {
    const session = this.sessions.get(sessionId);
    const emotionEngine = this.emotionEngines.get(sessionId);

    if (!session || !emotionEngine) return;

    // 这里需要根据标签设置相应的PAD值
    const emotionPAD = this.getEmotionPAD(label, intensity);
    emotionEngine.setBaselinePAD(emotionPAD);
    
    const newEmotion = {
      label,
      intensity,
      pad: emotionPAD,
      timestamp: new Date(),
    };

    session.currentEmotion = newEmotion;
    session.emotionHistory.push(newEmotion);
  }

  private getEmotionPAD(label: EmotionLabel, intensity: EmotionIntensity): any {
    const intensityFactor = intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.6 : 1.0;
    const basePADs: Record<EmotionLabel, any> = {
      peaceful: { pleasure: 0.2, arousal: -0.2, dominance: 0.0 },
      worried: { pleasure: -0.3, arousal: 0.5, dominance: -0.1 },
      nostalgic: { pleasure: 0.0, arousal: -0.3, dominance: -0.2 },
      caring: { pleasure: 0.3, arousal: 0.1, dominance: 0.1 },
      chiding: { pleasure: -0.1, arousal: 0.3, dominance: 0.2 },
      sad: { pleasure: -0.5, arousal: -0.2, dominance: -0.3 },
      joyful: { pleasure: 0.6, arousal: 0.3, dominance: 0.1 },
      happy: { pleasure: 0.6, arousal: 0.4, dominance: 0.2 },
      angry: { pleasure: -0.7, arousal: 0.8, dominance: 0.6 },
      anxious: { pleasure: -0.4, arousal: 0.6, dominance: -0.3 },
      excited: { pleasure: 0.5, arousal: 0.7, dominance: 0.3 },
      tired: { pleasure: -0.2, arousal: -0.5, dominance: -0.2 },
      surprised: { pleasure: 0.3, arousal: 0.6, dominance: 0.1 },
      disappointed: { pleasure: -0.5, arousal: -0.2, dominance: -0.3 },
      hopeful: { pleasure: 0.4, arousal: 0.2, dominance: 0.2 },
      regretful: { pleasure: -0.4, arousal: -0.2, dominance: -0.2 },
    };

    const base = basePADs[label];
    return {
      pleasure: base.pleasure * intensityFactor,
      arousal: base.arousal * intensityFactor,
      dominance: base.dominance * intensityFactor,
    };
  }

  getVoiceEmotionConfig(sessionId: string): { pitchShift: number; rateMultiplier: number; volumeMultiplier: number; style: string } {
    const emotionEngine = this.emotionEngines.get(sessionId);
    if (!emotionEngine) {
      return {
        pitchShift: 0,
        rateMultiplier: 1.0,
        volumeMultiplier: 1.0,
        style: 'neutral',
      };
    }
    return emotionEngine.getVoiceEmotionConfig();
  }

  // ==================== 自动保存 ====================

  private setupAutoSave(sessionId: string): void {
    this.clearAutoSave(sessionId);

    const interval = DEFAULT_CONFIG.autoSaveInterval || 30000;
    const timer = setInterval(async () => {
      const session = this.sessions.get(sessionId);
      if (session) {
        await this.storage.save(session);
      }
    }, interval);

    this.autoSaveTimers.set(sessionId, timer);
  }

  private clearAutoSave(sessionId: string): void {
    const timer = this.autoSaveTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.autoSaveTimers.delete(sessionId);
    }
  }

  async saveSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      await this.storage.save(session);
    }
  }

  async saveAll(): Promise<void> {
    const promises = Array.from(this.sessions.keys()).map(id => this.saveSession(id));
    await Promise.all(promises);
  }

  async shutdown(): Promise<void> {
    this.autoSaveTimers.forEach(timer => clearInterval(timer));
    this.autoSaveTimers.clear();
    await this.saveAll();
    console.log('[SessionManager] Shutdown complete');
  }
}

let globalSessionManager: SessionManager | null = null;

export function getSessionManager(config?: Partial<SessionManagerConfig>): SessionManager {
  if (!globalSessionManager) {
    globalSessionManager = new SessionManager(config);
  }
  return globalSessionManager;
}

export function resetSessionManager(): void {
  if (globalSessionManager) {
    globalSessionManager.shutdown();
    globalSessionManager = null;
  }
}
