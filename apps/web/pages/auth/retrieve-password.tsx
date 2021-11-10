import { RetrievePasswordForm } from '@/components/forms/RetrievePasswordForm';
import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { PagePath } from '@/lib/constants/shared.constants';
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
    [{ destination: PagePath.Dashboard, predicate: redirectionPredicates.isAuthenticated }],
    ctx,
  );

  if (result.redirect) {
    return { redirect: result.redirect };
  }

  return {
    props: {},
  };
};
