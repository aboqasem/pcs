import { CgSpinner } from 'react-icons/cg';

/* eslint-disable-next-line */
export interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <span aria-label="Loading spinner">
      <CgSpinner className={`animate-spin ${className}`} />
    </span>
  );
}
