import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { HTMLProps, memo, PropsWithChildren, useMemo } from 'react';

export interface ILinkProps
  extends PropsWithChildren<
    Omit<NextLinkProps, 'passHref'> &
      Omit<HTMLProps<HTMLAnchorElement>, keyof NextLinkProps | 'className'>
  > {
  className?: string;
}

export const Link = memo(function Link({
  className,
  children,
  href,
  as,
  replace,
  scroll,
  shallow,
  prefetch,
  locale,
  ...anchorProps
}: ILinkProps) {
  const anchor = useMemo(
    () => (
      <a className={className} {...anchorProps}>
        {children}
      </a>
    ),
    [anchorProps, children, className],
  );

  return (
    <NextLink
      href={href}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      prefetch={prefetch}
      locale={locale}
      passHref
    >
      {anchor}
    </NextLink>
  );
});
