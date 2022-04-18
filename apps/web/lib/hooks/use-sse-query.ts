/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventSourceWrapper } from '@/lib/api/event-source-wrapper';
import { HttpError } from '@pcs/shared-data-access';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  QueryFunction,
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useQueryClient,
} from 'react-query';

export interface UseSseQueryOptions<
  TEventSourceData = unknown,
  TEventSourceError = string,
  TError = TEventSourceError,
  TQueryKey extends QueryKey = QueryKey,
> extends Pick<
    UseInfiniteQueryOptions<
      TEventSourceData,
      TError,
      TEventSourceData,
      TEventSourceData,
      TQueryKey
    >,
    'enabled'
  > {
  withCredentials?: boolean;
  onStart?: () => void;
  onDone?: (data?: TEventSourceData) => void;
}

export type UseSseQueryResult<TData = unknown, TError = unknown> = Pick<
  UseInfiniteQueryResult<TData, TError>,
  'error'
> & {
  latest?: TData;
  all: TData[];
  isLoading: boolean;
  isDone: boolean;
};

const queryFn = (ctx: QueryFunctionContext<any, { error?: unknown; data?: unknown }>) => {
  const { pageParam } = ctx;

  return new Promise((resolve, reject) => {
    if (!pageParam) {
      // initial trigger by react-query has no pageParam
      return resolve(null);
    }
    if (pageParam?.error) {
      return reject(pageParam.error);
    }
    return resolve(pageParam?.data);
  });
};

export function useSseQuery<
  TEventSourceData = unknown,
  TEventSourceError = HttpError,
  TError = TEventSourceError,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  eventSourceUrl: string | null | undefined,
  options?: UseSseQueryOptions<TEventSourceData, TEventSourceError, TError, TQueryKey>,
): UseSseQueryResult<TEventSourceData, TError> {
  const queryClient = useQueryClient();

  const esRef = useRef<EventSourceWrapper<TEventSourceData>>();

  const [state, setState] = useState({ isLoading: false, isDone: false });

  const infiniteQuery = useInfiniteQuery(
    queryKey,
    queryFn as QueryFunction<[null, ...TEventSourceData[], ...([] | ['__END_OF_QUERY__'])]>,
    {
      ...options,
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: true,
      retry: false,
      onSuccess: ({ pages }) => {
        if (pages.length < 2) {
          return;
        }
        if ((pages[pages.length - 1] as any) === '__END_OF_QUERY__') {
          options?.onDone?.(
            pages.length > 2 ? (pages[pages.length - 2] as unknown as TEventSourceData) : undefined,
          );
        }
      },
    },
  );

  const all = useMemo(() => {
    const pages = infiniteQuery.data?.pages;
    if (!pages || pages.length <= 1) {
      return [] as TEventSourceData[];
    }
    if ((pages[pages.length - 1] as any) === '__END_OF_QUERY__') {
      return pages.slice(1, -1) as unknown as TEventSourceData[];
    } else {
      return pages.slice(1) as unknown as TEventSourceData[];
    }
  }, [infiniteQuery.data?.pages]);

  const latest = useMemo(() => {
    const lastItemIdx = all.length - 1;
    if (lastItemIdx < 0) {
      return undefined;
    }

    return all[lastItemIdx];
  }, [all]);

  useEffect(() => {
    if (!options?.enabled || !eventSourceUrl) {
      return;
    }

    const queryPages =
      queryClient.getQueryData<{
        pages: [null, ...TEventSourceData[], ...([] | ['__END_OF_QUERY__'])];
      }>(queryKey)?.pages ?? [];

    if (queryPages.length > 1) {
      if (queryPages[queryPages.length - 1] === '__END_OF_QUERY__') {
        // the query has been completed and available in cache
        setState({ isLoading: false, isDone: true });
        return;
      } else {
        // the query is not completed and has been closed, so we need to clear the cache and start a fresh query
        queryClient.removeQueries(queryKey);
      }
    }

    esRef.current = new EventSourceWrapper(eventSourceUrl, {
      withCredentials: options?.withCredentials,
    });

    setState({ isLoading: true, isDone: false });
    options?.onStart?.();

    esRef.current.onmessage = ({ data }) => {
      infiniteQuery.fetchNextPage({ pageParam: { data } } as any);
    };

    esRef.current.onerror = ({ data: error }) => {
      infiniteQuery.fetchNextPage({ pageParam: { error } } as any);
    };

    esRef.current.onclose = (end) => {
      if (end) {
        infiniteQuery.fetchNextPage({ pageParam: { data: '__END_OF_QUERY__' } } as any);
      }
      setState({ isLoading: false, isDone: true });
    };

    return () => {
      esRef.current?.close();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSourceUrl, options?.enabled, options?.withCredentials]);

  return {
    latest,
    all,
    error: infiniteQuery.error as TError,
    ...state,
  };
}
