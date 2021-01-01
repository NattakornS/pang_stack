module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'mysql',
        host: env('DATABASE_HOST', 'pang_stack_mysql_1'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'pang_cms'),
        username: env('DATABASE_USERNAME', 'pang_cms'),
        password: env('DATABASE_PASSWORD', 'pangroot2020,'),
        ssl: env.bool('DATABASE_SSL', false),
      },
      options: {}
    },
  },
});
