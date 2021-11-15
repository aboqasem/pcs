import { config } from '@/lib/config';
import { HttpError, TAsData, ValidationError } from '@pcs/shared-data-access';
import axios, { AxiosResponse } from 'axios';

export const bffAxios = axios.create({
  baseURL: config.BFF_URL,
  withCredentials: true,
});

bffAxios.interceptors.request.use(undefined, (error: { request: XMLHttpRequest }) => {
  console.warn(error.request.statusText);

  return Promise.reject(
    new HttpError('Something went wrong, please try again later', error.request.status),
  );
});

bffAxios.interceptors.response.use(
  // unwrap received data
  ({ data, ...rest }: AxiosResponse<unknown>) => ({
    ...rest,
    data: (data as TAsData<unknown>).data,
  }),
  (error) => {
    const data = error.response?.data;
    const status = data?.statusCode || error.response?.status;
    const message = data?.message || data?.error || error.message;
    console.warn(data || message);

    if (status == 500) {
      return Promise.reject(
        new HttpError(
          'Something went wrong while trying to reach our servers, please try again later',
          status,
        ),
      );
    }

    // it is a props error (object) from the validation process, we wrap it to determine its type
    if (typeof message === 'object') {
      return Promise.reject(new ValidationError(message, status));
    }

    return Promise.reject(new HttpError(message, status));
  },
);
