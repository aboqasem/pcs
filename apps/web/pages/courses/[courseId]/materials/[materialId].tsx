import { Dropdown, IDropdownItem } from '@/components/Dropdown';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import { useOwnCourseMaterialQuery } from '@/lib/api/services/courses.service';
import { useProfileQuery } from '@/lib/api/services/users.service';
import { courseNavigationItems } from '@/lib/constants/courses.constants';
import { PagePath } from '@/lib/constants/shared.constants';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { TPropsWithDehydratedState } from '@/lib/types';
import { UserRole } from '@pcs/shared-data-access';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo, useRef } from 'react';
import { dehydrate } from 'react-query';

export default function Material() {
  const { push } = useRouter();
  const { courseId, materialId } = useQueryParams<{ courseId: string; materialId: string }>();

  const courseHref = useMemo(
    () => ({ pathname: PagePath.Course, query: { courseId } }),
    [courseId],
  );

  const { data: profile } = useProfileQuery<UserRole.Instructor>();

  const materialQuery = useOwnCourseMaterialQuery(courseId, materialId, {
    onError: () => push(courseHref),
  });
  const material = useMemo(() => materialQuery.data, [materialQuery.data]);

  const isMaterialLoading = materialQuery.isLoading;

  const { current: dropdownItems } = useRef<IDropdownItem[]>([
    { label: 'Coding' },
    { label: 'Multiple choice' },
    { label: 'Short answer' },
  ]);

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{material?.title ?? 'Material'}</title>
      </Head>

      <SidebarLayout navigationItems={courseNavigationItems[profile.role]}>
        <div className="relative flex flex-col h-full overflow-hidden bg-white">
          {isMaterialLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <LoadingSpinner className="w-16 h-16" />
            </div>
          ) : (
            <>
              {!!material && (
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                  <div className="relative z-0 flex flex-1 overflow-hidden">
                    <div className="relative z-0 flex flex-col flex-1 overflow-y-auto focus:outline-none xl:order-last">
                      {/* Page title & actions */}
                      <div className="px-6 py-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate">
                            {material.title}
                          </h1>
                        </div>

                        <div className="flex justify-end mt-4 sm:mt-0">
                          <Dropdown title="Add question" items={dropdownItems} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
