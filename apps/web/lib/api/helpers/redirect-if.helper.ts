import { PagePath } from '@/lib/constants/shared.constants';
import { UserDto, UserRole } from '@pcs/shared-data-access';
import { GetServerSidePropsContext, NextPageContext, Redirect } from 'next';
import { QueryClient } from 'react-query';
import { fetchProfile } from '../services/users.service';

type TRedirectionRule = { destination: string; predicate: (user?: UserDto) => boolean };

export const redirectionPredicates = {
  isAuthenticated: (user?: UserDto): user is UserDto => !!user,
  isNotAuthenticated: (user?: UserDto): user is undefined => !user,
  isNotInRoles: (roles: UserRole[]) => (user?: UserDto) => {
    return redirectionPredicates.isNotAuthenticated(user) || !roles.includes(user.role);
  },
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
