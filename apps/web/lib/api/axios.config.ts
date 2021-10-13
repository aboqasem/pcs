import { config } from '@/lib/config';
import { TAsData, ValidationException } from '@pcs/shared-data-access';
import axios, { AxiosResponse } from 'axios';

export const bffAxios = axios.create({
  baseURL: config.BFF_URL,
  withCredentials: true,
});

bffAxios.interceptors.request.use(undefined, (error) => {
  console.warn((error.request as XMLHttpRequest).statusText);

  return Promise.reject(new Error('Something went wrong, please try again later'));
});

bffAxios.interceptors.response.use(
  // unwrap received data
  ({ data }: AxiosResponse<unknown>) => (data as TAsData<unknown>).data,
  (error) => {
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message;
    console.warn(data || message);

    if (error.status == 500) {
      return Promise.reject(
        'Something went wrong while trying to reach our servers, please try again later',
      );
    }

    // it is a props error (object) from the validation process, we wrap it to determine its type
    if (typeof message === 'object') {
      return Promise.reject(new ValidationException(message));
    }

    return Promise.reject(new Error(message));
  },
);
