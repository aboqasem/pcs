import { DehydratedState } from 'react-query';

export type TPropsWithDehydratedState<T extends Record<string, unknown> = Record<string, unknown>> =
  T & {
    dehydratedState: DehydratedState;
  };
