import { RetryStrategy, RetryStrategyOptions } from 'redis';
import { LoggerLike } from './types';

export function getRetryStrategy(log: LoggerLike, timeouts: number[]): RetryStrategy {

  const retry_strategy = (options: RetryStrategyOptions) => {
    const {error, attempt} = options;
    if (error) {
      log.warn(error);
    }
    const timeout = timeouts[attempt - 1];
    if (timeout) {
      log.info(`Retrying to connect to Redis in ${timeout} ms.`);
      return timeout;
    } else {
      throw new Error('Exceeded max Redis reconnection attempts');
    }
  };

  return retry_strategy;
}
