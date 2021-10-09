import { LoadingSpinner } from '@/components';
import React, { useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { useIsFetching } from 'react-query';

export const Globals = React.memo(function Globals() {
  const isFetching = useIsFetching();
  const toastOptions = useMemo(
    () => ({ loading: { icon: <LoadingSpinner className="w-4 h-4" /> } }),
    [],
  );

  return (
    <>
      <LoadingSpinner
        className={`fixed top-[0.5rem] right-[0.5rem] w-6 h-6 pointer-events-none transition ease-linear ${
          isFetching ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <Toaster toastOptions={toastOptions} />
    </>
  );
});
