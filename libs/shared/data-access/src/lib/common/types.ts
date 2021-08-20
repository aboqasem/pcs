export type PropsErrors<T> = {
  [K in keyof T]?: string[];
};

export type AsData<T> = {
  data: T;
};
