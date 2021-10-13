import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities/user.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { config } from './config';

export const ormConfig = {
  type: 'postgres',
  url: config.DATABASE_URL,
  entities: [UserEntity],
  synchronize: config.DATABASE_SYNC,
  ssl: config.DATABASE_SECURE && { rejectUnauthorized: false },
  logging: config.DATABASE_LOGGING,
} as TypeOrmModuleOptions & PostgresConnectionOptions;
