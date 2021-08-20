import { PropsWithChildren } from 'react';

/* eslint-disable-next-line */
export interface OverlayProps extends PropsWithChildren<{}> {
  className?: string;
}

export function Overlay({ className, children }: OverlayProps) {
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full bg-white opacity-50 sm:rounded-lg ${className}`}
    >
      <div className="flex items-center justify-center w-full h-full">{children}</div>
    </div>
  );
}
