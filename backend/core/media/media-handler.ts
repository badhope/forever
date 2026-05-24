import fs from 'fs';
import path from 'path';
import { getLogger } from '../infrastructure/logging';

const logger = getLogger('media-handler');

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  size: number;
  data?: Buffer;
  url?: string;
  storagePath?: string;
  createdAt: Date;
  ttl?: Date;
  metadata: Record<string, any>;
}

export interface MediaStoreConfig {
  storageDir: string;
  maxFileSize: number;
  defaultTTL: number;
  allowedMimeTypes: string[];
}

const DEFAULT_CONFIG: MediaStoreConfig = {
  storageDir: './data/media',
  maxFileSize: 50 * 1024 * 1024,
  defaultTTL: 7 * 24 * 60 * 60 * 1000,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'text/plain',
  ],
};

export class MediaStore {
  private config: MediaStoreConfig;
  private files: Map<string, MediaFile> = new Map();
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<MediaStoreConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureStorageDir();
    this.startCleanupTimer();
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.config.storageDir)) {
      fs.mkdirSync(this.config.storageDir, { recursive: true });
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, 60 * 60 * 1000);
  }

  detectMimeType(filename: string, buffer?: Buffer): string {
    const ext = path.extname(filename).toLowerCase();
    const extToMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
    };
    return extToMime[ext] || 'application/octet-stream';
  }

  getMediaType(mimeType: string): MediaFile['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return 'document';
    return 'other';
  }

  async storeMedia(
    name: string,
    data: Buffer,
    options?: { ttl?: number; metadata?: Record<string, any> }
  ): Promise<MediaFile> {
    const mimeType = this.detectMimeType(name, data);
    const type = this.getMediaType(mimeType);

    if (!this.config.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`MIME type ${mimeType} not allowed`);
    }

    if (data.length > this.config.maxFileSize) {
      throw new Error(`File too large (max ${this.config.maxFileSize} bytes)`);
    }

    const id = `media_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const storagePath = path.join(this.config.storageDir, id + path.extname(name));
    const ttl = options?.ttl ? new Date(Date.now() + options.ttl) : new Date(Date.now() + this.config.defaultTTL);

    fs.writeFileSync(storagePath, data);

    const file: MediaFile = {
      id,
      name,
      type,
      mimeType,
      size: data.length,
      storagePath,
      createdAt: new Date(),
      ttl,
      metadata: options?.metadata || {},
    };

    this.files.set(id, file);
    logger.info('Stored media', { id, name, type, size: data.length });
    return file;
  }

  async getMedia(id: string): Promise<MediaFile | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;

    if (file.ttl && new Date() > file.ttl) {
      this.deleteMedia(id);
      return undefined;
    }

    if (file.storagePath && fs.existsSync(file.storagePath)) {
      file.data = fs.readFileSync(file.storagePath);
    }

    return file;
  }

  async deleteMedia(id: string): Promise<void> {
    const file = this.files.get(id);
    if (file?.storagePath && fs.existsSync(file.storagePath)) {
      fs.unlinkSync(file.storagePath);
    }
    this.files.delete(id);
    logger.info('Deleted media', { id });
  }

  private cleanupExpired(): void {
    const now = new Date();
    for (const [id, file] of this.files.entries()) {
      if (file.ttl && now > file.ttl) {
        this.deleteMedia(id);
      }
    }
    logger.debug('Cleaned up expired media');
  }

  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

export const mediaStore = new MediaStore();
