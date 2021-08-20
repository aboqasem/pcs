import { NodeEnv } from '@myplatform/shared-data-access';

class Configurations {
  readonly NODE_ENV: string = process.env.NODE_ENV || NodeEnv.Development;

  readonly BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:8000/api/';
}

export default new Configurations();
