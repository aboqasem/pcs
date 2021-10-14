import { RetrievePasswordForm } from '@/components';
import { redirectIf, redirectionRules } from '@/lib/api';
import { PagePath } from '@/lib/constants';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

export default function RetrievePassword() {
  return (
    <>
      <Head>
        <title>Retrieve your password - PCS</title>
      </Head>

      <RetrievePasswordForm />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Record<string, never>> = async (ctx) => {
  const result = await redirectIf(
    [{ destination: PagePath.Dashboard, predicate: redirectionRules.isAuthenticated }],
    ctx,
  );

  if (result.redirect) {
    return { redirect: result.redirect };
  }

  return {
    props: {},
  };
};
