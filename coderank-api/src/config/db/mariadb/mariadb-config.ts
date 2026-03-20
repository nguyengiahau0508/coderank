import { registerAs } from '@nestjs/config';

export default registerAs('mariadbConfig', () => ({
  host: process.env.DB_MARIADB_HOST,
  port: Number(process.env.DB_MARIADB_PORT) || 3306,
  username: process.env.DB_MARIADB_USERNAME,
  password: process.env.DB_MARIADB_PASSWORD,
  name: process.env.DB_MARIADB_NAME,
}));
