import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { TabsLayout } from '@/components/layouts/TabsLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import { useCourseQuery } from '@/lib/api/services/courses.service';
import { useProfileQuery } from '@/lib/api/services/users.service';
import { courseNavigationItems, courseTabs } from '@/lib/constants/courses.constants';
import { PagePath } from '@/lib/constants/shared.constants';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { TPropsWithDehydratedState } from '@/lib/types';
import { UserRole } from '@pcs/shared-data-access';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { dehydrate } from 'react-query';

export default function CourseAbout() {
  const { push } = useRouter();

  const { courseId } = useQueryParams<{ courseId: string }>();

  const { data: profile } = useProfileQuery<UserRole.Instructor>();

  const courseQuery = useCourseQuery(courseId, { onError: () => push(PagePath.Courses) });
  const course = useMemo(() => courseQuery.data, [courseQuery.data]);

  const isCourseLoading = courseQuery.isLoading;

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{course ? `About ${course.title}` : 'About course'}</title>
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
                        <article>
                          {/* Course header */}
                          <div>
                            <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8 xl:pt-4">
                              <div className="flex-1 min-w-0 mt-6 sm:block">
                                <h1 className="text-2xl font-bold text-gray-900 truncate">
                                  {course.title}
                                </h1>
                              </div>
                            </div>
                          </div>

                          {/* Description list */}
                          <div className="max-w-5xl px-4 mx-auto mt-6 sm:px-6 lg:px-8">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                              {course.description && (
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                                  <dd className="mt-1 text-sm text-gray-900">
                                    {course.description}
                                  </dd>
                                </div>
                              )}

                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Begin date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {course.beginsAt.toDateString()}
                                </dd>
                              </div>

                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">End date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {course.endsAt.toDateString()}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </article>
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
