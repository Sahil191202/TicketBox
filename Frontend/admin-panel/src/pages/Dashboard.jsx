import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, toRupees } from '../lib/api';

function formatInr(paise) {
  return `₹${toRupees(paise).toLocaleString('en-IN')}`;
}

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
      return response.data;
    },
  });

  const recentBookings = useQuery({
    queryKey: ['bookings', 'dashboard-recent'],
    queryFn: async () => {
      const response = await api.get('/admin/bookings', {
        params: { page: 1, limit: 5 },
      });
      return response.data;
    },
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    const revenue = toRupees(data.total_revenue_paise || 0);
    const tickets = data.tickets_sold || 0;
    const paid = data.paid_bookings || 0;
    const failed = data.failed_payments || 0;
    // Aggregate snapshot as a simple visual — API has no time-series yet
    return [
      { label: 'Revenue', value: revenue },
      { label: 'Tickets', value: tickets },
      { label: 'Paid', value: paid },
      { label: 'Failed', value: failed },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-primary-container animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="admin-card p-xl text-center text-error font-body-sm text-body-sm">
        {error.response?.data?.error || 'Failed to load dashboard. Is the API running on :4000?'}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: formatInr(data.total_revenue_paise),
      hint: `${data.paid_bookings} paid booking${data.paid_bookings === 1 ? '' : 's'}`,
    },
    {
      label: 'Tickets Sold',
      value: String(data.tickets_sold ?? 0),
      hint: 'From paid bookings',
      trendUp: (data.tickets_sold ?? 0) > 0,
    },
    {
      label: 'Total Events',
      value: String(data.event_count ?? 0),
      hint: 'Draft + published',
    },
    {
      label: 'Failed Payments',
      value: String(data.failed_payments ?? 0),
      hint: (data.failed_payments ?? 0) > 0 ? 'Requires attention' : 'All clear',
      isError: true,
    },
  ];

  const bookings = recentBookings.data?.data ?? [];

  return (
    <div>
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
        Dashboard Overview
      </h1>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
        Live totals from paid bookings and gateway payments.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        {stats.map(({ label, value, hint, isError: errStat, trendUp }) => (
          <div
            key={label}
            className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant admin-card-shadow"
          >
            <p className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant mb-sm">
              {label}
            </p>
            <p
              className={`font-display-lg-mobile text-display-lg-mobile font-bold ${
                errStat && Number(data.failed_payments) > 0 ? 'text-error' : 'text-on-surface'
              }`}
            >
              {value}
            </p>
            <p
              className={`font-body-sm text-body-sm mt-sm flex items-center gap-xs ${
                errStat && Number(data.failed_payments) > 0
                  ? 'text-error'
                  : trendUp
                    ? 'text-tertiary'
                    : 'text-on-surface-variant'
              }`}
            >
              {trendUp && (
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
              )}
              {errStat && Number(data.failed_payments) > 0 && (
                <span className="material-symbols-outlined text-[16px]">warning</span>
              )}
              {hint}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg">
        <div className="xl:col-span-7 border border-outline-variant rounded-xl p-lg bg-surface-container-lowest">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">
            Snapshot
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="orangeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ff6b35" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2dfff" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#594139', fontSize: 12 }}
                  axisLine={{ stroke: '#e1bfb5' }}
                />
                <YAxis
                  tick={{ fill: '#594139', fontSize: 12 }}
                  axisLine={{ stroke: '#e1bfb5' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e1bfb5',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ff6b35"
                  fill="url(#orangeFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-5">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-md">
            Recent Bookings
          </h2>
          {recentBookings.isLoading ? (
            <div className="flex justify-center py-xl">
              <Loader2 className="h-6 w-6 text-primary-container animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              No bookings yet.
            </p>
          ) : (
            <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    <th className="text-left px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                      Booking
                    </th>
                    <th className="text-right px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="h-[48px] border-b border-outline-variant last:border-0 hover:bg-surface-container-low"
                    >
                      <td className="px-md">
                        <div className="font-code-ticket text-code-ticket text-primary">
                          {b.ticket_code || `#BK-${b.id}`}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {b.customer_name}
                        </div>
                      </td>
                      <td className="px-md text-right">
                        <div className="font-code-ticket text-code-ticket text-on-surface">
                          {formatInr(b.amount_paise)}
                        </div>
                        <span
                          className={
                            b.status === 'paid'
                              ? 'badge-paid'
                              : b.status === 'failed'
                                ? 'badge-failed'
                                : 'badge-created'
                          }
                        >
                          {String(b.status || '').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
