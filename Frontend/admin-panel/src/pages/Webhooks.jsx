import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { api } from '../lib/api';

const PAGE_SIZE = 20;

function eventTypeClass(eventType = '') {
  const t = eventType.toLowerCase();
  if (t.includes('failed')) return 'text-error';
  if (t.includes('captured') || t.includes('paid')) return 'text-tertiary';
  return 'text-on-surface';
}

export default function Webhooks() {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState('');
  const [signatureFilter, setSignatureFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [openId, setOpenId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['webhooks', page],
    queryFn: async () => {
      const response = await api.get('/admin/webhooks', {
        params: { page, limit: PAGE_SIZE },
      });
      return response.data;
    },
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, total_pages: 1 };

  const eventTypes = useMemo(() => {
    const set = new Set(rows.map((r) => r.event_type).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (eventType && row.event_type !== eventType) return false;
      if (signatureFilter === 'valid' && !row.signature_valid) return false;
      if (signatureFilter === 'invalid' && row.signature_valid) return false;
      if (dateFilter) {
        const processed = row.processed_at || row.created_at;
        if (!processed) return false;
        const day = new Date(processed).toISOString().slice(0, 10);
        if (day !== dateFilter) return false;
      }
      return true;
    });
  }, [rows, eventType, signatureFilter, dateFilter]);

  return (
    <div>
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
        Gateway Webhook Logs
      </h1>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
        Monitor incoming events from Razorpay.
      </p>

      <div className="border border-outline-variant rounded-xl p-md bg-surface-container-lowest flex flex-wrap gap-md mb-lg">
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="h-[40px] px-md rounded-lg border-[1.5px] border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-0 appearance-none cursor-pointer"
        >
          <option value="">All Event Types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={signatureFilter}
          onChange={(e) => setSignatureFilter(e.target.value)}
          className="h-[40px] px-md rounded-lg border-[1.5px] border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-0 appearance-none cursor-pointer"
        >
          <option value="">Signature Status</option>
          <option value="valid">Valid</option>
          <option value="invalid">Invalid</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-[40px] px-md rounded-lg border-[1.5px] border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-0"
        />
      </div>

      <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary-container animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64 text-error font-body-sm text-body-sm px-md text-center">
            {error.response?.data?.error ||
              'Failed to load webhooks. Is the API running on :4000?'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-xl flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-[32px]">webhook</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
              No webhook events
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[320px]">
              Events appear here after Razorpay delivers payment.captured / payment.failed.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    {['Event Type', 'Gateway Event ID', 'Signature', 'Processed', 'Error', ''].map(
                      (label) => (
                        <th
                          key={label || 'expand'}
                          className="text-left px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider whitespace-nowrap"
                        >
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const open = openId === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`expandable-row border-b border-outline-variant hover:bg-surface-container-low transition-colors ${
                          open ? 'open' : ''
                        }`}
                      >
                        <td className="px-md py-sm font-code-ticket text-code-ticket">
                          <span className={eventTypeClass(row.event_type)}>{row.event_type}</span>
                        </td>
                        <td className="px-md py-sm font-code-ticket text-code-ticket text-on-surface-variant">
                          {row.gateway_event_id}
                        </td>
                        <td className="px-md py-sm">
                          {row.signature_valid ? (
                            <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full font-label-caps text-label-caps bg-tertiary/10 text-tertiary">
                              <span className="material-symbols-outlined filled text-[14px]">
                                check_circle
                              </span>
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full font-label-caps text-label-caps bg-error/10 text-error">
                              <span className="material-symbols-outlined filled text-[14px]">
                                cancel
                              </span>
                              Invalid
                            </span>
                          )}
                        </td>
                        <td className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                          {row.processed_at
                            ? new Date(row.processed_at).toLocaleString()
                            : '—'}
                        </td>
                        <td className="px-md py-sm font-body-sm text-body-sm text-error max-w-[220px] truncate">
                          {row.error || '—'}
                        </td>
                        <td className="px-md py-sm text-right">
                          <button
                            type="button"
                            onClick={() => setOpenId(open ? null : row.id)}
                            className="p-xs text-on-surface-variant hover:text-on-surface"
                            aria-expanded={open}
                            aria-label="Expand payload"
                          >
                            <span
                              className={`material-symbols-outlined chevron-icon transition-transform ${
                                open ? 'rotate-180' : ''
                              }`}
                            >
                              expand_more
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {openId != null && (
              <div className="border-t border-outline-variant p-md bg-surface-container-low">
                {filtered
                  .filter((r) => r.id === openId)
                  .map((row) => (
                    <pre
                      key={row.id}
                      className="font-code-ticket text-code-ticket text-body-sm bg-surface-container rounded-lg p-md overflow-x-auto whitespace-pre"
                    >
                      {JSON.stringify(row.payload, null, 2)}
                    </pre>
                  ))}
              </div>
            )}

            <div className="flex items-center justify-between px-md py-sm border-t border-outline-variant">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Showing page {pagination.page} of {pagination.total_pages || 1} ·{' '}
                {pagination.total} entries
              </p>
              <div className="flex gap-xs">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-[32px] min-w-[32px] px-sm rounded-lg border border-outline-variant font-body-sm text-body-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="h-[32px] min-w-[32px] px-sm rounded-lg bg-primary-container text-on-primary font-bold font-body-sm text-body-sm"
                >
                  {pagination.page}
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (pagination.total_pages || 1)}
                  className="h-[32px] min-w-[32px] px-sm rounded-lg border border-outline-variant font-body-sm text-body-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
