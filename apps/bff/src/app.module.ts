import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './config/orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { UsersModule } from './modules/users/users.module';
import { LoggerMiddleware } from './shared/middlewares/logger.middleware';

@Module({
  imports: [EmailModule, TypeOrmModule.forRoot(ormConfig), UsersModule, AuthModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
