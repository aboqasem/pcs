import { NodeEnv, ValidationError } from '@pcs/shared-data-access';
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPort,
  IsString,
  IsUrl,
  ValidateIf,
  validateSync,
} from 'class-validator';

const isProduction = process.env.NODE_ENV === 'production';

export enum SameSite {
  None = 'none',
  Lax = 'lax',
  Strict = 'strict',
}

export enum LogLevel {
  Log = 'log',
  Error = 'error',
  Warn = 'warn',
  Debug = 'debug',
  Verbose = 'verbose',
}

class Configurations {
  @IsEnum(NodeEnv)
  readonly NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsEnum(LogLevel, { each: true })
  @IsOptional()
  @Transform(({ value }) => value.split(',').map((v: string) => v.trim()))
  readonly LOG_LEVELS?: LogLevel[];

  @IsNotEmpty()
  @IsPort()
  readonly PORT = '8000';

  @IsNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(',').map((v: string) => v.trim()))
  readonly CORS_ORIGINS = ['http://localhost:4200'];

  @IsEnum(SameSite)
  readonly COOKIE_SAME_SITE = SameSite.Lax;

  /**
   * 'secure' in production
   */
  @Transform(({ value }) => (value === undefined ? undefined : value === 'true'))
  readonly COOKIE_SECURE = isProduction;

  /**
   * e.g. example.com, this will allow subdomains as well
   */
  @IsString()
  @ValidateIf(() => isProduction)
  readonly COOKIE_DOMAIN?: string;

  @IsNotEmpty()
  @IsString()
  readonly COOKIE_SECRET!: string;

  /**
   * @default 1000 * 60 * 60 * 12 (12 hours)
   */
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly SHORT_COOKIE_MAX_AGE = 43200000;

  /**
   * @default 1000 * 60 * 60 * 24 * 30 (30 days)
   */
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly LONG_COOKIE_MAX_AGE = 2592000000;

  @IsString()
  readonly DATABASE_URL = 'postgresql://pcs:pcs@localhost:5432/pcs';

  /**
   * 'on' in production
   */
  @Transform(({ value }) => value === 'true')
  readonly DATABASE_SECURE = isProduction;

  @Transform(({ value }) => value === 'true')
  readonly DATABASE_LOGGING = false;

  /**
   * https://app.sendgrid.com/settings/api_keys
   */
  @IsString()
  readonly SENDGRID_API_KEY!: string;

  /**
   * this address should be a verified sender in your Twilio SendGrid account.
   */
  @IsEmail()
  readonly SENDGRID_FROM!: string;

  /**
   * 'off' in production
   */
  @Transform(({ value }) => value !== 'false')
  readonly SENDGRID_SANDBOX = !isProduction;

  @IsUrl({ require_tld: isProduction })
  readonly APP_SIGN_IN_URL!: string;

  @IsUrl({ require_tld: isProduction })
  readonly APP_COURSE_URL!: string;
}

export const config = ((): Configurations => {
  const validatedConfig = plainToInstance(Configurations, process.env, {
    exposeDefaultValues: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length !== 0) {
    throw new ValidationError(errors);
  }

  return validatedConfig;
})();
