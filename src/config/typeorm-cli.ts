import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';

config({
  path: path.resolve(process.cwd(), '.env'),
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
  migrations: ['src/database/migrations/*.ts'],
  // ssl: true,
});
