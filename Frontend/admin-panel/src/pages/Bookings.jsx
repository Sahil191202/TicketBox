import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { api, toRupees } from '../lib/api';

const PAGE_SIZE = 10;

const STATUS_BADGE = {
  paid: 'badge-paid',
  failed: 'badge-failed',
  created: 'badge-created',
  expired: 'badge-draft',
};

function badgeClass(status) {
  return STATUS_BADGE[status] || 'badge-draft';
}

function exportCsv(rows) {
  const headers = [
    'Booking ID',
    'Ticket Code',
    'Customer',
    'Email',
    'Event',
    'Qty',
    'Amount (INR)',
    'Status',
    'Created At',
  ];

  const lines = rows.map((b) => [
    b.id,
    b.ticket_code || '',
    b.customer_name,
    b.email,
    b.event_title,
    b.qty,
    toRupees(b.amount_paise).toFixed(2),
    b.status,
    b.created_at ? new Date(b.created_at).toISOString() : '',
  ]);

  const escape = (value) => {
    const str = String(value ?? '');
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const csv = [headers, ...lines].map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ticketbox-bookings-page-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Bookings() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', page, search, status],
    queryFn: async () => {
      const response = await api.get('/admin/bookings', {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(search ? { q: search } : {}),
          ...(status ? { status } : {}),
        },
      });
      return response.data;
    },
  });

  const bookings = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, total_pages: 1 };

  const rangeLabel = useMemo(() => {
    if (!pagination.total) return 'Showing 0 entries';
    const start = (pagination.page - 1) * PAGE_SIZE + 1;
    const end = Math.min(pagination.page * PAGE_SIZE, pagination.total);
    return `Showing ${start} to ${end} of ${pagination.total} entries`;
  }, [pagination]);

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-md mb-lg">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
            Bookings
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage and review all ticket purchases.
          </p>
        </div>
        <div className="flex gap-sm">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => exportCsv(bookings)}
            disabled={!bookings.length}
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export CSV
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setShowFilters((v) => !v)}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filter
          </button>
        </div>
      </div>

      <form onSubmit={applySearch} className="mb-md">
        <div className="relative flex items-center input-glow rounded-full border border-outline-variant bg-surface-container-lowest max-w-xl">
          <span className="material-symbols-outlined text-on-surface-variant absolute left-sm text-[20px]">
            search
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-[40px] pl-[40px] pr-md rounded-full bg-transparent text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/60 focus:outline-none"
            placeholder="Search bookings by name or email..."
          />
        </div>
      </form>

      {showFilters && (
        <div className="border border-outline-variant rounded-xl p-md bg-surface-container-lowest flex flex-wrap gap-md mb-md">
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="h-[40px] px-md rounded-lg border-[1.5px] border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-0 appearance-none cursor-pointer"
          >
            <option value="">All statuses</option>
            <option value="paid">PAID</option>
            <option value="created">CREATED</option>
            <option value="failed">FAILED</option>
            <option value="expired">EXPIRED</option>
          </select>
        </div>
      )}

      <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary-container animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64 text-error font-body-sm text-body-sm px-md text-center">
            {error.response?.data?.error ||
              'Failed to load bookings. Is the API running on :4000?'}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-xl flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-[32px]">receipt_long</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
              No bookings found
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[300px]">
              {search || status
                ? 'Try a different search or clear filters.'
                : 'Bookings appear here after customers complete checkout.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    {['Booking ID', 'Customer', 'Event', 'Amount', 'Status', 'Date'].map(
                      (label) => (
                        <th
                          key={label}
                          className={`px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider whitespace-nowrap ${
                            label === 'Amount' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="h-[48px] border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-md font-code-ticket text-code-ticket text-primary">
                        {booking.ticket_code || `#BK-${booking.id}`}
                      </td>
                      <td className="px-md">
                        <div className="font-body-sm text-body-sm font-medium text-on-surface">
                          {booking.customer_name}
                        </div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant">
                          {booking.email}
                        </div>
                      </td>
                      <td className="px-md font-body-sm text-body-sm text-on-surface">
                        {booking.event_title}
                        <div className="text-on-surface-variant text-xs">
                          qty {booking.qty}
                        </div>
                      </td>
                      <td className="px-md font-code-ticket text-code-ticket text-on-surface text-right">
                        ₹{toRupees(booking.amount_paise).toLocaleString('en-IN')}
                      </td>
                      <td className="px-md">
                        <span className={badgeClass(booking.status)}>
                          {String(booking.status || '').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-md font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                        {booking.created_at
                          ? new Date(booking.created_at).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-md py-sm border-t border-outline-variant">
              <p className="font-body-sm text-body-sm text-on-surface-variant">{rangeLabel}</p>
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
