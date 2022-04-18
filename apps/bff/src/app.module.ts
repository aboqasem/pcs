import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsModule } from 'src/modules/materials/materials.module';
import { MainInterceptor } from 'src/shared/interceptors/main.interceptor';
import { ormConfig } from './config/orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EmailModule } from './modules/email/email.module';
import { UsersModule } from './modules/users/users.module';
import { LoggerMiddleware } from './shared/middlewares/logger.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    EmailModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    MaterialsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MainInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
