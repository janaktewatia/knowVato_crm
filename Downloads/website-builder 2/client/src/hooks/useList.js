import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/client";

// Generic list hook: handles search (debounced), filters, pagination, refetch.
export default function useList(endpoint, { initialFilters = {}, limit = 12 } = {}) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const debounce = useRef();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, page, limit, ...filters };
      Object.keys(params).forEach((k) => params[k] === "" && delete params[k]);
      const res = await api.get(endpoint, { params });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [endpoint, search, page, limit, filters]);

  // debounce search
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce.current);
  }, [fetchData]);

  const setFilter = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
  const onSearch = (v) => { setSearch(v); setPage(1); };

  return { ...data, loading, search, onSearch, filters, setFilter, page, setPage, refetch: fetchData };
}
