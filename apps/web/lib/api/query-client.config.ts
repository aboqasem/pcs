import { QueryClient, setLogger } from 'react-query';

type TQueryClientConfig = ConstructorParameters<typeof QueryClient>[0];

const none = () => {
  // no logging
};

setLogger({
  log: none,
  warn: none,
  error: none,
});

export class DefaultQueryClient extends QueryClient {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(config?: TQueryClientConfig) {
    super(config);
  }
}
