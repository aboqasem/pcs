import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';

export interface UseArrayReturn<T> {
  value: T[];
  set: Dispatch<SetStateAction<T[]>>;
  setAt: (index: number, value: T) => void;
  pop(): T | undefined;
  push(...items: T[]): number;
  concat(...items: ConcatArray<T>[]): void;
  concat(...items: (T | ConcatArray<T>)[]): void;
  reverse(): void;
  shift(): T | undefined;
  sort(compareFn?: (a: T, b: T) => number): void;
  splice(start: number, deleteCount?: number): T[];
  splice(start: number, deleteCount: number, ...items: T[]): T[];
  unshift(...items: T[]): number;
  filter<S extends T>(
    predicate: (value: T, index: number, array: T[]) => value is S,
    thisArg?: unknown,
  ): void;
  filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: unknown): void;
  empty(): void;
  reset(): void;
}

export function useArray<T>(initialState: T[] | (() => T[]) = []): UseArrayReturn<T> {
  const { current: originalState } = useRef(initialState);
  const [array, setArray] = useState(initialState);

  const setAt = useCallback(
    (index: number, value: T) => {
      const newArray = array.slice();
      newArray[index] = value;
      setArray(newArray);
    },
    [array],
  );

  const pop = useCallback(() => {
    const newArray = array.slice();
    const value = newArray.pop();
    setArray(newArray);
    return value;
  }, [array]);

  const push = useCallback(
    (...items: T[]) => {
      const newArray = array.slice();
      const length = newArray.push(...items);
      setArray(newArray);
      return length;
    },
    [array],
  );

  const concat = useCallback((...items: (T | ConcatArray<T>)[]): void => {
    setArray((array) => array.concat(...items));
  }, []);

  const reverse = useCallback(() => {
    setArray(() => array.slice().reverse());
  }, [array]);

  const shift = useCallback(() => {
    const newArray = array.slice();
    const value = newArray.shift();
    setArray(newArray);
    return value;
  }, [array]);

  const sort = useCallback(
    (compareFn?: (a: T, b: T) => number) => {
      setArray(() => array.slice().sort(compareFn));
    },
    [array],
  );

  const splice = useCallback(
    (start: number, deleteCount: number, ...items: T[]) => {
      const newArray = array.slice();
      const deleted = newArray.splice(start, deleteCount, ...items);
      setArray(newArray);
      return deleted;
    },
    [array],
  );

  const unshift = useCallback(
    (...items: T[]) => {
      const newArray = array.slice();
      const length = newArray.unshift(...items);
      setArray(newArray);
      return length;
    },
    [array],
  );

  const filter = useCallback(
    (predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: unknown) => {
      setArray(() => array.slice().filter(predicate, thisArg));
    },
    [array],
  );

  const empty = useCallback(() => {
    setArray([]);
  }, []);

  const reset = useCallback(() => {
    setArray(originalState);
  }, [originalState]);

  return {
    value: array,
    set: setArray,
    setAt,
    pop,
    push,
    concat,
    reverse,
    shift,
    sort,
    splice,
    unshift,
    filter,
    empty,
    reset,
  };
}
