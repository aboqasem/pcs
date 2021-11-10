import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Link } from '@/components/Link';
import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import { useProfileQuery } from '@/lib/api/services/users.service';
import { dashboardActions } from '@/lib/constants/dashboard.constants';
import { globalNavigationItems } from '@/lib/constants/global.constants';
import { PagePath } from '@/lib/constants/shared.constants';
import { TPropsWithDehydratedState } from '@/lib/types';
import { classNames } from '@/lib/utils/style.utils';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { BsArrowUpRight } from 'react-icons/bs';
import { dehydrate } from 'react-query';

export default function Dashboard() {
  const { data: profile } = useProfileQuery();

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>

      <SidebarLayout navigationItems={globalNavigationItems[profile.role]}>
        <div className="flex flex-col px-4 m-6 mx-auto space-y-8 max-w-7xl sm:px-6 md:px-8">
          <div>
            <h1 className="text-3xl">Welcome, {profile.fullName}!</h1>
          </div>

          <div className="overflow-hidden bg-white rounded-md shadow">
            <ul role="list" className="divide-y divide-gray-200">
              {dashboardActions[profile.role].map((action) => (
                <li
                  key={action.title}
                  className="relative px-8 py-10 bg-white lg:px-12 group focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500"
                >
                  <div className="flex items-center space-x-4">
                    <span
                      className={classNames(
                        'rounded-lg inline-flex p-3 ring-4 ring-white',
                        action.iconColors,
                      )}
                    >
                      <action.icon className="w-6 h-6" aria-hidden="true" />
                    </span>

                    <h3 className="text-lg font-medium">
                      <Link href={action.pathname} className="focus:outline-none">
                        {/* Extend touch target to entire panel */}
                        <span className="absolute inset-0" aria-hidden="true" />
                        {action.title}
                      </Link>
                    </h3>
                  </div>

                  <span
                    className="absolute text-gray-300 pointer-events-none top-6 right-6 group-hover:text-gray-400"
                    aria-hidden="true"
                  >
                    <BsArrowUpRight className="w-6 h-6" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SidebarLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<TPropsWithDehydratedState> = async (ctx) => {
  const queryClient = new DefaultQueryClient();

  const result = await redirectIf(
    [{ destination: PagePath.SignIn, predicate: redirectionPredicates.isNotAuthenticated }],
    ctx,
    queryClient,
  );

  if (result.redirect) {
    return { redirect: result.redirect };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
