/**
 * Forever Core - Plugin Manager
 * 插件管理器 - 负责插件的注册、初始化和调用
 */

import {
  Plugin,
  PluginType,
  VoicePlugin,
  MemoryPlugin,
  AvatarPlugin,
  EthicsPlugin,
  LLMPlugin,
  PluginConfig,
  PluginStatus,
} from './plugin-interface';
import { LocalMemoryPlugin } from '../memory/local-memory-plugin';

type PluginLifecycleState = 'uninitialized' | 'initializing' | 'ready' | 'error' | 'shutdown' | 'degraded';

interface PluginEntry {
  plugin: Plugin;
  config: PluginConfig;
  state: PluginLifecycleState;
  error?: string;
  initializedAt?: Date;
  retryCount: number;
  lastErrorTime?: Date;
  fallbackId?: string;
}

export class PluginManager {
  private entries: Map<string, PluginEntry> = new Map();
  private pluginsByType: Map<PluginType, Set<string>> = new Map();
  private initializingPlugins: Set<string> = new Set();

  constructor() {
    // 初始化类型映射
    const types: PluginType[] = ['voice', 'memory', 'avatar', 'ethics', 'llm'];
    for (const type of types) {
      this.pluginsByType.set(type, new Set());
    }
    
    // 同步注册本地记忆插件（特殊处理）
    this.registerBuiltInMemoryPlugin();
  }

  private registerBuiltInMemoryPlugin(): void {
    const localMemory = new LocalMemoryPlugin();
    try {
      this.entries.set(localMemory.id, {
        plugin: localMemory,
        config: {},
        state: 'initializing',
        retryCount: 0,
      });
      
      localMemory.initialize({}).then(() => {
        const entry = this.entries.get(localMemory.id);
        if (entry) {
          entry.state = 'ready';
          entry.initializedAt = new Date();
          entry.retryCount = 0;
        }
        const typeSet = this.pluginsByType.get(localMemory.type);
        if (typeSet) typeSet.add(localMemory.id);
        console.log('[PluginManager] 本地记忆插件已同步注册');
      }).catch((err) => {
        const entry = this.entries.get(localMemory.id);
        if (entry) {
          entry.state = 'error';
          entry.error = err instanceof Error ? err.message : String(err);
          entry.retryCount++;
          entry.lastErrorTime = new Date();
        }
        console.warn('[PluginManager] 同步注册本地记忆插件失败:', err);
      });
    } catch (err) {
      console.warn('[PluginManager] 同步注册本地记忆插件失败:', err);
    }
  }
  
  private MAX_RETRY_COUNT = 3;
  private RETRY_DELAY_MS = 5000;
  
  private async retryPlugin(pluginId: string): Promise<boolean> {
    const entry = this.entries.get(pluginId);
    if (!entry) return false;
    
    if (entry.retryCount >= this.MAX_RETRY_COUNT) {
      console.warn(`[PluginManager] Plugin ${pluginId} has reached max retry count`);
      await this.activateFallback(pluginId);
      return false;
    }
    
    try {
      await entry.plugin.shutdown();
    } catch (e) {
      console.warn(`[PluginManager] Error shutting down plugin ${pluginId} before retry:`, e);
    }
    
    const delay = this.RETRY_DELAY_MS * (entry.retryCount + 1);
    console.log(`[PluginManager] Retrying plugin ${pluginId} in ${delay}ms (attempt ${entry.retryCount + 1}/${this.MAX_RETRY_COUNT})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      await entry.plugin.initialize(entry.config);
      entry.state = 'ready';
      entry.error = undefined;
      entry.retryCount = 0;
      entry.lastErrorTime = undefined;
      console.log(`[PluginManager] Plugin ${pluginId} recovered successfully`);
      return true;
    } catch (error) {
      entry.state = 'error';
      entry.error = error instanceof Error ? error.message : String(error);
      entry.retryCount++;
      entry.lastErrorTime = new Date();
      console.error(`[PluginManager] Retry failed for plugin ${pluginId}:`, error);
      return this.retryPlugin(pluginId);
    }
  }
  
  private async activateFallback(pluginId: string): Promise<void> {
    const entry = this.entries.get(pluginId);
    if (!entry) return;
    
    const fallbackId = this.findFallback(pluginId);
    if (fallbackId) {
      entry.fallbackId = fallbackId;
      entry.state = 'degraded';
      console.log(`[PluginManager] Plugin ${pluginId} is now using fallback: ${fallbackId}`);
    } else {
      entry.state = 'error';
      console.warn(`[PluginManager] No fallback available for plugin ${pluginId}`);
    }
  }
  
  private findFallback(pluginId: string): string | undefined {
    const entry = this.entries.get(pluginId);
    if (!entry) return undefined;
    
    const typeSet = this.pluginsByType.get(entry.plugin.type);
    if (!typeSet) return undefined;
    
    for (const id of typeSet) {
      if (id !== pluginId) {
        const candidate = this.entries.get(id);
        if (candidate && candidate.state === 'ready') {
          return id;
        }
      }
    }
    
    return undefined;
  }
  
  async handlePluginError(pluginId: string, error: Error): Promise<void> {
    console.error(`[PluginManager] Plugin error: ${pluginId} - ${error.message}`);
    
    const entry = this.entries.get(pluginId);
    if (!entry) return;
    
    entry.error = error.message;
    entry.lastErrorTime = new Date();
    
    if (entry.state === 'ready') {
      entry.state = 'error';
      
      const typeSet = this.pluginsByType.get(entry.plugin.type);
      if (typeSet) {
        typeSet.delete(pluginId);
      }
      
      await this.retryPlugin(pluginId);
    }
  }

  /**
   * 注册插件
   * @param plugin 插件实例
   * @param config 插件配置
   */
  async register(plugin: Plugin, config: PluginConfig = {}): Promise<void> {
    if (this.entries.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} already registered`);
    }

