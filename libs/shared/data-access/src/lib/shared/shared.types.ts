export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export type TAsData<TPayload = any> = {
  data: TPayload;
};

export type TReplace<
  TOriginal,
  TReplacement extends { [K in keyof TReplacement]: TReplacement[K] },
> = Omit<TOriginal, keyof TReplacement> & TReplacement;

export type TCustomDecorator<TKey = string> = MethodDecorator &
  ClassDecorator & {
    KEY: TKey;
  };
