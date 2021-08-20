import { plainToClass, Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPort,
  IsString,
  ValidateIf,
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
  readonly COOKIE_SAME_SITE: SameSite = SameSite.LAX;

  @Transform(({ value }) => (value === undefined ? undefined : value === 'true'))
  readonly COOKIE_SECURE: boolean = process.env.NODE_ENV === 'production';

  @IsString()
  @ValidateIf(() => process.env.NODE_ENV === 'production')
  readonly COOKIE_DOMAIN?: string;

  @IsNotEmpty()
  @IsString()
  readonly COOKIE_SECRET!: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly SHORT_COOKIE_MAX_AGE = 43200000; // 1000 * 60 * 60 * 12 (12 hours)

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly LONG_COOKIE_MAX_AGE = 2592000000; // 1000 * 60 * 60 * 24 * 30 (30 days)

  @IsString()
  readonly DATABASE_URL = 'postgresql://myplatform:myplatform@localhost:5432/myplatform';

  @Transform(({ value }) => value === 'true')
  readonly DATABASE_SECURE: boolean = process.env.NODE_ENV === 'production';

  @Transform(({ value }) => value === 'true')
  readonly DATABASE_SYNC = false;
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
