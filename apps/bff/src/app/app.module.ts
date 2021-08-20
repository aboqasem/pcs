import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import ormConfig from './config/orm.config';
import { UsersModule } from './resources/users/users.module';
import { AuthModule } from './services/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), UsersModule, AuthModule],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
