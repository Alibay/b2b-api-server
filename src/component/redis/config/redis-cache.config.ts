import config from 'config';
import { RedisConfig } from './redis.config';

export class RedisCacheConfig extends RedisConfig {
  public host = config.get<string>('redis.cache.host');
}
