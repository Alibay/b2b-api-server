const path = require('path');
const config = require('config');

module.exports = {
  ...config.get('database'),
  migrations: {
    tableName: 'knex_migrations',
    directory: path.join(__dirname, '/database/migrations'),
  },
  seeds: {
    directory: path.join(__dirname, '/database/seeds'),
  },
};
