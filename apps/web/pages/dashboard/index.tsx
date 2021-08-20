import { BffPath, PagePath } from '@/lib/constants';
import { usePost } from '@/lib/hooks';
import { redirectIf } from '@/lib/services/auth.service';
import { UserDto } from '@myplatform/shared-data-access';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Index(user: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { push } = useRouter();
  const { sendRequest, isPending, data, error } = usePost(BffPath.SignOut);

  const onSignOutClick = async () => {
    await sendRequest();
  };

  useEffect(() => {
    if (data || error) {
      push(PagePath.SignIn);
    }
  }, [data, error, push]);

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>

      <main className="flex items-end justify-between m-6">
        <div>
          <h1 className="pt-5 pl-5 text-3xl">
            {data ? 'Goodbye, ' : 'Welcome, '}
            {user.preferredName}!
          </h1>
        </div>
        <div>
          <button
            onClick={onSignOutClick}
            disabled={isPending || !!data}
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm disabled:opacity-50 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign out
          </button>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<UserDto> = async (ctx) => {
  const redirectAndUser = await redirectIf(ctx, {
    notAuth: PagePath.SignIn,
  });
  if (redirectAndUser[0]) {
    return { redirect: redirectAndUser[0] };
  }
  const user = redirectAndUser[1];

  return {
    props: user,
  };
};
