import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T) {
  const prev = useRef<T>();

  useEffect(() => {
    prev.current = value;
  }, [value]);

  return prev.current;
}
