import bluebird from 'bluebird';
import Redis from 'redis';
import { getDefaultRedisClient, getDefaultRedisClientSecured, newRedisClient, newRedisClientSecured } from './client-factory';
import { IRedisClientAsync, RedisClientFactoryOpts } from './types';

bluebird.promisifyAll(Redis.RedisClient.prototype);
bluebird.promisifyAll(Redis.Multi.prototype);

export function getDefaultRedisClientAsync(options?: RedisClientFactoryOpts): IRedisClientAsync {
  return getDefaultRedisClient(options) as IRedisClientAsync;
}

export function newRedisClientAsync(options?: RedisClientFactoryOpts): IRedisClientAsync {
  return newRedisClient(options) as IRedisClientAsync;
}

export async function getDefaultRedisClientSecuredAsync(options?: RedisClientFactoryOpts): Promise<IRedisClientAsync> {
  const client = await getDefaultRedisClientSecured(options);
  return client as IRedisClientAsync;
}

export async function newRedisClientSecuredAsync(options?: RedisClientFactoryOpts): Promise<IRedisClientAsync> {
  const client = await newRedisClientSecured(options);
  return client as IRedisClientAsync;
}
