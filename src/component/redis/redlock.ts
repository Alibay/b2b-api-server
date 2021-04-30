import RedlockParent from 'redlock';
import { RedisCluster } from './enums';
import { Redis } from './redis';

export default class Redlock {
  private readonly options: RedlockParent.Options = {
    // the expected clock drift; for more details
    // see http://redis.io/topics/distlock
    driftFactor: 0.01, // time in ms

    // the max number of times Redlock will attempt
    // to lock a resource before erroring
    retryCount: 30,

    // the time in ms between attempts
    retryDelay: 2000, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200, // time in ms
  };

  public async lock(resource: string, ttl: number) {
    const redlock = await this.getRedlock();
    return redlock.lock(resource, ttl);
  }

  private async getRedlock() {
    const redis = await Redis.getRawConnection(RedisCluster.cache);
    return new RedlockParent(
      // you should have one client for each independent redis node
      // or cluster
      [redis],
      this.options,
    );
  }
}
