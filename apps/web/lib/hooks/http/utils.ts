import { AxiosResponse } from 'axios';

export interface HttpState<T> {
  data?: T;
  error?: string | string[];
  isPending?: boolean;
}

export type HttpAction<T> =
  | { type: 'start' }
  | { type: 'fulfill'; payload: T }
  | { type: 'reject'; payload: string | string[] };

export type HttpDispatch<T> = (action: HttpAction<T>) => void;

export const httpInitialStateFactory = <T>(): HttpState<T> => ({});

export const httpReducerFactory =
  <T>() =>
  (state: HttpState<T>, action: HttpAction<T>): HttpState<T> => {
    switch (action.type) {
      case 'start':
        return { isPending: true };
      case 'fulfill':
        return { data: action.payload };
      case 'reject':
        console.warn(action.payload);
        return { error: action.payload };
      default:
        return state;
    }
  };

export const httpFulfillFactory = <T>(dispatch: HttpDispatch<T>) => {
  return ({ data: { data } }: AxiosResponse) => {
    dispatch({ type: 'fulfill', payload: data });
  };
};

export const httpRejectFactory = <T>(dispatch: HttpDispatch<T>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ response, request, message }: any) => {
    if (response) {
      return dispatch({ type: 'reject', payload: response.data.message });
    }
    if (request) {
      console.warn((request as XMLHttpRequest).statusText);
      return dispatch({
        type: 'reject',
        payload: 'Something went wrong while trying to reach our servers, please try again later',
      });
    }
    return dispatch({ type: 'reject', payload: message });
  };
};
