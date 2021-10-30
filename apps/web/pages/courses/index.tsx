import { Link, LoadingSpinner, SidebarLayout } from '@/components';
import { CreateCourseForm } from '@/components/forms/CreateCourseForm';
import {
  DefaultQueryClient,
  redirectIf,
  redirectionPredicates,
  useOwnCoursesQuery,
  useProfileQuery,
} from '@/lib/api';
import { globalNavigationItems, PagePath } from '@/lib/constants';
import { TPropsWithDehydratedState } from '@/lib/types';
import { UserRole } from '@pcs/shared-data-access';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useCallback, useMemo, useState } from 'react';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { HiPlus } from 'react-icons/hi';
import { dehydrate } from 'react-query';
import type { UrlObject } from 'url';

export default function Courses() {
  const [isCreateCourseFormShown, setIsCreateCourseFormShown] = useState(false);

  const { data: profile } = useProfileQuery();

  const coursesQuery = useOwnCoursesQuery();
  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);

  const areCoursesLoading = coursesQuery.isLoading;

  const coursesHrefs = useMemo(
    () =>
      courses.reduce((map, { id }) => {
        return map.set(id, { pathname: PagePath.Course, query: { courseId: id } });
      }, new Map<string, UrlObject>()),
    [courses],
  );

  const openCreateCourseForm = useCallback(() => setIsCreateCourseFormShown(true), []);
  const closeCreateCourseForm = useCallback(() => setIsCreateCourseFormShown(false), []);

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Manage courses</title>
      </Head>

      <SidebarLayout navigationItems={globalNavigationItems[profile.role]}>
        <div className="relative flex h-full overflow-hidden bg-white">
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {courses.length ? (
              <div className="relative z-0 flex flex-1 overflow-hidden">
                <aside className="flex-shrink-0 w-full border-r border-gray-200 xl:order-first xl:flex xl:flex-col">
                  <div className="px-6 pt-6 pb-4">
                    <h2 className="text-lg font-medium text-gray-900">Courses</h2>
                    <div className="flex flex-col justify-stretch">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center px-4 py-2 mt-6 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                        onClick={openCreateCourseForm}
                      >
                        Create course
                      </button>
                    </div>
                  </div>

                  {/* Courses list */}
                  <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Courses">
                    <ul role="list" className="relative z-0 divide-y divide-gray-200">
                      {courses.map((c) => {
                        return (
                          <li key={c.id}>
                            <div className="relative flex items-center px-6 py-5 space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500">
                              <div className="flex-1 min-w-0">
                                <Link href={coursesHrefs.get(c.id)!} className="focus:outline-none">
                                  {/* Extend touch target to entire panel */}
                                  <span className="absolute inset-0" aria-hidden="true" />
                                  <p className="text-sm font-medium text-gray-900">{c.title}</p>

                                  <p className="hidden text-sm text-gray-500 truncate sm:block">
                                    Begins on {c.beginDate.toDateString()} - Ends on{' '}
                                    {c.endDate.toDateString()}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate sm:hidden">
                                    {c.beginDate.toLocaleDateString('en-US')} -{' '}
                                    {c.endDate.toLocaleDateString('en-US')}
                                  </p>
                                </Link>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </aside>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                {areCoursesLoading ? (
                  <LoadingSpinner className="w-16 h-16" />
                ) : (
                  <>
                    <FaChalkboardTeacher
                      className="w-12 h-12 mx-auto text-gray-400"
                      aria-hidden="true"
                    />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                    <p className="mt-1 text-sm text-gray-500">Start by creating new courses.</p>

                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={openCreateCourseForm}
                      >
                        <HiPlus className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
                        Create Course
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>

      <CreateCourseForm isShown={isCreateCourseFormShown} close={closeCreateCourseForm} />
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
