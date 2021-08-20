import { UserDto } from '@myplatform/shared-data-access';
import { GetServerSidePropsContext, NextPageContext, Redirect } from 'next';
import { PagePath } from '../constants';
import { getCurrentUser } from './users.service';

type RedirectIfNotAuthOptions = {
  notAuth: PagePath;
  auth?: never;
  isEmailVerified?: never;
  isEmailNotVerified?: never;
};

type RedirectIfAuthOptions = {
  notAuth?: never;
  auth?: PagePath;
  isEmailVerified?: PagePath;
  isEmailNotVerified?: PagePath;
} & (
  | { auth: PagePath; isEmailVerified?: never; isEmailNotVerified?: never }
  | { isEmailVerified: PagePath; auth?: never }
  | { isEmailNotVerified: PagePath; auth?: never }
);

type RedirectIfMultiOptions = {
  notAuth?: PagePath;
  auth?: PagePath;
  isEmailVerified?: PagePath;
  isEmailNotVerified?: PagePath;
} & (
  | { notAuth: PagePath; auth: PagePath; isEmailVerified?: never; isEmailNotVerified?: never }
  | { isEmailVerified: PagePath; auth?: never }
  | { isEmailNotVerified: PagePath; auth?: never }
);

type RedirectIfOptions = RedirectIfNotAuthOptions | RedirectIfAuthOptions | RedirectIfMultiOptions;

export async function redirectIf(
  ctx: GetServerSidePropsContext | NextPageContext,
  options: RedirectIfNotAuthOptions,
): Promise<[Redirect, undefined] | [undefined, UserDto]>;

export async function redirectIf(
  ctx: GetServerSidePropsContext | NextPageContext,
  options: RedirectIfAuthOptions,
): Promise<[Redirect, UserDto] | [undefined, undefined]>;

export async function redirectIf(
  ctx: GetServerSidePropsContext | NextPageContext,
  options: RedirectIfMultiOptions,
): Promise<[Redirect | undefined, UserDto | undefined]>;

export async function redirectIf(
  ctx: GetServerSidePropsContext | NextPageContext,
  { notAuth, isEmailVerified, isEmailNotVerified, auth }: RedirectIfOptions,
): Promise<[Redirect | undefined, UserDto | undefined]> {
  const user = await getCurrentUser(ctx);
  const serverCtx = ctx as GetServerSidePropsContext;
  const pageCtx = ctx as NextPageContext;
  const redirect: Redirect = {
    destination: '',
    permanent: false,
  };

  if (!user) {
    if (notAuth) {
      const clientPath = (serverCtx.resolvedUrl ?? pageCtx.asPath) as string | undefined;
      const intended = (clientPath && `?intended=${clientPath}`) ?? '';

      return [{ ...redirect, destination: `${notAuth}${intended}` }, undefined];
    }
    return [undefined, undefined];
  }

  if (auth) {
    return [{ ...redirect, destination: auth }, user];
  }

  if (isEmailVerified && user.isEmailVerified) {
    return [{ ...redirect, destination: isEmailVerified }, user];
  }

  if (isEmailNotVerified && !user.isEmailVerified) {
    return [{ ...redirect, destination: isEmailNotVerified }, user];
  }

  return [undefined, user];
}
