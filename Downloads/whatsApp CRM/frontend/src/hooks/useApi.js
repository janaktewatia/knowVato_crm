import { useState, useEffect, useCallback } from "react";

// Generic loader: pass a function returning a promise; get {data,loading,error,reload}.
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      // unwrap {ok,data} envelope when present
      setData(res && Object.prototype.hasOwnProperty.call(res, "data") ? res.data : res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
