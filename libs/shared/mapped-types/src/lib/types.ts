export type Type<T = {}> = new (...args: any[]) => T;

export type MappedType<T = {}> = Type<T> & (new () => T);

export type Never<K extends keyof any> = {
  [k in K]?: never;
};
