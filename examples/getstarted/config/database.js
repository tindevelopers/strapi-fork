const sqlite = {
  client: 'sqlite',
  connection: {
    filename: '.tmp/data.db',
  },
  useNullAsDefault: true,
};

const postgres = {
  client: 'postgres',
  connection: process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        // Enable SSL for Railway and other cloud providers
        ssl:
          process.env.DATABASE_URL?.includes('railway') ||
          process.env.DATABASE_URL?.includes('amazonaws.com') ||
          process.env.DATABASE_URL?.includes('heroku') ||
          process.env.DATABASE_URL?.includes('render.com')
            ? { rejectUnauthorized: false }
            : process.env.DATABASE_SSL === 'true'
              ? { rejectUnauthorized: false }
              : false,
      }
    : {
        database: process.env.PGDATABASE || 'strapi',
        user: process.env.PGUSER || 'strapi',
        password: process.env.PGPASSWORD || 'strapi',
        port: parseInt(process.env.PGPORT || '5432', 10),
        host: process.env.PGHOST || 'localhost',
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
};

const mysql = {
  client: 'mysql',
  connection: {
    database: 'strapi',
    user: 'strapi',
    password: 'strapi',
    port: 3306,
    host: 'localhost',
  },
};

const mariadb = {
  client: 'mysql',
  connection: {
    database: 'strapi',
    user: 'strapi',
    password: 'strapi',
    port: 3307,
    host: 'localhost',
  },
};

const db = {
  mysql,
  sqlite,
  postgres,
  mariadb,
};

module.exports = {
  connection: (() => {
    // If DB environment variable is explicitly set, use that database type
    if (process.env.DB) {
      return db[process.env.DB] || db.sqlite;
    }

    // If DATABASE_URL is set and not empty, use PostgreSQL
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
      return db.postgres;
    }

    // If PGHOST is set, use PostgreSQL
    if (process.env.PGHOST) {
      return db.postgres;
    }

    // Default to SQLite for local development
    return db.sqlite;
  })(),
};
