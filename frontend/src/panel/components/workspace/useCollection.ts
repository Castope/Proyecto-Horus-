import { useRequestStatus } from '../../hooks/useRequestStatus';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../context';
import { panelRequest, errorMessage } from '../../services/panelApi';
import type { Row } from '../../types/workspace';

export function useCollection(endpoint: string, catalog = false, revision = 0) {
  const { token } = useAdminAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const { loading, error, setLoading, setError } = useRequestStatus(JSON.stringify([token, endpoint, catalog, revision]));
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const load = async () => {
      const records: Row[] = [];
      let page = 1, pages: number;
      do {
        const data = await panelRequest<{ items?: Row[]; messages?: Row[]; pagination?: { pages: number } }>(
          endpoint + (catalog ? '?limit=100&page=' + page : ''), token, 'GET', undefined, controller.signal);
        records.push(...(data.items || data.messages || []));
        pages = catalog ? data.pagination?.pages || 0 : 1; page++;
      } while (page <= pages);
      if (!controller.signal.aborted) setRows([...new Map(records.map(row => [row.id, row])).values()]);
    };
    void load().catch(err => { if (!controller.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, endpoint, catalog, revision, setLoading, setError]);
  return { rows, loading, error };
}
export const dateLabel = (value: unknown, calendarDate = false) => {
  const raw = calendarDate && value ? String(value).slice(0, 10) + 'T12:00:00' : String(value);
  if (!value || Number.isNaN(new Date(raw).getTime())) return 'Sin fecha';
  return new Date(raw).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
};
export const plainText = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '');
