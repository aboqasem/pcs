import NextLink, { LinkProps as NextLinkProps } from 'next/link';

/* eslint-disable-next-line */
export interface LinkProps extends React.PropsWithChildren<NextLinkProps> {
  className?: string;
}

export function Link({ className, children, ...linkProps }: LinkProps) {
  return (
    <NextLink {...linkProps}>
      <a className={className}>{children}</a>
    </NextLink>
  );
}
