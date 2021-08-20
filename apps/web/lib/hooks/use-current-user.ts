import { useEffect, useRef } from 'react';
import { BffPath } from '../constants';
import { useGet } from './http/use-get';

export function useCurrentUser() {
  const { data: user, error, isPending, sendRequest } = useGet(BffPath.Me);
  const firstMount = useRef(true);

  useEffect(() => {
    if (firstMount.current) {
      sendRequest();
    }

    return () => {
      firstMount.current = false;
    };
  }, [sendRequest]);

  return {
    user,
    isPending,
    error,
  };
}
