import { Link, MainSidebarLayout } from '@/components';
import { redirectIf, redirectionPredicates, useProfileQuery } from '@/lib/api';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import { dashboardActions, PagePath } from '@/lib/constants';
import { TPropsWithDehydratedState } from '@/lib/types';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { BsArrowUpRight } from 'react-icons/bs';
import { dehydrate } from 'react-query';

export default function Dashboard() {
  const profileQuery = useProfileQuery();
  const { data: profile } = profileQuery;

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>

      <MainSidebarLayout>
        <div className="flex flex-col px-4 m-6 mx-auto space-y-8 max-w-7xl sm:px-6 md:px-8">
          <div>
            <h1 className="text-3xl">Welcome, {profile.fullName}!</h1>
          </div>

          <div className="overflow-hidden bg-gray-200 divide-y divide-gray-200 rounded-lg shadow sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-px">
            {dashboardActions[profile.role].map((action, i) => (
              <div
                key={action.title}
                className={`
                  ${i === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : ''}
                  ${i === 1 ? 'sm:rounded-tr-lg' : ''}
                  ${i === dashboardActions[profile.role].length - 2 ? 'sm:rounded-bl-lg' : ''}
                  ${
                    i === dashboardActions[profile.role].length - 1
                      ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none'
                      : ''
                  }
                  relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500
                `}
              >
                <div>
                  <span
                    className={`${action.iconColors} rounded-lg inline-flex p-3 ring-4 ring-white`}
                  >
                    <action.icon className="w-6 h-6" aria-hidden="true" />
                  </span>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <Link href={action.href} className="focus:outline-none">
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
              </div>
            ))}
          </div>
        </div>
      </MainSidebarLayout>
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
