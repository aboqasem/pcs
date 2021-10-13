import { redirectIf, useProfileQuery, useSignOutMutation } from '@/lib/api';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import { PagePath } from '@/lib/constants';
import { TPropsWithDehydratedState } from '@/lib/types';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useCallback } from 'react';
import { dehydrate } from 'react-query';

export default function Dashboard() {
  const profile = useProfileQuery();
  const { data: user } = profile;

  const signOut = useSignOutMutation();

  const onSignOutClick = useCallback(() => {
    signOut.mutate();
  }, [signOut]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>

      <main className="flex items-start justify-between m-6">
        <div>
          <h1 className="pl-5 text-3xl">Welcome, {user.fullName}!</h1>
          <h2 className="pt-5 pl-5 text-2xl">
            You are <strong className="font-semibold">{user.role}</strong>
          </h2>
        </div>
        <div>
          <button
            onClick={onSignOutClick}
            disabled={signOut.isLoading || !!signOut.data}
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm disabled:opacity-50 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign out
          </button>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<TPropsWithDehydratedState> = async (ctx) => {
  const queryClient = new DefaultQueryClient();

  const result = await redirectIf([[PagePath.SignIn, 'isNotAuthenticated']], ctx, queryClient);

  if (result.redirect) {
    return { redirect: result.redirect };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
