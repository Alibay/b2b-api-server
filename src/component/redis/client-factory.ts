import assert from 'assert';
import Redis, { ClientOpts, RedisClient } from 'redis';
import { getRetryStrategy } from './retry-strategy';
import {
  LoggerLike,
  RedisClientConnectOpts,
  RedisClientFactoryOpts,
  TIMEOUTS_DEFAULT,
} from './types';

const isTrue = (s: string | undefined) => {
  const v = (s || '').toUpperCase();
  return v === 'TRUE' || v === 'YES';
};

function ensureLogger(logger?: LoggerLike): LoggerLike {
  const l = logger || console;
  l.error = l.error || console.error;
  l.warn = l.warn || console.warn;
  l.log = l.log || console.log;
  return l;
}

function validateClientOpts(o: ClientOpts) {
  assert(o, 'options not defined');
  assert(o.host, 'host not defined');
  assert(o.port, 'port not defined');
}

let clientsCache = new Map<string, RedisClient>();
const getCacheKey = (o: ClientOpts) => `${o.host}:${o.port}`;

function _newRedisClient(o: RedisClientFactoryOpts): RedisClient {
  const co = o.redisClientOptions as ClientOpts;

  if (o && o.logger && co) {
    o.logger.info(
      `AUTH for ${co.host}:${co.port} ${co.password ? 'ENABLED' : 'DISABLED'}.`
    );
  }

  let result: RedisClient | null = null;
  if (o.protocol && co && co.host) {
    const redisUrl = `${o.protocol}://${co.host}`;
    result = Redis.createClient(redisUrl, co);
  } else if (co) {
    result = Redis.createClient(co);
  } else {
    throw new Error('Illegal redis options');
  }
  if (o.onCreate) { o.onCreate(result as RedisClient, o); }
  return result;
}

function ensureConnected(
  opts: Partial<RedisClientConnectOpts>,
  client: RedisClient
): Promise<RedisClient> {
  opts = opts || {};
  let t: NodeJS.Timeout | null = null;

  const promise = new Promise<RedisClient>(async (resolve, reject) => {
    if (opts.create_connected === false) {
      return resolve(client);
    }

    const connectTimeout = opts.connect_timeout || 1000;
    const isConnected = () => isRedisClientConnected(client, connectTimeout);

    if (await isConnected()) {
      return resolve(client);
    }

    // https://github.com/NodeRedis/node_redis/
    client.once('ready', () => {
      resolve(client);
    });

    client.once('error', err => {
      reject(err);
    });

    t = setTimeout(() => {
      reject(new Error(`Connect to Redis timeout (${connectTimeout} ms)`));
    }, connectTimeout);
  });

  const done = () => {
    if (t) {
      clearTimeout(t);
      t = null;
    }
  };

  promise.then(done, done);

  return promise;
}

/* EXPORTED */

export function redisClientHealthCheck(
  client: RedisClient,
  timeout?: number
): Promise<boolean> {
  let t: NodeJS.Timeout | null = null;

  const promise = new Promise<boolean>(resolve => {
    if (client) {
      client.ping(err => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });

      t = setTimeout(() => {
        resolve(false);
      }, timeout || 1000);
    } else {
      resolve(false);
    }
  });

  const done = () => {
    if (t) {
      clearTimeout(t);
      t = null;
    }
  };

  promise.then(done, done);

  return promise;
}

export function isRedisClientConnected(
  client: RedisClient,
  timeout?: number
): Promise<boolean> {
  let t: NodeJS.Timeout | null = null;

  const promise = new Promise<boolean>(resolve => {
    if (client && client.connected) {
      // https://redis.io/commands/ping
      client.ping('OK', err => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });

      t = setTimeout(() => {
        resolve(false);
      }, timeout || 1000);
    } else {
      resolve(false);
    }
  });

  const done = () => {
    if (t) {
      clearTimeout(t);
      t = null;
    }
  };

  promise.then(done, done);

  return promise;
}