    if (this.initializingPlugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already being initialized`);
    }

    this.initializingPlugins.add(plugin.id);

    this.entries.set(plugin.id, {
      plugin,
      config,
      state: 'initializing',
      retryCount: 0,
    });

    try {
      await plugin.initialize(config);
      
      const entry = this.entries.get(plugin.id)!;
      entry.state = 'ready';
      entry.initializedAt = new Date();
      entry.retryCount = 0;
      
      const typeSet = this.pluginsByType.get(plugin.type);
      if (typeSet) {
        typeSet.add(plugin.id);
      }

      console.log(`[PluginManager] Plugin ${plugin.name} (${plugin.id}) registered successfully`);
    } catch (error) {
      const entry = this.entries.get(plugin.id)!;
      entry.state = 'error';
      entry.error = error instanceof Error ? error.message : String(error);
      entry.retryCount = 1;
      entry.lastErrorTime = new Date();
      
      console.error(`[PluginManager] Failed to register plugin ${plugin.id}:`, error);
      
      await this.retryPlugin(plugin.id);
    } finally {
      this.initializingPlugins.delete(plugin.id);
    }
  }

  /**
   * 卸载插件
   * @param pluginId 插件ID
   */
  async unregister(pluginId: string): Promise<void> {
    const entry = this.entries.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    try {
      if (entry.state === 'ready') {
        await entry.plugin.shutdown();
      }
      
      const typeSet = this.pluginsByType.get(entry.plugin.type);
      if (typeSet) {
        typeSet.delete(pluginId);
      }
      
      this.entries.delete(pluginId);

      console.log(`[PluginManager] Plugin ${pluginId} unregistered`);
    } catch (error) {
      console.error(`[PluginManager] Error unregistering plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * 重新加载插件
   * @param pluginId 插件ID
   */
  async reload(pluginId: string): Promise<void> {
    const entry = this.entries.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const { plugin, config } = entry;

    await this.unregister(pluginId);
    await this.register(plugin, config);
  }

  /**
   * 获取指定插件
   * @param pluginId 插件ID
   * @param allowFallback 是否允许降级到备用插件
   */
  get<T extends Plugin>(pluginId: string, allowFallback: boolean = true): T | undefined {
    const entry = this.entries.get(pluginId);
    if (!entry) {
      return undefined;
    }
    
    if (entry.state === 'ready') {
      return entry.plugin as T;
    }
    
    if (allowFallback && entry.fallbackId) {
      return this.get<T>(entry.fallbackId, false);
    }
    
    return undefined;
  }

  /**
   * 获取插件条目（包含状态）
   */
  getEntry(pluginId: string): PluginEntry | undefined {
    return this.entries.get(pluginId);
  }

  /**
   * 获取指定类型的所有插件
   * @param type 插件类型
   */
  getByType<T extends Plugin>(type: PluginType): T[] {
    const ids = this.pluginsByType.get(type);
    if (!ids) return [];
    
    return Array.from(ids)
      .map(id => this.entries.get(id))
      .filter((e): e is PluginEntry => e !== undefined && e.state === 'ready')
      .map(e => e.plugin as T);
  }

  /**
   * 获取默认插件（每种类型第一个注册的）
   * @param type 插件类型
   */
  getDefault<T extends Plugin>(type: PluginType): T | undefined {
    const plugins = this.getByType<T>(type);
    return plugins.length > 0 ? plugins[0] : undefined;
  }

  /**
   * 获取语音插件
   */
  getVoicePlugin(id?: string): VoicePlugin | undefined {
    if (id) return this.get<VoicePlugin>(id);
    return this.getDefault<VoicePlugin>('voice');
  }

  /**
   * 获取记忆插件
   */
  getMemoryPlugin(id?: string): MemoryPlugin | undefined {
    if (id) return this.get<MemoryPlugin>(id);
    return this.getDefault<MemoryPlugin>('memory');
  }

  /**
   * 获取头像插件
   */
  getAvatarPlugin(id?: string): AvatarPlugin | undefined {
    if (id) return this.get<AvatarPlugin>(id);
    return this.getDefault<AvatarPlugin>('avatar');
  }

  /**
   * 获取伦理插件
   */
  getEthicsPlugin(id?: string): EthicsPlugin | undefined {
    if (id) return this.get<EthicsPlugin>(id);
    return this.getDefault<EthicsPlugin>('ethics');
  }

  /**
   * 获取LLM插件
   */
  getLLMPlugin(id?: string): LLMPlugin | undefined {
    if (id) return this.get<LLMPlugin>(id);
    return this.getDefault<LLMPlugin>('llm');
  }

  /**
   * 获取所有已注册插件
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.entries.values())
      .filter(e => e.state === 'ready')
      .map(e => e.plugin);
  }

  /**
   * 获取所有插件条目（含状态）
   */
  getAllEntries(): PluginEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * 获取插件数量
   */
  getPluginCount(): number {
    return this.entries.size;
  }

  /**
   * 获取指定类型的插件数量
   */
  getPluginCountByType(type: PluginType): number {
    const set = this.pluginsByType.get(type);
    return set ? set.size : 0;
  }

  /**
   * 检查插件是否存在
   * @param pluginId 插件ID
   */
  has(pluginId: string): boolean {
    return this.entries.has(pluginId);
  }

  /**
   * 检查指定类型是否有插件
   * @param type 插件类型
   */
  hasType(type: PluginType): boolean {
    const set = this.pluginsByType.get(type);
    return set ? set.size > 0 : false;
  }

  /**
   * 获取插件状态
   */
  getPluginStatus(pluginId: string): PluginStatus & { state: PluginLifecycleState; error?: string } {
    const entry = this.entries.get(pluginId);
    if (!entry) {
      return {
        initialized: false,
        ready: false,
        state: 'uninitialized',
        error: 'Plugin not found',
      };
    }

    const baseStatus = entry.plugin.getStatus();
    return {
      ...baseStatus,
      state: entry.state,
      error: entry.error,
    };
  }

  /**
   * 获取所有插件状态
   */
  getAllStatus(): Record<string, ReturnType<PluginManager['getPluginStatus']>> {
    const status: Record<string, ReturnType<PluginManager['getPluginStatus']>> = {};
    for (const id of this.entries.keys()) {
      status[id] = this.getPluginStatus(id);
    }
    return status;
  }

  /**
   * 更新插件配置
   */
  async updateConfig(pluginId: string, config: Partial<PluginConfig>): Promise<void> {
    const entry = this.entries.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const newConfig = { ...entry.config, ...config };
    entry.config = newConfig;

    // 如果插件已就绪，重新初始化
    if (entry.state === 'ready') {
      try {
        await entry.plugin.shutdown();
        await entry.plugin.initialize(newConfig);
        console.log(`[PluginManager] Plugin ${pluginId} reconfigured`);
      } catch (error) {
        entry.state = 'error';
        entry.error = error instanceof Error ? error.message : String(error);
        console.error(`[PluginManager] Failed to reconfigure plugin ${pluginId}:`, error);
        throw error;
      }
    }
  }

  /**
   * 获取插件配置
   */
  getConfig(pluginId: string): PluginConfig | undefined {
    return this.entries.get(pluginId)?.config;
  }

  /**
   * 关闭所有插件
   */
  async shutdownAll(): Promise<void> {
    const promises = Array.from(this.entries.keys()).map(async (id) => {
      try {
        const entry = this.entries.get(id);
        if (entry && entry.state === 'ready') {
          await entry.plugin.shutdown();
          entry.state = 'shutdown';
        }
      } catch (err) {
        console.error(`[PluginManager] Error shutting down plugin ${id}:`, err);
      }
    });

    await Promise.all(promises);
    
    // 清空插件
    this.entries.clear();
    for (const type of this.pluginsByType.keys()) {
      this.pluginsByType.get(type)?.clear();
    }
    
    console.log('[PluginManager] All plugins shutdown');
  }
}

// 单例实例
let globalPluginManager: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!globalPluginManager) {
    globalPluginManager = new PluginManager();
  }
  return globalPluginManager;
}

export function resetPluginManager(): void {
  globalPluginManager = null;
}
