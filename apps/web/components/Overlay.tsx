import React, { memo } from 'react';

/* eslint-disable-next-line */
export interface IOverlayProps extends React.PropsWithChildren<{}> {
  className?: string;
}

export const Overlay = memo(function Overlay({ className, children }: IOverlayProps) {
  return (
    <>
      <div className={`absolute top-0 left-0 w-full h-full bg-white opacity-50 ${className}`} />
      <div className={`absolute top-0 left-0 w-full h-full`}>
        <div className="flex flex-col items-center justify-center w-full h-full">{children}</div>
      </div>
    </>
  );
});
