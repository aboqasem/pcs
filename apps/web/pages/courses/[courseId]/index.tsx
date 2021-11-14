import { CreateMaterialForm, Link } from '@/components';
import { Dropdown, IDropdownItem } from '@/components/Dropdown';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { TabsLayout } from '@/components/layouts/TabsLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import { useCourseMaterialsQuery, useCourseQuery } from '@/lib/api/services/courses.service';
import { useProfileQuery } from '@/lib/api/services/users.service';
import { courseNavigationItems, courseTabs } from '@/lib/constants/courses.constants';
import { PagePath } from '@/lib/constants/shared.constants';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { TPropsWithDehydratedState } from '@/lib/types';
import { capitalize, MaterialType, UserRole } from '@pcs/shared-data-access';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { dehydrate } from 'react-query';
import { UrlObject } from 'url';

export default function Course() {
  const { push } = useRouter();
  const { courseId } = useQueryParams<{ courseId: string }>();

  const [materialFormState, setMaterialFormState] = useState({
    type: MaterialType.Tutorial as MaterialType,
    isShown: false,
  });

  const { data: profile } = useProfileQuery<UserRole.Instructor>();

  const courseQuery = useCourseQuery(courseId, { onError: () => push(PagePath.Courses) });
  const course = useMemo(() => courseQuery.data, [courseQuery.data]);

  const materialsQuery = useCourseMaterialsQuery(courseId, { enabled: !!course });
  const materials = useMemo(() => materialsQuery.data ?? [], [materialsQuery.data]);

  const isCourseLoading = courseQuery.isLoading;
  const areMaterialsLoading = materialsQuery.isLoading;

  const materialsHrefs = useMemo(
    () =>
      materials.reduce((map, { id }) => {
        return map.set(id, {
          pathname: PagePath.CourseMaterial,
          query: { courseId, materialId: id },
        });
      }, new Map<string, UrlObject>()),
    [courseId, materials],
  );

  const { current: dropdownItems } = useRef<IDropdownItem[]>(
    Object.values(MaterialType).map((type) => ({
      label: capitalize(type),
      onClick: () => setMaterialFormState({ type, isShown: true }),
    })),
  );

  const closeCreateMaterialForm = useCallback(
    () => setMaterialFormState((prev) => ({ ...prev, isShown: false })),
    [],
  );

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
                      <div className="relative z-0 flex flex-col flex-1 overflow-y-auto focus:outline-none xl:order-last">
                        {/* Page title & actions */}
                        <div className="px-6 py-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate">
                              {course.title}
                            </h1>
                          </div>

                          <div className="flex justify-end mt-4 sm:mt-0">
                            <Dropdown title="Create" items={dropdownItems} />
                          </div>
                        </div>

                        {/* Materials list */}
                        <nav
                          className="flex flex-col flex-1 min-h-0 overflow-y-auto"
                          aria-label="Materials"
                        >
                          {areMaterialsLoading ? (
                            <div className="flex items-center justify-center flex-1 text-center">
                              <LoadingSpinner className="w-12 h-12" />
                            </div>
                          ) : (
                            <ul role="list" className="relative z-0 divide-y divide-gray-200">
                              {materials.map((m) => {
                                return (
                                  <li key={m.id}>
                                    <div className="relative flex items-center px-6 py-5 space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500">
                                      <div className="flex-1 max-w-sm min-w-0">
                                        <Link
                                          href={materialsHrefs.get(m.id)!}
                                          className="focus:outline-none"
                                        >
                                          {/* Extend touch target to entire panel */}
                                          <span className="absolute inset-0" aria-hidden="true" />
                                          <p className="text-sm font-medium text-gray-900">
                                            {m.title}
                                          </p>
                                        </Link>
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
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

      <CreateMaterialForm {...materialFormState} close={closeCreateMaterialForm} />
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
