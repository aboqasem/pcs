import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { memo, useMemo } from 'react';

/* eslint-disable-next-line */
export interface ILinkProps extends React.PropsWithChildren<NextLinkProps> {
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
