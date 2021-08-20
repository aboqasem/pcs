import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import passport from 'passport';
import { AppModule } from 'src/app/app.module';
import { WithDataInterceptor } from 'src/app/common/interceptors/with-data.interceptor';
import session from 'src/app/common/session';
import config, { NodeEnv } from 'src/app/config/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.CORS_ORIGINS, credentials: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new WithDataInterceptor());

  app.use(helmet());

  if (config.NODE_ENV === NodeEnv.PRODUCTION) {
    app.set('trust proxy', 1);
  }

  app.use(session);
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(cookieParser());

  await app.listen(config.PORT).then(async () => {
    Logger.debug(`Running on: http://localhost:${config.PORT}/`, bootstrap.name);
  });
}

bootstrap();
