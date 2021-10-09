import { fetchProfile } from '@/lib/api';
import { PagePath } from '@/lib/constants';
import { UserDto } from '@pcs/shared-data-access';
import { GetServerSidePropsContext, NextPageContext, Redirect } from 'next';
import { QueryClient } from 'react-query';

type TAuthPredicateTypes = {
  isAuthenticated: { redirect: Redirect; user: UserDto } | { redirect?: never; user?: never };
  isNotAuthenticated: { redirect: Redirect; user?: never } | { redirect?: never; user: UserDto };
};

type TAuthPredicateName = keyof TAuthPredicateTypes;
type TAuthPredicateFn = (user?: UserDto) => boolean;
type TAuthPredicateNameOrFn = TAuthPredicateName | TAuthPredicateFn;

type TAuthPredicateData<T extends TAuthPredicateNameOrFn = TAuthPredicateNameOrFn> = [
  destination: string,
  predicate: T,
];

export const authPredicates: Record<TAuthPredicateName, (user?: UserDto) => boolean> = {
  isAuthenticated: (user?: UserDto) => !!user,
  isNotAuthenticated: (user?: UserDto) => !user,
};

export async function redirectIf<T extends TAuthPredicateData<TAuthPredicateName>[]>(
  predicates: T,
  ctx: GetServerSidePropsContext | NextPageContext,
  queryClient?: QueryClient,
): Promise<TAuthPredicateTypes[T[number][1]]>;

export async function redirectIf(
  predicates: TAuthPredicateData[],
  ctx: GetServerSidePropsContext | NextPageContext,
  queryClient?: QueryClient,
): Promise<{ redirect?: Redirect; user?: UserDto }>;

export async function redirectIf(
  predicates: TAuthPredicateData[],
  ctx: GetServerSidePropsContext | NextPageContext,
  queryClient?: QueryClient,
): Promise<{ redirect?: Redirect; user?: UserDto }> {
  const user = await fetchProfile(ctx.req?.headers.cookie, queryClient).catch(() => undefined);

  const [serverCtx, pageCtx] = [ctx as GetServerSidePropsContext, ctx as NextPageContext];
  const intendedPath = (serverCtx.resolvedUrl ?? pageCtx.asPath) as string | undefined;
  const intended = (intendedPath && `?intended=${intendedPath}`) ?? '';

  for (const [destination, predicateNameOrFn] of predicates) {
    const predicateFn =
      typeof predicateNameOrFn === 'function'
        ? predicateNameOrFn
        : authPredicates[predicateNameOrFn];

    if (predicateFn(user)) {
      return {
        redirect: {
          destination: `${destination}${destination === PagePath.SignIn ? intended : ''}`,
          permanent: false,
        },
        user,
      };
    }
  }

  return { user };
}
