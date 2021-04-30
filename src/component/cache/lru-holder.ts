import Lru from 'lru-cache';

export default class LruCache extends Lru<string, string> {
  public static getInstance(maxItemsInMemory: number, expiration: number): Lru<string, string> {
    if (!this.instance) {
      this.instance = new LruCache(maxItemsInMemory, expiration);
    }

    return this.instance;
  }

  private static instance: LruCache;

  protected constructor(maxItemsInMemory: number, expiration: number) {
    super({
      max: maxItemsInMemory,
      maxAge: expiration,
      updateAgeOnGet: true,
    });
  }
}
