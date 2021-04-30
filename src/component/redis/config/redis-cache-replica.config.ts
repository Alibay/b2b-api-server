import config from 'config';
import { RedisConfig } from './redis.config';

export class RedisCacheReplicaConfig extends RedisConfig {
  public host = config.get<string>('redis.cache.replica.host');
}
