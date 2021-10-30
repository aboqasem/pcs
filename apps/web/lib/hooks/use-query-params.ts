import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

export function useQueryParams<T extends { [K in keyof T]: T[K] } = ParsedUrlQuery>() {
  const { query } = useRouter();

  return query as T & ParsedUrlQuery;
}
