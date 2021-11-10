import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { PagePath } from '@/lib/constants/shared.constants';
import { GetServerSideProps } from 'next';

export default function Index() {
  return null;
}

export const getServerSideProps: GetServerSideProps<Record<string, never>> = async (ctx) => {
  const result = await redirectIf(
    [
      { destination: PagePath.Dashboard, predicate: redirectionPredicates.isAuthenticated },
      { destination: PagePath.SignIn, predicate: redirectionPredicates.isNotAuthenticated },
    ],
    ctx,
  );

  return { redirect: result.redirect! };
};
