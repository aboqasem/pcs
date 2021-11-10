import { LoadingSpinner } from '@/components/LoadingSpinner';
import { classNames } from '@/lib/utils/style.utils';
import { memo, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { useIsFetching } from 'react-query';

export const Globals = memo(function Globals() {
  const isFetching = useIsFetching();
  const toastOptions = useRef({ loading: { icon: <LoadingSpinner className="w-4 h-4" /> } });

  return (
    <>
      <LoadingSpinner
        className={classNames(
          'z-50 fixed top-[0.5rem] right-[0.5rem] w-6 h-6 pointer-events-none transition ease-linear',
          isFetching ? 'opacity-100' : 'opacity-0',
        )}
      />

      <Toaster toastOptions={toastOptions.current} />
    </>
  );
});
