import config from 'config';
import Knex, { Config } from 'knex';
import { knexSnakeCaseMappers } from 'objection';

const database = config.get('database');

const dbConfig = {
  ...(database as any),
  ...knexSnakeCaseMappers(),
};

const db = Knex(dbConfig as Config);

export { db };
