import { STORAGE_KEYS } from '../utils/constants';

export const getLocalAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const setLocalAccessToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

export const removeLocalAccessToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

export const getLocalUser = (): any | null => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const setLocalUser = (user: any): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const removeLocalUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const clearStorage = (): void => {
  localStorage.clear();
};
