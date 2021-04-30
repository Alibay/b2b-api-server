import { newRedisClientSecuredAsync } from './async-client-factory';
import { RedisCacheConfig } from './config/redis-cache.config';
import { RedisConfig } from './config/redis.config';
import { PREFIX } from './constants';
import { RedisCluster, RedisInstance } from './enums';
import { IRedisClient } from './interfaces';
import { IRedisClientAsync } from './types';

export class Redis {
  public static PREFIX = PREFIX;

  public static getConnection(
    cluster: RedisCluster = RedisCluster.cache,
    instance: RedisInstance = RedisInstance.master,
  ): IRedisClient {
    const key = `${cluster}:${instance}`;
    let connection = this.wrappedConnections.get(key);
    if (!connection) {
      connection = this.constructWrapper(cluster, instance);
      this.wrappedConnections.set(key, connection);
    }

    return connection;
  }

  public static async close() {
    await Promise.all([...this.wrappedConnections.values()].map(it => it.quitAsync()));
    this.wrappedConnections.clear();
    this.rawConnections.clear();
  }

  /**
   * For special cases
   * Like when you need to provide a raw redis client for a third party library like redlock
   * Use getInstance in batch apps
   *
   * @static
   * @returns {Promise<IRedisClientAsync>}
   * @memberof Redis
   */
  public static getRawConnection(
    cluster: RedisCluster = RedisCluster.cache,
    instance: RedisInstance = RedisInstance.master,
  ): Promise<IRedisClientAsync> {
    const key = `${cluster}:${instance}`;
    let client = this.rawConnections.get(key);

    if (!client) {
      const config = this.getConfig(cluster, instance);
      client = newRedisClientSecuredAsync(config);

      this.rawConnections.set(key, client);
    }

    return client;
  }

  protected static constructWrapper(cluster: RedisCluster, instance: RedisInstance) {
    const clientPromise = Redis.getRawConnection(cluster, instance);
    const proxy = new Proxy(clientPromise, {
      get(target, p: keyof IRedisClient) {
        if (p.endsWith('Async')) {
          return async function(...args: any[]) {
            const client = await target;
            return (client[p] as any)(...args);
          };
        } else {
          return (target as any)[p].bind(target);
        }
      },
    });

    return (proxy as any) as IRedisClient;
  }

  private static wrappedConnections = new Map<string, IRedisClient>();
  private static rawConnections = new Map<string, Promise<IRedisClientAsync>>();

  private static getConfig(_cluster: RedisCluster, _instance: RedisInstance): RedisConfig {
    return new RedisCacheConfig();
  }
}
