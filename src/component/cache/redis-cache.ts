import { promisify } from 'util';
import zlib from 'zlib';
import { RedisCluster, RedisInstance } from '../redis/enums';
import { IRedisClient } from '../redis/interfaces';
import { Redis } from '../redis/redis';
import Redlock from '../redis/redlock';
import { ICacheConfig } from './interfaces';
import Lru from './lru-holder';
import { hashify } from './utils';

export class RedisCache {

  public static hashify(object: { [x: string]: string | number }, prefix: string) {
    return hashify(object, prefix);
  }
  private prefix = 'CACHE:';
  /** In seconds */
  private expiration = 60 * 10;
  /** In ms */
  private lockDuration = 60 * 1e3;
  private redis = Redis.getConnection(RedisCluster.cache, RedisInstance.master);

  private maxItemsInMemory = 1000;
  private redlock = new Redlock();
  private readonly lru: Lru;

  constructor(config?: ICacheConfig) {
    if (config) {
      if (config.prefix) {
        this.prefix = config.prefix + ':';
      }
      if (config.expiration) {
        this.expiration = config.expiration;
      }
      if (config.lockDuration) {
        this.lockDuration = config.lockDuration * 1e3;
      }
      if (config.maxItemsInMemory) {
        this.maxItemsInMemory = config.maxItemsInMemory;
      }
    }

    this.lru = Lru.getInstance(this.maxItemsInMemory, this.expiration * 1000);
  }

  public async clear() {
    this.lru.reset();
    const keys = await this.redis.keysAsync(`*${this.prefix}*`);
    if (keys.length) {
      const start = keys[0].indexOf(this.prefix);
      const _keys: string[] = [];
      for (const key of keys) {
        _keys.push(key.slice(start));
      }
      await this.redis.delAsync(_keys);
    }
  }

  public async get<T>(key: string, getter: () => Promise<T>): Promise<T> {
    const redisKey = this.getRedisKey(key);

    // Hitting memory cache
    let cachedResult = this.getLruValue(key);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    // Hitting redis replica
    cachedResult = await this.getMasterValue(redisKey);
    if (cachedResult) {
      this.lru.set(key, cachedResult);
      return JSON.parse(cachedResult);
    }

    // Locking redis master
    const lock = await this.getLock(redisKey);
    if (!lock) {
      const result = await getter();
      await this.trySet(key, result);
      return result;
    }

    try {
      // Hitting redis master
      cachedResult = await this.getMasterValue(redisKey);
      if (cachedResult) {
        this.lru.set(key, cachedResult);
        return JSON.parse(cachedResult);
      }

      // Executing callback
      const result = await getter();
      await this.trySet(key, result);
      return result;
    } finally {
      await lock.unlock();
    }
  }

  public hashify(object: { [x: string]: string | number }, prefix: string) {
    return RedisCache.hashify(object, prefix);
  }

  public async invalidate(key: string) {
    this.redis.lpushAsync('invalidate-queue', key);
  }

  public async invalidateJob() {
    const keysToRemove: string[] = [];

    while (true) {
      const key = await this.redis.rpopAsync('invalidate-queue');
      if (!key) {
        break;
      }

      keysToRemove.push(this.getRedisKey(key));
      this.lru.del(key);
    }

    if (keysToRemove.length) {
      await this.redis.delAsync(keysToRemove);
    }
  }

  public async set(key: string, value: any, expiration = 0) {
    const redisKey = this.getRedisKey(key);
    const _value = JSON.stringify(value);
    const compressedValue = await this.compress(_value);
    this.lru.set(key, _value);
    return this.redis.setAsync(redisKey, compressedValue, 'EX', expiration || this.expiration);
  }

  private getLruValue(key: string) {
    return this.lru.get(key) || null;
  }

  private async getMasterValue(redisKey: string) {
    return this.getRedisValue(this.redis, redisKey);
  }

  private async getRedisValue(connection: IRedisClient, redisKey: string) {
    try {
      let result = await connection.getAsync(redisKey);
      if (result) {
        result = await this.decompress(result);
      }

      return result;
    } catch (error) {
      return null;
    }
  }

  private async getLock(prefixedKey: string) {
    try {
      const lock = await this.redlock.lock(prefixedKey + '-lock', this.lockDuration);
      return lock;
    } catch (error) {
      return null;
    }
  }

  private getRedisKey(key: string) {
    return this.prefix + key;
  }

  private async trySet(key: string, value: any) {
    try {
      await this.set(key, value);
    } catch (error) {
    }
  }

  private async compress(input: string) {
    const defalate = promisify(zlib.deflate);
    const defalated = (await defalate(input)) as Buffer;
    return defalated.toString('base64');
  }

  private async decompress(input: string) {
    const inflate = promisify(zlib.inflate);
    const inflated = await inflate(Buffer.alloc(input.length, input, 'base64'));
    return (inflated as Buffer).toString();
  }
}
