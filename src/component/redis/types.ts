import { ClientOpts, RedisClient } from 'redis';

export const TIMEOUTS_DEFAULT = [1000, 2500, 2500, 5000, 10000];

export interface LoggerLike {
  warn: Function;
  info: Function;
  error: Function;
  log: Function;
}

export interface RedisClientConnectOpts {
  connect_timeout?: number;
  create_connected?: boolean;
}

export interface RedisClientFactoryOpts extends RedisClientConnectOpts {
  redisClientOptions?: ClientOpts;
  retry_method?: 'wrapper' | 'redis' | 'none';
  retry_timeouts?: string | number[];
  protocol?: string;
  logger?: LoggerLike;
  onCreate?: (client: RedisClient, options: RedisClientFactoryOpts) => void;
  host?: string;
  port?: number;
  password?: string;
  tls?: boolean;
  prefix?: string;
}

export interface IRedisClientAsync extends RedisClient {
  delAsync(key: string | number | Array<string | number>): Promise<number>;
  getAsync<T extends string>(key: string | number): Promise<T | null>;
  setAsync(key: string | number, value: string | number): Promise<'OK'>;
  setAsync(
    key: string | number,
    value: string | number,
    mode: string,
    duration: number,
  ): Promise<'OK' | undefined>;
  expireAsync(key: string | number, expiration: number): Promise<1 | 0>;
  // hashes
  hdelAsync(key: string | number, field: string | number): Promise<1 | 0>;
  hgetAsync<T extends string>(key: string | number, field: string | number): Promise<T | null>;
  hgetallAsync<T extends object>(key: string | number): Promise<T | null>;
  hincrbyAsync(key: string, prop: string, amount: number): Promise<number>;
  hmsetAsync(key: string | number, object: object): Promise<'OK'>;
  hsetAsync(key: string | number, field: string | number, value: string | number): Promise<'OK'>;
  // sets
  saddAsync(key: string | number, values: Array<string | number> | string | number): Promise<1 | 0>;
  scardAsync(key: string | number): Promise<number>;
  sdiffAsync(first: string, second: string): Promise<string[]>;
  sinterAsync(keys: Array<string | number>): Promise<string[]>;
  sismemberAsync(key: string | number, value: string | number): Promise<0 | 1>;
  smembersAsync<T extends string>(key: string): Promise<T[]>;
  spopAsync<T extends string>(key: string): Promise<T | null>;
  sremAsync(key: string, item: string): Promise<0 | 1>;
  [x: string]: any;
}