export function ensureDefaultRedisClientOpts(
  options?: ClientOpts,
  factoryOptions?: RedisClientFactoryOpts
): ClientOpts {
  const fo = factoryOptions || {};
  const o = options || fo.redisClientOptions || {};
  o.host = fo.host || o.host || process.env.COMMON_REDIS_HOST || 'localhost';
  o.port = fo.port || o.port || parseInt(process.env.COMMON_REDIS_PORT || '') || 6379;

  const prefix = fo.prefix || o.prefix || '';
  if (prefix) { o.prefix = prefix; }

  const password =
    fo.password ||
    o.password ||
    o.auth_pass ||
    process.env.COMMON_REDIS_PASSWORD ||
    '';
  if (password) { o.password = password; }
  if (fo.logger) {
    fo.logger.info(`REDIS PASSWORD DEFINED: ${password ? 'YES' : 'NO'}`);
  }
  const isTls = isTrue(process.env.COMMON_REDIS_TLS_ENABLED) || fo.tls;
  if (isTls && !o.tls) {
    o.tls = { servername: o.host };
  }

  if (process.env.COMMON_REDIS_KEEP_ALIVE) {
    const keepAlive = isTrue(process.env.COMMON_REDIS_KEEP_ALIVE);
    o.socket_keepalive = o.socket_keepalive || keepAlive;
  }

  if (process.env.COMMON_REDIS_INITIAL_DELAY) {
    const initialDelay = +process.env.COMMON_REDIS_INITIAL_DELAY * 1000;
    o.socket_initial_delay = o.socket_initial_delay || initialDelay;
  }

  return o;
}

export function ensureDefaultOptions(
  options?: RedisClientFactoryOpts
): RedisClientFactoryOpts {
  const o = options || {};
  o.logger = ensureLogger(o.logger);
  o.retry_method = o.retry_method || 'none';
  o.retry_timeouts = o.retry_timeouts || TIMEOUTS_DEFAULT;
  if (typeof o.retry_timeouts === 'string') {
    o.retry_timeouts = o.retry_timeouts
      .split(',')
      .map(Number)
      .filter((x: any) => x || 0);
  }

  o.redisClientOptions = ensureDefaultRedisClientOpts(o.redisClientOptions, o);

  if (o.retry_method === 'redis') {
    o.redisClientOptions.retry_strategy = getRetryStrategy(
      o.logger as LoggerLike,
      o.retry_timeouts as number[]
    );
  }
  return o;
}

export function clearClientsCache() {
  clientsCache = new Map<string, RedisClient>();
}

export function getDefaultRedisClient(
  options?: RedisClientFactoryOpts
): RedisClient {
  const o = ensureDefaultOptions(options);
  const co = o.redisClientOptions as ClientOpts;
  validateClientOpts(co);
  const key = getCacheKey(co);
  let client: RedisClient | undefined = clientsCache.get(key);

  if (!client) {
    if (o.retry_method === 'wrapper' && o.logger) {
      o.logger.warn(
        "retry_method = 'wrapper' is deprecated. Use 'redis' instead."
      );
    }

    client = _newRedisClient(o);
    clientsCache.set(key, client as RedisClient);
  }

  return client as RedisClient;
}

export function createRedisClient(
  options?: RedisClientFactoryOpts
): RedisClient {
  const o = ensureDefaultOptions(options);
  const co = o.redisClientOptions as ClientOpts;
  validateClientOpts(co);
  return _newRedisClient(o);
}

export function newRedisClient(o?: RedisClientFactoryOpts): RedisClient {
  return createRedisClient(o);
}

export async function pwdArgs(
  o?: RedisClientFactoryOpts
): Promise<RedisClientFactoryOpts> {
  o = o || {};
  o.password = '';
  if (o.logger) {
    o.logger.info(`REDIS_PASSWORD LENGTH: ${o.password.length}`);
  }
  return o;
}

export async function newRedisClientSecured(
  o?: RedisClientFactoryOpts
): Promise<RedisClient> {
  o = await pwdArgs(o);
  const client = createRedisClient(o);
  return ensureConnected(o, client);
}

export async function getDefaultRedisClientSecured(
  o?: RedisClientFactoryOpts
): Promise<RedisClient> {
  o = await pwdArgs(o);
  const client = getDefaultRedisClient(o);
  return ensureConnected(o, client);
}
