import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import config, { NodeEnv } from '../config/config';
import { User } from '../resources/users/entities/user.entity';

export default {
  type: 'postgres',
  host: config.DB_HOST,
  port: +config.DB_PORT,
  database: config.DB_NAME,
  username: config.DB_USER,
  password: config.DB_PASS,
  entities: [User],
  synchronize: config.NODE_ENV !== NodeEnv.PRODUCTION,
} as TypeOrmModuleOptions;
