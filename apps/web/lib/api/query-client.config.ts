import { config as conf } from '@/lib/config';
import { HttpError } from '@pcs/shared-data-access';
import { QueryClient, setLogger } from 'react-query';

type TQueryClientConfig = ConstructorParameters<typeof QueryClient>[0];

const noop = () => {
  // noop
};

setLogger({ log: noop, warn: noop, error: noop });

export class DefaultQueryClient extends QueryClient {
  constructor(config?: TQueryClientConfig) {
    super({
      ...config,
      defaultOptions: {
        queries: {
          retry: (failureCount, error) => {
            // if it is a client error, do not retry
            if (
              error instanceof HttpError &&
              error.status &&
              error.status >= 400 &&
              error.status < 500
            ) {
              return false;
            }

            // otherwise, retry 3 times
            return failureCount < 2;
          },
          staleTime: conf.RQ_STALE_TIME,
          cacheTime: conf.RQ_CACHE_TIME,
          ...config?.defaultOptions?.queries,
        },
        ...config?.defaultOptions,
      },
    });
  }
}
