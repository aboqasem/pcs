import { UserDto } from '@pcs/shared-data-access';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends UserDto {}
  }
}
