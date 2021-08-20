import { AxiosRequestConfig } from 'axios';
import { useReducer } from 'react';
import { bffAxios } from '../../config';
import { GetPathTypes } from '../../config/axios/types';
import {
  httpFulfillFactory,
  httpInitialStateFactory,
  httpReducerFactory,
  httpRejectFactory,
} from './utils';

export function useGet<
  P extends keyof GetPathTypes,
  R extends GetPathTypes[P]['response'],
  T extends R['data'],
>(bffPath: P, config?: AxiosRequestConfig) {
  const [httpState, dispatch] = useReducer(httpReducerFactory<T>(), httpInitialStateFactory<T>());
  const { data, error, isPending } = httpState;

  const sendRequest = async () => {
    dispatch({ type: 'start' });
    await bffAxios
      .get(bffPath, config)
      .then(httpFulfillFactory(dispatch))
      .catch(httpRejectFactory(dispatch));
  };

  return {
    sendRequest,
    data,
    isPending,
    error,
  };
}
