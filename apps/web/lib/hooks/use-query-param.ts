import { useRouter } from 'next/router';

type QueryParam = string | string[] | undefined;

export function useQueryParam<T extends QueryParam = QueryParam>(name: string) {
  const { query } = useRouter();

  return query[name] as T | undefined;
}
