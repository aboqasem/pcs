import { Path } from 'react-hook-form';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export type TAsData<TPayload = any> = {
  data: TPayload;
};

export type TCustomDecorator<TKey = string> = MethodDecorator &
  ClassDecorator & {
    KEY: TKey;
  };
