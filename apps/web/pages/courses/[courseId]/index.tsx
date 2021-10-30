import { Link, LoadingSpinner, SidebarLayout, TabsLayout } from '@/components';
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
import { useMemo } from 'react';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { dehydrate } from 'react-query';

export default function Course() {
  const { courseId } = useQueryParams<{ courseId: string }>();

  const { data: profile } = useProfileQuery<UserRole.Instructor>();

  const courseQuery = useOwnCourseQuery(courseId);
  const course = useMemo(() => courseQuery.data, [courseQuery.data]);

  const isCourseLoading = courseQuery.isLoading;
  const isCourseNotFound = !!courseId && !course;

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{isCourseLoading ? 'Course' : course?.title ?? 'Course not found'}</title>
      </Head>

      <SidebarLayout navigationItems={courseNavigationItems[profile.role]}>
        <div className="relative flex flex-col h-full overflow-hidden bg-white">
          <TabsLayout tabs={courseTabs[profile.role]}>
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              {course ? (
                <div className="relative z-0 flex flex-1 overflow-hidden">
                  {course || isCourseNotFound ? (
                    <div className="relative z-0 flex-1 overflow-y-auto focus:outline-none xl:order-last">
                      {course ? (
                        <article>
                          {/* Profile header */}
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
                                  {course.beginDate.toDateString()}
                                </dd>
                              </div>

                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">End date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {course.endDate.toDateString()}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </article>
                      ) : (
                        <div className="relative flex flex-col items-center justify-center w-full p-12">
                          <div className="text-center">
                            <FaChalkboardTeacher
                              className="w-12 h-12 mx-auto text-gray-400"
                              aria-hidden="true"
                            />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              Course not found
                            </h3>

                            <div className="mt-4">
                              <Link
                                href={PagePath.Courses}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Select Course
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative flex-col items-center justify-center hidden w-full p-12 m-10 border-2 border-gray-400 border-dashed rounded-lg xl:flex">
                      <FaChalkboardTeacher
                        className="w-12 h-12 mx-auto text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="block mt-2 text-sm font-medium text-gray-900">
                        Select a course
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center">
                  {isCourseLoading ? (
                    <LoadingSpinner className="w-16 h-16" />
                  ) : (
                    <div className="text-center">
                      <FaChalkboardTeacher
                        className="w-12 h-12 mx-auto text-gray-400"
                        aria-hidden="true"
                      />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Course not found</h3>

                      <div className="mt-4">
                        <Link
                          href={PagePath.Courses}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Back to courses
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsLayout>
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
