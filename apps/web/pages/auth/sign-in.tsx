import { SignInForm } from '@/components';
import { redirectIf } from '@/lib/api';
import { PagePath } from '@/lib/constants';
import { useQueryParam } from '@/lib/hooks';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useRef } from 'react';

export default function SignIn() {
  const { push } = useRouter();
  const intendedPath = useQueryParam<string>('intended') || PagePath.Dashboard;

  // to mark true after authenticating and on pushing to dashboard.
  // since pushing should not re-render this component, if a render happens then it will find didPush true,
  // so we know an error has happened (e.g. auth cookie not set).
  const didAuthenticateAndPush = useRef(false);

  const onSignInSuccess = useCallback(() => {
    didAuthenticateAndPush.current = true;
    push(intendedPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intendedPath]);

  return (
    <>
      <Head>
        <title>Sign in to PCS</title>
      </Head>

      <SignInForm
        onSuccess={onSignInSuccess}
        error={
          didAuthenticateAndPush.current
            ? 'You have been authenticated, but we have a problem convincing your browser of that'
            : undefined
        }
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Record<string, never>> = async (ctx) => {
  const result = await redirectIf([[PagePath.Dashboard, 'isAuthenticated']], ctx);

  if (result.redirect) {
    return { redirect: result.redirect };
  }

  return {
    props: {},
  };
};
