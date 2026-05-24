
/**
 * Forever AI - 数据库配置
 * 支持 SQLite (开发) 和 PostgreSQL (生产)
 */

export interface DatabaseConfig {
  provider: 'sqlite' | 'postgresql';
  url: string;
  logging?: boolean;
  pool?: {
    min: number;
    max: number;
  };
}

export interface VectorDBConfig {
  provider: 'qdrant' | 'chroma' | 'pinecone';
  url: string;
  apiKey?: string;
  collectionName?: string;
}

export interface EmbeddingConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  dimensions?: number;
  apiKey: string;
}

export interface DatabaseConnections {
  sql: DatabaseConfig;
  vector: VectorDBConfig;
  embedding: EmbeddingConfig;
}

export const databaseConfig: DatabaseConnections = {
  sql: {
    provider: process.env.NODE_ENV === 'production' ? 'postgresql' : 'sqlite',
    url: process.env.DATABASE_URL || 'file:./dev.db',
    logging: process.env.NODE_ENV !== 'production',
    pool: {
      min: 5,
      max: 20,
    },
  },
  vector: {
    provider: (process.env.VECTOR_DB_PROVIDER as any) || 'qdrant',
    url: process.env.VECTOR_DB_URL || 'http://localhost:6333',
    apiKey: process.env.VECTOR_DB_API_KEY,
    collectionName: process.env.VECTOR_COLLECTION || 'forever_knowledge',
  },
  embedding: {
    provider: 'openai',
    model: 'text-embedding-ada-002',
    dimensions: 1536,
    apiKey: process.env.OPENAI_API_KEY || '',
  },
};

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private initialized = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    logInfo('database', 'Initializing database connection', {
      provider: databaseConfig.sql.provider,
    });

    this.initialized = true;
    logInfo('database', 'Database connection initialized');
  }

  async close(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    logInfo('database', 'Closing database connection');
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const dbConnection = DatabaseConnection.getInstance();

function logInfo(module: string, message: string, data?: any) {
  console.log(`[${module}] ${message}`, data || '');
}
