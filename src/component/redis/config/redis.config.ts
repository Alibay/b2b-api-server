import config from 'config';
import { PREFIX } from '../constants';
import { RedisClientFactoryOpts } from '../types';

export class RedisConfig implements RedisClientFactoryOpts {
  public host = config.get<string>('redis.cache.host');
  public protocol = config.get<string>('redis.protocol');
  public redisClientOptions = {
    connect_timeout: 10_000,
    prefix: PREFIX,
    socket_initial_delay: 10_000,
    socket_keepalive: true,
  };
  // tslint:disable-next-line:variable-name
  public retry_method = 'redis' as 'redis';
  // tslint:disable-next-line:variable-name
  public retry_timeouts = config.get<string>('redis.timeouts').split(',').map(Number);
  // tslint:disable-next-line:variable-name
  public create_connected = false;
  // tslint:disable-next-line:variable-name
  public connect_timeout = 10_001;
}
