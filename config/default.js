const e = process.env;

module.exports = {
  port: e.APP_PORT || 3000,
  name: 'b2b',
  logLevel: 'info',

  database: {
    client: 'pg',
    connection: {
      host: e.B2B_DB_HOST || 'localhost',
      port: e.B2B_DB_PORT || 5432,
      database: e.B2B_DB_NAME || 'b2b',
      user: e.B2B_DB_USER || 'b2bdev',
      password: e.B2B_DB_PASS || 'b2bpass',
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  components: {
    passwordEncoder: {
      bcrypt: {
        rounds: 12,
      },
    },
  },

  mail: {
    from: 'noreply@b2b',
  }
};
