import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => {
  return {
    // Explicitly cast or check the type
    type: 'postgres',
    url: config.get<string>(
      process.env.NODE_ENV === 'production' ? 'DB_URL_PROD' : 'DB_URL_DEV',
    ),
    host: config.get<string>(
      process.env.NODE_ENV === 'production' ? 'DB_HOST_PROD' : 'DB_HOST_DEV',
    ),
    port: Number(
      config.get<number>(
        process.env.NODE_ENV === 'production' ? 'DB_PORT_PROD' : 'DB_PORT_DEV',
        5432,
      ),
    ),
    username: config.get<string>(
      process.env.NODE_ENV === 'production'
        ? 'DB_USERNAME_PROD'
        : 'DB_USERNAME_DEV',
    ),
    password: config.get<string>(
      process.env.NODE_ENV === 'production'
        ? 'DB_PASSWORD_PROD'
        : 'DB_PASSWORD_DEV',
    ),
    database: config.get<string>(
      process.env.NODE_ENV === 'production'
        ? 'DB_DATABASE_PROD'
        : 'DB_DATABASE_DEV',
    ),
    autoLoadEntities: true,
    // entities: ['src/**/*.entity.ts'],
    synchronize: false,
    logging: config.get<string>('NODE_ENV') !== 'production', // Turn this on temporarily to see what's happening
    ssl: {
      rejectUnauthorized: false, // This is important for Neon. It tells the client to accept the server's SSL certificate without validating it against a CA. Neon uses self-signed certificates, so this setting is necessary to establish a secure connection without errors. In production, you would want to use proper certificates and set this to true.
    },

    // --- New Settings ---
    retryAttempts: 10, //Without this, if the DB isn't ready the millisecond your NestJS app starts, your app will crash and stop trying. With this, it will keep trying to "knock on the door."

    retryDelay: 3000, //This ensures you aren't spamming the DB too fast during a restart. It gives the database 3 seconds of "breathing room" between attempts.

    extra: {
      max: config.get<number>(
        process.env.NODE_ENV === 'production'
          ? 'DB_MAX_CONNECTIONS_PROD'
          : 'DB_MAX_CONNECTIONS_DEV',
        20,
      ), //This limits the "pool" of connections. Instead of opening/closing connections constantly, the app keeps up to 20 "warm" connections ready to use. This reduces latency and prevents your app from crashing the DB by opening too many simultaneous sockets.
      idleTimeoutMillis: 30000, //This tells the pool to close any connection that has been sitting unused for 30 seconds. It keeps your resource usage lean.
    },
  };
};
