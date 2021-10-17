import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { memo, PropsWithChildren, useMemo } from 'react';

export interface ILinkProps extends PropsWithChildren<NextLinkProps> {
  className?: string;
}

export const Link = memo(function Link({ className, children, ...linkProps }: ILinkProps) {
  const a = useMemo(() => <a className={className}>{children}</a>, [children, className]);

  return (
    <NextLink {...linkProps} passHref>
      {a}
    </NextLink>
  );
});
