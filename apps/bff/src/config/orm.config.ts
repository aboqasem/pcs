import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CourseEntity } from 'src/db/entities/course.entity';
import { EnrolledStudentEntity } from 'src/db/entities/enrolled-student.entity';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { config } from './config';

export const ormConfig = {
  type: 'postgres',
  url: config.DATABASE_URL,
  entities: [UserEntity, CourseEntity, MaterialEntity, EnrolledStudentEntity],
  synchronize: false,
  ssl: config.DATABASE_SECURE && { rejectUnauthorized: false },
  logging: config.DATABASE_LOGGING,
} as TypeOrmModuleOptions & PostgresConnectionOptions;
