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
} from './plugin-interface';

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private pluginsByType: Map<PluginType, Set<string>> = new Map();
  private configs: Map<string, PluginConfig> = new Map();

  constructor() {
    // 初始化类型映射
    const types: PluginType[] = ['voice', 'memory', 'avatar', 'ethics', 'llm'];
    for (const type of types) {
      this.pluginsByType.set(type, new Set());
    }
  }

  /**
   * 注册插件
   * @param plugin 插件实例
   * @param config 插件配置
   */
  async register(plugin: Plugin, config: PluginConfig = {}): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} already registered`);
    }

    try {
      // 初始化插件
      await plugin.initialize(config);
      
      // 存储插件
      this.plugins.set(plugin.id, plugin);
      this.configs.set(plugin.id, config);
      
      // 按类型索引
      const typeSet = this.pluginsByType.get(plugin.type);
      if (typeSet) {
        typeSet.add(plugin.id);
      }

      console.log(`[PluginManager] Plugin ${plugin.name} (${plugin.id}) registered successfully`);
    } catch (error) {
      console.error(`[PluginManager] Failed to register plugin ${plugin.id}:`, error);
      throw error;
    }
  }

  /**
   * 卸载插件
   * @param pluginId 插件ID
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    try {
      // 关闭插件
      await plugin.shutdown();
      
      // 移除索引
      const typeSet = this.pluginsByType.get(plugin.type);
      if (typeSet) {
        typeSet.delete(pluginId);
      }
      
      // 移除存储
      this.plugins.delete(pluginId);
      this.configs.delete(pluginId);

      console.log(`[PluginManager] Plugin ${pluginId} unregistered`);
    } catch (error) {
      console.error(`[PluginManager] Error unregistering plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * 获取指定插件
   * @param pluginId 插件ID
   */
  get<T extends Plugin>(pluginId: string): T | undefined {
    return this.plugins.get(pluginId) as T;
  }

  /**
   * 获取指定类型的所有插件
   * @param type 插件类型
   */
  getByType<T extends Plugin>(type: PluginType): T[] {
    const ids = this.pluginsByType.get(type);
    if (!ids) return [];
    
    return Array.from(ids)
      .map(id => this.plugins.get(id))
      .filter((p): p is T => p !== undefined && p.type === type);
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
    return Array.from(this.plugins.values());
  }

  /**
   * 获取插件数量
   */
  getPluginCount(): number {
    return this.plugins.size;
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
    return this.plugins.has(pluginId);
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
   * 获取所有插件状态
   */
  getAllStatus(): Record<string, ReturnType<Plugin['getStatus']>> {
    const status: Record<string, ReturnType<Plugin['getStatus']>> = {};
    for (const [id, plugin] of this.plugins) {
      status[id] = plugin.getStatus();
    }
    return status;
  }

  /**
   * 关闭所有插件
   */
  async shutdownAll(): Promise<void> {
    const promises = Array.from(this.plugins.keys()).map(id => 
      this.unregister(id).catch(err => {
        console.error(`[PluginManager] Error shutting down plugin ${id}:`, err);
      })
    );
    await Promise.all(promises);
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
