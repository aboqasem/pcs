import { AxiosRequestConfig } from 'axios';
import { useReducer } from 'react';
import { bffAxios } from '../../config';
import { PostPathTypes } from '../../config/axios/types';
import {
  httpFulfillFactory,
  httpInitialStateFactory,
  httpReducerFactory,
  httpRejectFactory,
} from './utils';

export function usePost<
  P extends keyof PostPathTypes,
  B extends PostPathTypes[P]['body'],
  R extends PostPathTypes[P]['response'],
  T extends R['data'],
>(bffPath: P, config?: AxiosRequestConfig) {
  const [httpState, dispatch] = useReducer(httpReducerFactory<T>(), httpInitialStateFactory<T>());
  const { data, error, isPending } = httpState;

  const sendRequest = async (...[body]: B extends undefined ? [] : [B]) => {
    dispatch({ type: 'start' });
    await bffAxios
      .post(bffPath, body, config)
      .then(httpFulfillFactory(dispatch))
      .catch(httpRejectFactory(dispatch));
  };

  return {
    sendRequest,
    isPending,
    error,
    data,
  };
}
