import axios from 'axios';
import config from '../config';
import { BffAxiosInstance } from './types';

export const bffAxios = axios.create({
  baseURL: config.BFF_URL,
  withCredentials: true,
}) as BffAxiosInstance;
