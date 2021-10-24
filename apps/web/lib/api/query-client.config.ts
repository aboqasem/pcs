import { HttpException } from '@pcs/shared-data-access';
import { QueryClient, setLogger } from 'react-query';

type TQueryClientConfig = ConstructorParameters<typeof QueryClient>[0];

const none = () => {
  // no logging
};

setLogger({ log: none, warn: none, error: none });

export class DefaultQueryClient extends QueryClient {
  constructor(config?: TQueryClientConfig) {
    super({
      ...config,
      defaultOptions: {
        queries: {
          retry: (failureCount, error) => {
            // if it is a client error, abort
            if (
              error instanceof HttpException &&
              error.status &&
              error.status >= 400 &&
              error.status < 500
            ) {
              return false;
            }

            // otherwise, retry 3 times
            return failureCount < 2;
          },
          staleTime: 60 * 1000,
          ...config?.defaultOptions?.queries,
        },
        ...config?.defaultOptions,
      },
    });
  }
}
