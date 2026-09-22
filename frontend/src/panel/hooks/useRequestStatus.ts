import { useCallback, useState } from 'react';

// A new request is pending immediately, without an extra effect-driven render.
export function useRequestStatus(key: string) {
  const [status, setStatus] = useState({ key, loading: true, error: '' });
  const setLoading = useCallback((loading: boolean) => {
    setStatus(previous => ({ key, loading, error: previous.key === key ? previous.error : '' }));
  }, [key]);
  const setError = useCallback((error: string) => {
    setStatus(previous => ({ key, error, loading: previous.key === key ? previous.loading : true }));
  }, [key]);
  return { loading: status.key !== key || status.loading, error: status.key === key ? status.error : '', setLoading, setError };
}
