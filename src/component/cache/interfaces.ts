export interface ICacheConfig {
  /** in seconds */
  expiration?: number;
  /** in seconds */
  lockDuration?: number;
  prefix?: string;
  maxItemsInMemory?: number;
}
