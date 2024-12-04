import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ProcessedMetrics, MetricsCacheEntry } from '../types/metrics';

interface MetricsDB extends DBSchema {
  metrics: {
    key: string;
    value: MetricsCacheEntry;
  };
}

export class MetricsCache {
  private db: IDBPDatabase<MetricsDB> | null = null;
  private static instance: MetricsCache;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  private constructor() {}

  static getInstance(): MetricsCache {
    if (!MetricsCache.instance) {
      MetricsCache.instance = new MetricsCache();
    }
    return MetricsCache.instance;
  }

  async initialize() {
    try {
      this.db = await openDB<MetricsDB>('metrics-cache', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('metrics')) {
            db.createObjectStore('metrics');
          }
        },
      });
      console.log('MetricsCache initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MetricsCache:', error);
      throw error;
    }
  }

  async cacheMetrics(repoFullName: string, metrics: ProcessedMetrics) {
    if (!this.db) throw new Error('Cache not initialized');
    
    try {
      await this.db.put('metrics', {
        data: metrics,
        timestamp: Date.now()
      }, repoFullName);
      
      console.log(`Cached metrics for ${repoFullName}`);
    } catch (error) {
      console.error('Failed to cache metrics:', error);
      throw error;
    }
  }

  async getMetrics(repoFullName: string): Promise<ProcessedMetrics | null> {
    if (!this.db) throw new Error('Cache not initialized');
    
    try {
      const cached = await this.db.get('metrics', repoFullName);
      
      if (!cached || Date.now() - cached.timestamp > this.CACHE_DURATION) {
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.error('Failed to retrieve cached metrics:', error);
      return null;
    }
  }

  async clearCache(repoFullName?: string) {
    if (!this.db) throw new Error('Cache not initialized');
    
    try {
      if (repoFullName) {
        await this.db.delete('metrics', repoFullName);
        console.log(`Cleared cache for ${repoFullName}`);
      } else {
        await this.db.clear('metrics');
        console.log('Cleared entire metrics cache');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  async getAllCachedRepos(): Promise<string[]> {
    if (!this.db) throw new Error('Cache not initialized');
    
    try {
      return await this.db.getAllKeys('metrics');
    } catch (error) {
      console.error('Failed to get cached repos:', error);
      return [];
    }
  }
} 