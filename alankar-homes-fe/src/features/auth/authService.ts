import api from '../../services/api';
import { API_ENDPOINTS } from '../../utils/constants';
import type { LoginResponse, RegisterResponse } from './authTypes.ts';

export const loginApi = async (credentials: any): Promise<LoginResponse> => {
  const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
  return response.data;
};

export const registerApi = async (userData: any): Promise<RegisterResponse> => {
  const response = await api.post(API_ENDPOINTS.REGISTER, userData);
  return response.data;
};
