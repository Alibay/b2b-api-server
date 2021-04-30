export interface IRedisClient {
  // keys
  keysAsync(pattern: string): Promise<string[]>;
  delAsync(key: string | number | Array<string | number>): Promise<number>;
  getAsync<T extends string>(key: string | number): Promise<T | null>;
  setAsync(key: string | number, value: string | number): Promise<'OK'>;
  setAsync(key: string | number, value: string | number, flag: 'NX'): Promise<'OK' | null>;
  setAsync(key: string | number, value: string | number, mode: 'EX', expiration: number): Promise<'OK'>;
  setAsync(
    key: string | number,
    value: string | number,
    mode: 'EX',
    expiration: number,
    flag: 'NX',
  ): Promise<'OK' | null>;
  expireAsync(key: string | number, expiration: number): Promise<1 | 0>;
  /**
   * @returns {Promise<number>} '-2' - keys does not exist; '-1' - TTL is not set; >0 remaining TTL
   */
  ttlAsync(key: string | number): Promise<number>;
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
  sremAsync(key: string, item: string | string[]): Promise<number>;
  // lists
  rpushAsync(key: string, value: string | string[]): Promise<number>;
  rpopAsync(key: string): Promise<string | null>;
  quitAsync(): Promise<void>;

  lpushAsync(key: string, value: string | string[]): Promise<number>;
  lpopAsync(key: string): Promise<string | null>;

  // other
  flushallAsync(): Promise<'OK'>;
  typeAsync(): Promise<'string' | 'set' | string>;

  lrangeAsync(key: string | number, start: number, range: number): Promise<string[]>;
}
