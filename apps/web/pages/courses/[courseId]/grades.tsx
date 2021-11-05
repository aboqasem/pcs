import { SidebarLayout, TabsLayout } from '@/components';
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
import { dehydrate } from 'react-query';

export default function Grades() {
  const { courseId } = useQueryParams<{ courseId: string }>();

  const { data: profile } = useProfileQuery<UserRole.Instructor>();

  const courseQuery = useOwnCourseQuery(courseId);
  const course = useMemo(() => courseQuery.data, [courseQuery.data]);

  const isCourseLoading = courseQuery.isLoading;

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {isCourseLoading
            ? 'Grades for course'
            : (course?.title && `Grades for ${course.title}`) ?? 'Course not found'}
        </title>
      </Head>

      <SidebarLayout navigationItems={courseNavigationItems[profile.role]}>
        <div className="relative flex flex-col h-full overflow-hidden bg-white">
          <TabsLayout tabs={courseTabs[profile.role]}>
            <div className="flex flex-col items-center justify-center flex-1 h-full min-w-0 overflow-hidden">
              Course grades
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
