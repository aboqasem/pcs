import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsModule } from 'src/modules/materials/materials.module';
import { MainInterceptor } from 'src/shared/interceptors/main.interceptor';
import { ormConfig } from './config/orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EmailModule } from './modules/email/email.module';
import { JudgeModule } from './modules/judge/judge.module';
import { UsersModule } from './modules/users/users.module';
import { LoggerMiddleware } from './shared/middlewares/logger.middleware';

@Module({
  imports: [
    JudgeModule,
    TypeOrmModule.forRoot(ormConfig),
    ScheduleModule.forRoot(),
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
