import { CreateUsersForm, Link, LoadingSpinner, SidebarLayout } from '@/components';
import {
  DefaultQueryClient,
  redirectIf,
  redirectionPredicates,
  useAllUsersQuery,
  useProfileQuery,
} from '@/lib/api';
import { globalNavigationItems, PagePath } from '@/lib/constants';
import { useQueryParams } from '@/lib/hooks';
import { TPropsWithDehydratedState } from '@/lib/types';
import { capitalize, UserRole } from '@pcs/shared-data-access';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useCallback, useMemo, useRef, useState } from 'react';
import { HiChevronLeft, HiOutlineUser, HiPlus, HiUser, HiUsers } from 'react-icons/hi';
import { dehydrate } from 'react-query';

export default function Users() {
  const [isCreateUsersFormShown, setIsCreateUsersFormShown] = useState(false);

  const { userId } = useQueryParams<{ userId?: string }>();
  const selectedUserId = +(userId || NaN);

  const { data: profile } = useProfileQuery<UserRole.Admin>();

  const usersQuery = useAllUsersQuery({
    select: (users) => users.filter((u) => u.role !== UserRole.Admin),
  });
  const areUsersLoading = usersQuery.isLoading;
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const instructors = useMemo(() => users.filter((u) => u.role === UserRole.Instructor), [users]);
  const students = useMemo(() => users.filter((u) => u.role === UserRole.Student), [users]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId],
  );
  const isUserNotFound = !isNaN(selectedUserId) && !selectedUser;

  const openCreateUsersForm = useCallback(() => setIsCreateUsersFormShown(true), []);
  const closeCreateUsersForm = useCallback(() => setIsCreateUsersFormShown(false), []);

  const usersSections = useRef(['Instructors', 'Students'] as const);

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{selectedUser ? selectedUser.fullName : 'Manage users'}</title>
      </Head>

      <SidebarLayout navigationItems={globalNavigationItems[profile.role]}>
        <div className="relative flex h-full overflow-hidden bg-white">
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {users.length ? (
              <div className="relative z-0 flex flex-1 overflow-hidden">
                {selectedUser || isUserNotFound ? (
                  <div className="relative z-0 flex-1 overflow-y-auto focus:outline-none xl:order-last">
                    {/* Breadcrumb */}
                    <nav
                      className="flex items-start px-4 py-3 sm:px-6 lg:px-8 xl:hidden"
                      aria-label="Breadcrumb"
                    >
                      <Link
                        href=""
                        shallow
                        className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
                      >
                        <HiChevronLeft className="w-5 h-5 -ml-2 text-gray-400" aria-hidden="true" />
                        <span>Users</span>
                      </Link>
                    </nav>

                    {selectedUser ? (
                      <article>
                        {/* Profile header */}
                        <div>
                          <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8 xl:pt-4">
                            <div className="flex-1 min-w-0 mt-6 sm:block">
                              <h1 className="text-2xl font-bold text-gray-900 truncate">
                                {selectedUser.fullName}
                              </h1>
                            </div>
                          </div>
                        </div>

                        {/* Description list */}
                        <div className="max-w-5xl px-4 mx-auto mt-6 sm:px-6 lg:px-8">
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Email</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedUser.email}</dd>
                            </div>

                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Username</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {selectedUser.username}
                              </dd>
                            </div>

                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Full name</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {selectedUser.fullName}
                              </dd>
                            </div>

                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Role</dt>
                              <dd className="mt-1 text-sm inline-flex items-center px-2.5 py-0.5 rounded-md font-medium bg-gray-100 text-gray-800">
                                {capitalize(selectedUser.role)}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </article>
                    ) : (
                      <div className="relative flex flex-col items-center justify-center w-full p-12">
                        <div className="text-center">
                          <HiOutlineUser
                            className="w-12 h-12 mx-auto text-gray-400"
                            aria-hidden="true"
                          />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>

                          <p className="hidden mt-1 text-sm text-gray-500 xl:block">
                            Please select a user.
                          </p>

                          <div className="mt-4 xl:hidden">
                            <Link
                              href=""
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Select User
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative flex-col items-center justify-center hidden w-full p-12 m-10 border-2 border-gray-400 border-dashed rounded-lg xl:flex">
                    <HiUser className="w-12 h-12 mx-auto text-gray-400" aria-hidden="true" />
                    <span className="block mt-2 text-sm font-medium text-gray-900">
                      Select a user
                    </span>
                  </div>
                )}

                <aside
                  className={`
                  ${selectedUser || isUserNotFound ? 'hidden' : ''}
                  w-full flex-shrink-0 border-r border-gray-200 xl:order-first xl:flex xl:flex-col xl:w-96
                `}
                >
                  <div className="px-6 pt-6 pb-4">
                    <h2 className="text-lg font-medium text-gray-900">Users</h2>
                    <div className="flex flex-col justify-stretch">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center px-4 py-2 mt-6 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                        onClick={openCreateUsersForm}
                      >
                        Create users
                      </button>
                    </div>
                  </div>

                  {/* Users list */}
                  <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Users">
                    {usersSections.current.map((role) => {
                      const sectionUsers = role === 'Instructors' ? instructors : students;

                      if (sectionUsers.length === 0) {
                        return null;
                      }

                      return (
                        <div key={role} className="relative">
                          <div className="sticky top-0 z-10 px-6 py-1 text-sm font-medium text-gray-500 border-t border-b border-gray-200 bg-gray-50">
                            <h3>{role}</h3>
                          </div>

                          <ul role="list" className="relative z-0 divide-y divide-gray-200">
                            {sectionUsers.map((u) => {
                              const isCurrent = selectedUserId === u.id;

                              return (
                                <li key={u.id}>
                                  <div
                                    className={`
                                      ${isCurrent ? 'bg-gray-100' : 'hover:bg-gray-50'}
                                      relative flex items-center px-6 py-5 space-x-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500
                                    `}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <Link
                                        href={
                                          isCurrent ? '' : `?userId=${encodeURIComponent(u.id)}`
                                        }
                                        shallow
                                        className="focus:outline-none"
                                      >
                                        {/* Extend touch target to entire panel */}
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        <p className="text-sm font-medium text-gray-900">
                                          {u.fullName}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">{u.email}</p>
                                      </Link>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </nav>
                </aside>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                {areUsersLoading ? (
                  <LoadingSpinner className="w-16 h-16" />
                ) : (
                  <>
                    <HiUsers className="w-12 h-12 mx-auto text-gray-400" aria-hidden="true" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
                    <p className="mt-1 text-sm text-gray-500">Start by creating new users.</p>

                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={openCreateUsersForm}
                      >
                        <HiPlus className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
                        Create Users
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>

      <CreateUsersForm isShown={isCreateUsersFormShown} close={closeCreateUsersForm} />
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
        predicate: redirectionPredicates.isNotInRoles([UserRole.Admin]),
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
