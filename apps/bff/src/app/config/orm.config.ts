import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import config from '../config/config';
import { User } from '../resources/users/entities/user.entity';

export default {
  type: 'postgres',
  url: config.DATABASE_URL,
  entities: [User],
  synchronize: config.DATABASE_SYNC,
  ssl: config.DATABASE_SECURE && { rejectUnauthorized: false },
} as TypeOrmModuleOptions & PostgresConnectionOptions;
