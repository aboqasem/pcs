import { AddCourseStudentForm } from '@/components/forms/AddCourseStudentsForm';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { TabsLayout } from '@/components/layouts/TabsLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import { useCoursePeopleQuery, useCourseQuery } from '@/lib/api/services/courses.service';
import { useProfileQuery } from '@/lib/api/services/users.service';
import { courseNavigationItems, courseTabs } from '@/lib/constants/courses.constants';
import { PagePath } from '@/lib/constants/shared.constants';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { TPropsWithDehydratedState } from '@/lib/types';
import { UserRole } from '@pcs/shared-data-access';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { dehydrate } from 'react-query';

export default function CoursePeople() {
  const { push } = useRouter();
  const { courseId } = useQueryParams<{ courseId: string }>();

  const [isAddStudentsFormShown, setIsAddStudentsFormShown] = useState(false);

  const { data: profile } = useProfileQuery<UserRole.Instructor | UserRole.Student>();
  const isInstructor = profile?.role === UserRole.Instructor;

  const courseQuery = useCourseQuery(courseId, { onError: () => push(PagePath.Courses) });
  const course = useMemo(() => courseQuery.data, [courseQuery.data]);
  const isCourseLoading = courseQuery.isLoading;

  const peopleQuery = useCoursePeopleQuery(courseId, {
    enabled: !!course,
    onError: (error) => {
      toast.error(error.message, { id: 'getPeopleError' });
      push({ pathname: PagePath.Course, query: { courseId } });
    },
  });
  const people = useMemo(() => peopleQuery.data, [peopleQuery.data]);

  const courseInstructor = useMemo(
    () => people?.find((u) => u.role === UserRole.Instructor),
    [people],
  );
  const enrolledStudents = useMemo(
    () => people?.filter((u) => u.role === UserRole.Student),
    [people],
  );

  const openAddStudentsForm = useCallback(() => setIsAddStudentsFormShown(true), []);
  const closeAddStudentsForm = useCallback(() => setIsAddStudentsFormShown(false), []);

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{`People of ${course?.title ?? 'course'}`}</title>
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
                  <div className="relative flex h-full overflow-hidden bg-white">
                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                      <div className="relative z-0 flex flex-col flex-1 overflow-hidden">
                        {/* Page title & actions */}
                        <div className="px-6 py-4 sm:flex sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate">
                              People
                            </h1>
                          </div>

                          {isInstructor && (
                            <div className="flex justify-end mt-4 sm:mt-0">
                              <button
                                type="button"
                                disabled={!course}
                                onClick={openAddStudentsForm}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm order-0 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 disabled:opacity-50"
                              >
                                Add student
                              </button>
                            </div>
                          )}
                        </div>

                        {/* People list */}
                        <nav className="min-h-0 overflow-y-auto" aria-label="People">
                          <div className="relative">
                            <div className="sticky top-0 z-10 px-6 py-1 text-sm font-medium text-gray-500 border-t border-b border-gray-200 bg-gray-50">
                              <h3>Instructor</h3>
                            </div>

                            <div className="relative flex items-center px-6 py-5 space-x-3">
                              {courseInstructor ? (
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {courseInstructor.fullName}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {courseInstructor.email}
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center flex-1 text-center">
                                  <LoadingSpinner className="w-10 h-10" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="relative">
                            <div className="sticky top-0 z-10 px-6 py-1 text-sm font-medium text-gray-500 border-t border-b border-gray-200 bg-gray-50">
                              <h3>Students</h3>
                            </div>

                            {enrolledStudents ? (
                              <ul role="list" className="relative z-0 divide-y divide-gray-200">
                                {enrolledStudents.map((student) => (
                                  <li key={student.id}>
                                    <div className="relative flex items-center px-6 py-5 space-x-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                          {student.fullName}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                          {student.email}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="flex flex-col items-center justify-center px-6 py-5 space-x-3 text-center">
                                <LoadingSpinner className="w-10 h-10" />
                              </div>
                            )}
                          </div>
                        </nav>
                      </div>
                    </div>
                  </div>
                </TabsLayout>
              )}
            </>
          )}
        </div>
      </SidebarLayout>

      {isInstructor && (
        <AddCourseStudentForm isShown={isAddStudentsFormShown} close={closeAddStudentsForm} />
      )}
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
        predicate: redirectionPredicates.isNotInRoles([UserRole.Instructor, UserRole.Student]),
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
