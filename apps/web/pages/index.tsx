import { redirectIf, redirectionRules } from '@/lib/api';
import { PagePath } from '@/lib/constants';
import { GetServerSideProps } from 'next';

export default function Index() {
  return null;
}

export const getServerSideProps: GetServerSideProps<Record<string, never>> = async (ctx) => {
  const result = await redirectIf(
    [
      { destination: PagePath.Dashboard, predicate: redirectionRules.isAuthenticated },
      { destination: PagePath.SignIn, predicate: redirectionRules.isNotAuthenticated },
    ],
    ctx,
  );

  return { redirect: result.redirect! };
};
