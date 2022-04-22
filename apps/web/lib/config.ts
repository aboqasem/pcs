import { NodeEnv } from '@pcs/shared-data-access';

class Configurations {
  readonly NODE_ENV: string = process.env.NODE_ENV || NodeEnv.Development;

  readonly BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4200';

  readonly BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:8000/api/';

  readonly RQ_STALE_TIME = +(process.env.NEXT_PUBLIC_RQ_CACHE_TIME ?? 60 * 1000 * 8); // 8 minutes default

  readonly RQ_CACHE_TIME = +(process.env.NEXT_PUBLIC_RQ_STALE_TIME ?? 60 * 1000 * 10); // 10 minutes default
}

export const config = new Configurations();
