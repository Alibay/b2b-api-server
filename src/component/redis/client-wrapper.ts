import { LoggerLike, TIMEOUTS_DEFAULT } from './types';

const assert = require('assert');

type Callback = (err: Error | null, data: any) => void;

// https://github.com/NodeRedis/node_redis
export interface IRedisClient {
  connected: boolean;
  watch(key: string, callback: Callback): IRedisClient;
  unwatch(callback: Callback): IRedisClient;
  get(key: string, callback: Callback): IRedisClient;
  set(key: string, data: string, ex: string, ttl: number, callback: Callback): IRedisClient;
  multi(): IRedisClient;
  exec(cb: Callback): IRedisClient;
  quit(cb?: Callback): void;
  end(flush?: boolean): any;
  keys(key: string, callback: Callback): IRedisClient;
  del(key: string, callback: Callback): IRedisClient;
  on(event: string, fn: Function): IRedisClient;
  monitor(cb: Callback): IRedisClient;
  eval(...args: any[]): IRedisClient;
}

type RedisClientFactory = (...args: any[]) => IRedisClient;

function silent(fn: Function) {
  try {
    fn();
  } catch (e) {
    /* silent */
  }
}

const noop = () => { };

function errorHandler(self: RedisClientWrapper, cb: Callback, again: Function, _caller: string): Callback {
  cb = cb || noop;
  return ((err: any, data) => {
    if (err) {
      if (err.code === 'NR_CLOSED') {
        if (self.attempt < self.timeouts.length) { self.attempt++; }
        const timeout = self.timeouts[self.attempt];
        if (!timeout) {
          // if all attempts completed :(
          if (self.resetTime === 0) {
            self.resetTime = Date.now();
            self._timer = setTimeout(_ => {
              self._timer = null;
              self.attempt = 0;
              self.resetTime = 0;
            }, self.resetTimeout);
          }

          const time = (self.resetTime + self.resetTimeout + 1000) - Date.now();
          cb(new Error(`Can't connect to Redis server (${err.message}) with ${self.timeouts.length} attempts.
          On pause for a while. Please, try again later in ${time} ms.`), null);
        } else {
          // Never give up :)
          self.logger.log(`Connection to Redis failed : ${err.message}.
          Will try out to reconnect again with attempt #${self.attempt} in ${timeout} ms.`);
          self._clearTimeout();
          self._timer = setTimeout(_ => {
            self._timer = null;
            self._reconnect();
            again();
          }, timeout);
        }
      } else {
        cb(err, data);
      }
    } else {
      self.attempt = 0;
      cb(err, data);
    }
  });
}

export interface RedisClientWrapperOptions {
  factory: RedisClientFactory;
  logger?: LoggerLike;
  proxyOnly?: boolean;
  resetTimeout?: number;
  timeouts?: number[];
}

const RESET_TIMEOUT_DEFAULT = 60 * 1000;

export class RedisClientWrapper implements IRedisClient {

  public factory: RedisClientFactory;
  public impl: IRedisClient;
  public logger: LoggerLike;
  public proxyOnly = false;
  public resetTimeout: number;
  public resetTime = 0;

  public attempt = 0;
  public timeouts: number[] = [1000];

  public _timer: any = null;

  constructor(options: RedisClientWrapperOptions) {
    assert(options, 'options not defined');
    assert(options.factory, 'options.factory not defined');
    this.factory = options.factory;
    this.logger = options.logger || console;
    this.proxyOnly = options.proxyOnly || false;
    this.resetTimeout = options.resetTimeout || RESET_TIMEOUT_DEFAULT;
    this.timeouts = options.timeouts || TIMEOUTS_DEFAULT;
    this.impl = this._create();
  }

  public _create() {
    const impl = this.factory();
    if (!impl) { throw new Error("Can't create redis client"); }
    return impl;
  }

  public _reconnect() {
    this.logger.log('Reconnecting...');

    silent((_: any) => {
      if (this.impl) { this.impl.quit(); }
    });

    silent((_: any) => {
      if (this.impl) { this.impl.end(true); }
    });

    this.impl = this._create();
    this.logger.log('Reconnected.');
  }

  get connected(): boolean {
    return this.impl.connected;
  }

  public watch(key: string, cb: Callback) {
    this.impl.watch(key, cb);
    return this as any;
  }

  public unwatch(cb: Callback) {
    this.impl.unwatch(cb);
    return this as any;
  }

  public set(key: string, data: string, ex: string, ttl: number, cb: Callback): IRedisClient {
    const self: any = this;
    this.impl.set(key, data, ex, ttl,
      this.proxyOnly ? cb : errorHandler(this, cb, (_: any) => self.set(key, data, ex, ttl, cb),
        'RedisClientWrapper.set'));
    return self;
  }

  public get(key: string, cb: Callback) {
    const self: any = this;
    this.impl.get(key,
      this.proxyOnly ? cb : errorHandler(this, cb, (_: any) => self.get(key, cb),
        'RedisClientWrapper.get'));
    return self;
  }

  public multi(): IRedisClient {
    this.impl.multi();
    return this as IRedisClient;
  }

  public exec(cb: Callback): IRedisClient {
    this.impl.exec(cb);
    return this as IRedisClient;
  }

  public _clearTimeout() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  public _destroy() {
    this._clearTimeout();
  }

  public quit(cb?: Callback | undefined): void {
    this._destroy();
    this.impl.quit(cb);
  }

  public end(flush?: boolean | undefined) {
    this._destroy();
    this.impl.end(flush);
  }

  public keys(key: string, cb: Callback): IRedisClient {
    this.impl.keys(key, cb);
    return this as IRedisClient;
  }

  public del(key: string, cb: Callback): IRedisClient {
    this.impl.del(key, cb);
    return this as IRedisClient;
  }

  public on(event: string, fn: Function): IRedisClient {
    this.impl.on(event, fn);
    return this as IRedisClient;
  }

  public monitor(cb: Callback): IRedisClient {
    this.impl.monitor(cb);
    return this as IRedisClient;
  }

  public _proxyCall(methodName: string, args: any) {
    // tslint:disable-next-line
    const method: Function = (this.impl as any)[methodName];
    return method.apply(this.impl, Object.values(args));
  }

  public eval(): IRedisClient {
    this._proxyCall('eval', arguments);
    return this as IRedisClient;
  }

}
