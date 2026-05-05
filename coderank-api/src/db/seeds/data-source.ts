import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

export const AppDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_MARIADB_HOST || 'localhost',
  port: parseInt(process.env.DB_MARIADB_PORT || '3306'),
  username: process.env.DB_MARIADB_USERNAME || 'root',
  password: process.env.DB_MARIADB_PASSWORD || '',
  database: process.env.DB_MARIADB_NAME || 'coderank',
  entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
  synchronize: false,
  logging: false,
});
