import NodeCache from 'node-cache';

class CacheService {
  private cache: NodeCache;

  constructor(ttlSeconds: number = 3600) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  // Cache decorator for methods
  static cache(ttl?: number) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;
      const cache = new NodeCache({ stdTTL: ttl || 300 });

      descriptor.value = async function (...args: any[]) {
        const key = `${propertyKey}:${JSON.stringify(args)}`;
        const cached = cache.get(key);

        if (cached) {
          return cached;
        }

        const result = await originalMethod.apply(this, args);
        cache.set(key, result);
        return result;
      };

      return descriptor;
    };
  }
}

export const cache = new CacheService();
export { CacheService };