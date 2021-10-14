import { fetchProfile } from '@/lib/api';
import { PagePath } from '@/lib/constants';
import { UserDto } from '@pcs/shared-data-access';
import { GetServerSidePropsContext, NextPageContext, Redirect } from 'next';
import { QueryClient } from 'react-query';

type TRedirectionRule = { destination: string; predicate: (user?: UserDto) => boolean };

export const redirectionRules = {
  isAuthenticated: (user?: UserDto) => !!user,
  isNotAuthenticated: (user?: UserDto) => !user,
};

export async function redirectIf(
  rules: TRedirectionRule[],
  ctx: GetServerSidePropsContext | NextPageContext,
  queryClient?: QueryClient,
): Promise<{ redirect?: Redirect; user?: UserDto }> {
  const user = await fetchProfile(ctx.req?.headers.cookie, queryClient).catch(() => undefined);

  const [serverCtx, pageCtx] = [ctx as GetServerSidePropsContext, ctx as NextPageContext];
  const intendedPath = (serverCtx.resolvedUrl ?? pageCtx.asPath) as string | undefined;
  const intendedQueryParam = (intendedPath && `?intended=${intendedPath}`) ?? '';

  for (const { destination, predicate } of rules) {
    if (predicate(user)) {
      return {
        redirect: {
          destination: `${destination}${destination === PagePath.SignIn ? intendedQueryParam : ''}`,
          permanent: false,
        },
        user,
      };
    }
  }

  return { user };
}
