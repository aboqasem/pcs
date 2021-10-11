import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NodeEnv } from '@pcs/shared-data-access';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import passport from 'passport';
import { AppModule } from 'src/app.module';
import { config } from 'src/config/config';
import { session } from 'src/config/session.config';
import { WithDataInterceptor } from 'src/shared/interceptors/with-data.interceptor';
import { CustomValidationPipe } from 'src/shared/pipes/custom-validation.pipe';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: config.LOG_LEVELS,
  });

  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.CORS_ORIGINS, credentials: true });

  app.useGlobalPipes(
    new CustomValidationPipe({
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new WithDataInterceptor());

  app.use(helmet());

  if (config.NODE_ENV === NodeEnv.Production) {
    // required for heroku
    app.set('trust proxy', 1);
  }

  app.use(session);
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(cookieParser());

  await app.listen(config.PORT).then(async () => {
    Logger.log(`Running on: http://localhost:${config.PORT}/`, bootstrap.name);
  });
}

bootstrap();
