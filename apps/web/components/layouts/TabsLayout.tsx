import { Link } from '@/components';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { memo, PropsWithChildren, useMemo } from 'react';

export interface ITab {
  name: string;
  pathname?: string;
}

export interface ITabsLayoutProps extends PropsWithChildren<Record<string, unknown>> {
  tabs?: ITab[];
}

export const TabsLayout = memo(function TabsLayout({ children, tabs }: ITabsLayoutProps) {
  const { pathname: currPathname, query } = useRouter();

  const tabsWithHref = useMemo(
    () =>
      tabs?.map(({ pathname, ...rest }) => ({
        ...rest,
        href: {
          // no pathname means current pathname
          pathname: pathname ?? currPathname,
          // take only required query params like `courseId` in `/courses/[courseId]`
          query: Object.entries(query).reduce(
            (newQuery, [qName, qValue]) =>
              pathname?.includes(`[${qName}]`) ? { ...newQuery, [qName]: qValue } : newQuery,
            {} as ParsedUrlQuery,
          ),
        },
      })),
    [currPathname, query, tabs],
  );
  const currentTab = useMemo(
    () => tabsWithHref?.find(({ href }) => currPathname.startsWith(href.pathname)),
    [currPathname, tabsWithHref],
  );

  return (
    <>
      {!!tabsWithHref?.length && (
        <div>
          <div className="overflow-auto">
            <div className="h-16 border-b border-gray-200">
              <nav className="flex -mb-px" aria-label="Tabs">
                {tabsWithHref.map((tab) => {
                  const isCurrent = tab === currentTab;

                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={`
                        ${
                          isCurrent
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                        w-full h-16 px-2 justify-center whitespace-nowrap border-b-2 font-medium text-sm flex items-center tracking-tight
                      `}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {tab.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {children}
    </>
  );
});
