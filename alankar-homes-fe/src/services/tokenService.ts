import { STORAGE_KEYS } from '../utils/constants';

// The auth token now lives in an httpOnly cookie set by the backend, so page scripts never see it.
// Older versions of the site saved the token here. Clear it, and sign that visitor out so they log in again and get the cookie.
if (localStorage.getItem(STORAGE_KEYS.LEGACY_TOKEN)) {
  localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

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
