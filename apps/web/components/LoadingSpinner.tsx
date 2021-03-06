import { classNames } from '@/lib/utils/style.utils';
import { memo } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { IconBaseProps } from 'react-icons/lib';

export interface ILoadingSpinnerProps extends IconBaseProps {}

export const LoadingSpinner = memo(function LoadingSpinner({
  className,
  ...props
}: ILoadingSpinnerProps) {
  return (
    <ImSpinner2
      className={classNames('animate-spin text-blue-700 align-middle', className)}
      {...props}
    />
  );
});
