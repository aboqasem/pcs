import { redirectIf } from '@/lib/api';
import { PagePath } from '@/lib/constants';
import { GetServerSideProps } from 'next';

export default function Index() {
  return null;
}

export const getServerSideProps: GetServerSideProps<Record<string, never>> = async (ctx) => {
  const result = await redirectIf(
    [
      [PagePath.Dashboard, 'isAuthenticated'],
      [PagePath.SignIn, 'isNotAuthenticated'],
    ],
    ctx,
  );

  return { redirect: result.redirect! };
};
