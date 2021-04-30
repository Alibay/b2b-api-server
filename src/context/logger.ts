import config from 'config';
import pino from 'pino';

const name = config.get<string>('name');
const level = config.get<string>('logLevel');

export const logger = pino({
  level,
  name,
  prettyPrint: true,
});

export function getLogger(name: string) {
  return pino({
    level,
    name,
    prettyPrint: true,
  });
}
