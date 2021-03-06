import { Link } from '@/components/Link';
import { useSignOutMutation } from '@/lib/api/services/auth.service';
import { PagePath } from '@/lib/constants/shared.constants';
import { classNames } from '@/lib/utils/style.utils';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { Fragment, memo, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { HiMenuAlt2, HiOutlineLogout, HiX } from 'react-icons/hi';
import { IconType } from 'react-icons/lib';

export interface INavigationItem {
  name: string;
  pathname?: string;
  icon: IconType;
}

export interface ISidebarLayoutProps extends PropsWithChildren<Record<string, unknown>> {
  navigationItems?: INavigationItem[];
  narrow?: boolean;
}

export const SidebarLayout = memo(function MainSidebarLayout({
  children,
  navigationItems,
  narrow,
}: ISidebarLayoutProps) {
  const { pathname: currPathname, query } = useRouter();

  const navItemsWithHref = useMemo(
    () =>
      navigationItems?.map(({ pathname, ...rest }) => ({
        ...rest,
        href: {
          // no pathname means current pathname
          pathname: pathname ?? currPathname,
          // take only required query params like `id` in `/courses/[id]`
          query: Object.entries(query).reduce(
            (newQuery, [qName, qValue]) =>
              pathname?.includes(`[${qName}]`) ? { ...newQuery, [qName]: qValue } : newQuery,
            {} as ParsedUrlQuery,
          ),
        },
      })),
    [currPathname, navigationItems, query],
  );

  const currNavItem = useMemo(
    () =>
      navItemsWithHref
        // filter out nav items that don't match current pathname
        ?.filter((nav) => currPathname.startsWith(nav.href.pathname))
        // sort by pathname length (longest pathname first to get the most specific match) and take the most specific match
        .sort((navA, navB) => navB.href.pathname.length - navA.href.pathname.length)[0],
    [currPathname, navItemsWithHref],
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const signOutMutation = useSignOutMutation();
  const isSignOutDisabled = !signOutMutation.isIdle || signOutMutation.isLoading;

  const onSignOutClick = useCallback(() => {
    signOutMutation.mutate();
    setIsSidebarOpen(false);
  }, [signOutMutation]);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Transition.Root show={isSidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-40 flex md:hidden" onClose={setIsSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 bg-gray-800">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 pt-2 -mr-12">
                  <button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={closeSidebar}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <HiX className="w-6 h-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>

              <div className="flex items-center justify-center px-4 shrink-0">
                <Link href={PagePath.Dashboard}>
                  <img
                    className="w-auto h-8"
                    src="https://tailwindui.com/img/logos/workflow-mark-blue-600.svg"
                    alt="PCS's Logo"
                  />
                </Link>
              </div>

              <div className="flex-1 h-0 mt-5 overflow-y-auto">
                <nav className="px-2" aria-label="Sidebar">
                  {!!navItemsWithHref?.length && (
                    <>
                      <div className="space-y-1">
                        {navItemsWithHref.map((item) => {
                          const isCurrent = item === currNavItem!;

                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={classNames(
                                'group flex items-center px-2 py-2 text-base font-medium rounded-md',
                                isCurrent
                                  ? 'bg-gray-900 text-white'
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                              )}
                            >
                              <item.icon
                                className={classNames(
                                  'mr-4 shrink-0 h-6 w-6',
                                  isCurrent
                                    ? 'text-gray-300'
                                    : 'text-gray-400 group-hover:text-gray-300',
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>

                      <hr className="my-5 -mx-2 border-t border-gray-700" aria-hidden="true" />
                    </>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50"
                        disabled={isSignOutDisabled}
                        onClick={onSignOutClick}
                        title="Sign out"
                      >
                        <HiOutlineLogout className="w-6 h-6 shrink-0" aria-hidden="true" />{' '}
                        <span className="ml-2">Sign out</span>
                      </button>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </Transition.Child>

          <div className="shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:shrink-0">
        <div className={classNames('flex flex-col', narrow ? 'w-16' : 'w-64')}>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-center h-16 px-4 bg-gray-900 shrink-0">
              <Link href={PagePath.Dashboard}>
                <img
                  className="w-auto h-8"
                  src="https://tailwindui.com/img/logos/workflow-mark-blue-600.svg"
                  alt="PCS's Logo"
                />
              </Link>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto bg-gray-800">
              <nav className="flex-1 px-3 py-4" aria-label="Sidebar">
                {!!navItemsWithHref?.length && (
                  <>
                    <div className="space-y-1">
                      {navItemsWithHref.map((item) => {
                        const isCurrent = item === currNavItem!;

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                              isCurrent
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                              narrow && 'h-10 w-10 justify-center',
                            )}
                            title={item.name}
                          >
                            <item.icon
                              className={classNames(
                                'shrink-0 h-6 w-6',
                                isCurrent
                                  ? 'text-gray-300'
                                  : 'text-gray-400 group-hover:text-gray-300',
                              )}
                              aria-hidden="true"
                            />
                            <span className={classNames('ml-3', narrow && 'sr-only')}>
                              {item.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    <hr className="my-5 -mx-2 border-t border-gray-700" aria-hidden="true" />
                  </>
                )}

                <div className="space-y-1">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isSignOutDisabled}
                      onClick={onSignOutClick}
                      title="Sign out"
                    >
                      <HiOutlineLogout className="w-6 h-6 shrink-0" aria-hidden="true" />{' '}
                      <span className={classNames('ml-2', narrow && 'sr-only')}>Sign out</span>
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <div className="relative z-10 flex h-16 bg-white shadow shrink-0 md:hidden">
          <button
            type="button"
            className="px-4 text-gray-500 border-r border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={openSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <HiMenuAlt2 className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <main className="relative flex-1 overflow-y-auto focus:outline-none">{children}</main>
      </div>
    </div>
  );
});
