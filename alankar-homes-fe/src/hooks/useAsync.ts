import { useCallback, useEffect, useState } from 'react';
import type { SetStateAction } from 'react';
import { getErrorMessage } from '../utils/helpers';

interface AsyncState<T> {
  key: string | null;
  data: T | null;
  error: string | null;
}

// Runs an async loader whenever deps change and tracks loading / error state.
// Each result is tagged with the deps it was loaded for, so a stale response
// (e.g. from fast typing in search) is ignored and loading is simply "result is not for the current deps".
export const useAsync = <T>(loader: () => Promise<T>, deps: (string | number | boolean | null | undefined)[]) => {
  const [reloadCount, setReloadCount] = useState(0);
  const key = JSON.stringify([...deps, reloadCount]);
  const [state, setState] = useState<AsyncState<T>>({ key: null, data: null, error: null });

  useEffect(() => {
    let active = true;
    loader()
      .then((data) => {
        if (active) setState({ key, data, error: null });
      })
      .catch((err) => {
        if (active) setState({ key, data: null, error: getErrorMessage(err) });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setReloadCount((n) => n + 1), []);

  // For updating the loaded data in place after an edit, without refetching
  const setData = useCallback((value: SetStateAction<T | null>) => {
    setState((prev) => ({
      ...prev,
      data: typeof value === 'function' ? (value as (prev: T | null) => T | null)(prev.data) : value,
    }));
  }, []);

  const isLoading = state.key !== key;

  return {
    data: isLoading ? null : state.data,
    setData,
    isLoading,
    error: isLoading ? null : state.error,
    reload,
  };
};
