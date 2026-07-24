import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host:
    process.env.NODE_ENV === 'production'
      ? process.env.DB_HOST_PROD
      : process.env.DB_HOST_DEV,
  port: Number(
    process.env.NODE_ENV === 'production'
      ? process.env.DB_PORT_PROD
      : process.env.DB_PORT_DEV,
  ),
  username:
    process.env.NODE_ENV === 'production'
      ? process.env.DB_USERNAME_PROD
      : process.env.DB_USERNAME_DEV,
  password:
    process.env.NODE_ENV === 'production'
      ? process.env.DB_PASSWORD_PROD
      : process.env.DB_PASSWORD_DEV,
  database:
    process.env.NODE_ENV === 'production'
      ? process.env.DB_DATABASE_PROD
      : process.env.DB_DATABASE_DEV,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
  migrations: ['src/database/migrations/*.ts'],
  ssl: {
    rejectUnauthorized: false,
  },
});
