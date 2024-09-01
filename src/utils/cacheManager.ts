export class CacheManager {
 private cache: Map<string, any> = new Map();

 async getOrSet<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
   if (this.cache.has(key)) {
     return this.cache.get(key);
   }
   const value = await fetcher();
   this.cache.set(key, value);
   return value;
 }
}

