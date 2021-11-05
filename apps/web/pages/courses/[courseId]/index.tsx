import { LoadingSpinner, SidebarLayout, TabsLayout } from '@/components';
import {
  DefaultQueryClient,
  redirectIf,
  redirectionPredicates,
  useOwnCourseQuery,
  useProfileQuery,
} from '@/lib/api';
import { courseNavigationItems, courseTabs, PagePath } from '@/lib/constants';
import { useQueryParams } from '@/lib/hooks';
import { TPropsWithDehydratedState } from '@/lib/types';
import { UserRole } from '@pcs/shared-data-access';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { dehydrate } from 'react-query';

export default function Course() {
  const { push } = useRouter();

  const { courseId } = useQueryParams<{ courseId: string }>();

  const { data: profile } = useProfileQuery<UserRole.Instructor>();

  const courseQuery = useOwnCourseQuery(courseId, { onError: () => push(PagePath.Courses) });
  const course = useMemo(() => courseQuery.data, [courseQuery.data]);

  const isCourseLoading = courseQuery.isLoading;

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{course?.title ?? 'Course'}</title>
      </Head>

      <SidebarLayout navigationItems={courseNavigationItems[profile.role]}>
        <div className="relative flex flex-col h-full overflow-hidden bg-white">
          {isCourseLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <LoadingSpinner className="w-16 h-16" />
            </div>
          ) : (
            <>
              {!!course && (
                <TabsLayout tabs={courseTabs[profile.role]}>
                  <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <div className="relative z-0 flex flex-1 overflow-hidden">
                      <div className="relative z-0 flex-1 overflow-y-auto focus:outline-none xl:order-last">
                        <div className="flex flex-col items-center justify-center flex-1 h-full min-w-0 overflow-hidden">
                          Course feed
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsLayout>
              )}
            </>
          )}
        </div>
      </SidebarLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<TPropsWithDehydratedState> = async (ctx) => {
  const queryClient = new DefaultQueryClient();

  const result = await redirectIf(
    [
      { destination: PagePath.SignIn, predicate: redirectionPredicates.isNotAuthenticated },
      {
        destination: PagePath.Dashboard,
        predicate: redirectionPredicates.isNotInRoles([UserRole.Instructor]),
      },
    ],
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
