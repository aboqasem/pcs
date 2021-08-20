import { plainToClass, Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPort,
  IsString,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum SameSite {
  NONE = 'none',
  LAX = 'lax',
  STRICT = 'strict',
}

class Configurations {
  @IsEnum(NodeEnv)
  readonly NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;

  @IsNotEmpty()
  @IsPort()
  readonly PORT = '8000';

  @IsNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(',').map((v: string) => v.trim()))
  readonly CORS_ORIGINS = ['http://localhost:4200'];

  @IsEnum(SameSite)
  readonly COOKIE_SAME_SITE: SameSite = SameSite.STRICT;

  @IsNotEmpty()
  @IsString()
  readonly COOKIE_SECRET!: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly LONG_COOKIE_MAX_AGE = 2592000000; // 1000 * 60 * 60 * 24 * 30 (30 days)

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly SHORT_COOKIE_MAX_AGE = 43200000; // 1000 * 60 * 60 * 12 (12 hours)

  @IsNotEmpty()
  @IsString()
  readonly DB_HOST = 'localhost';

  @IsNotEmpty()
  @IsPort()
  readonly DB_PORT = '5432';

  @IsNotEmpty()
  @IsString()
  readonly DB_NAME = 'myplatform';

  @IsString()
  readonly DB_USER = 'myplatform';

  @IsString()
  readonly DB_PASS = 'myplatform';

  DB_URL(): string {
    return `postgresql://${this.DB_USER}:${this.DB_PASS}@${this.DB_HOST}:${this.DB_PORT}/${this.DB_NAME}`;
  }
}

export default ((): Configurations => {
  const validatedConfig = plainToClass(Configurations, process.env, {
    exposeDefaultValues: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length !== 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
})();
