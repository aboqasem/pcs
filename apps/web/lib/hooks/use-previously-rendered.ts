import { useEffect, useRef } from 'react';

export function usePreviouslyRendered<T>(value: T) {
  const prev = useRef<T>();

  useEffect(() => {
    prev.current = value;
  }, [value]);

  return prev.current;
}
