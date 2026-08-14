import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, toRupees } from '../lib/api';

function formatInr(paise) {
  return `₹${toRupees(paise || 0).toLocaleString('en-IN')}`;
}

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const end = Number(target) || 0;
    if (end === 0) {
      setValue(0);
      return undefined;
    }

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(end * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function AnimatedValue({ value, prefix = '', decimals = 0 }) {
  const n = useCountUp(value);
  const formatted =
    decimals > 0
      ? n.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(n).toLocaleString('en-IN');
  return (
    <span>
      {prefix}
      {formatted}
    </span>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const STATUS_COLORS = {
  paid: '#00677e',
  created: '#5b5b7e',
  failed: '#ba1a1a',
  expired: '#8d7168',
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-sm admin-card-shadow">
      <p className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant mb-xs">
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-body-sm text-body-sm text-on-surface font-medium">
          {entry.name}:{' '}
          <span className="text-primary">
            {entry.name === 'Revenue'
              ? `₹${Number(entry.value).toLocaleString('en-IN')}`
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
      return response.data;
    },
    refetchInterval: 60_000,
  });

  const recentBookings = useQuery({
    queryKey: ['bookings', 'dashboard-recent'],
    queryFn: async () => {
      const response = await api.get('/admin/bookings', {
        params: { page: 1, limit: 50 },
      });
      return response.data;
    },
  });

  const eventsQuery = useQuery({
    queryKey: ['events', 'dashboard-counts'],
    queryFn: async () => {
      const response = await api.get('/admin/events', {
        params: { page: 1, limit: 100 },
      });
      return response.data;
    },
  });

  const bookings = recentBookings.data?.data ?? [];
  const events = eventsQuery.data?.data ?? [];

  const revenueSeries = useMemo(() => {
    const map = new Map();
    for (const b of bookings) {
      if (!b.created_at) continue;
      const day = new Date(b.created_at);
      const key = day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const prev = map.get(key) || { label: key, revenue: 0, tickets: 0, sort: day.getTime() };
      if (b.status === 'paid') {
        prev.revenue += toRupees(b.amount_paise);
        prev.tickets += b.qty || 0;
      }
      map.set(key, prev);
    }
    const rows = Array.from(map.values()).sort((a, b) => a.sort - b.sort).slice(-14);
    if (rows.length === 0) {
      return [
        { label: '—', revenue: 0, tickets: 0 },
        { label: 'Today', revenue: toRupees(data?.total_revenue_paise || 0), tickets: data?.tickets_sold || 0 },
      ];
    }
    return rows;
  }, [bookings, data]);

  const statusMix = useMemo(() => {
    const counts = { paid: 0, created: 0, failed: 0, expired: 0 };
    for (const b of bookings) {
      const s = b.status || 'created';
      if (counts[s] !== undefined) counts[s] += 1;
    }
    // Prefer live dashboard failed count when list is sparse
    if (data?.failed_payments != null && counts.failed === 0 && data.failed_payments > 0) {
      counts.failed = data.failed_payments;
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name: name.toUpperCase(),
        value,
        key: name,
      }));
  }, [bookings, data]);

  const eventMix = useMemo(() => {
    let published = 0;
    let draft = 0;
    for (const e of events) {
      if (e.status === 'published') published += 1;
      else draft += 1;
    }
    return [
      { label: 'Published', value: published, fill: '#00677e' },
      { label: 'Draft', value: draft, fill: '#5b5b7e' },
    ];
  }, [events]);

  const avgTicket = useMemo(() => {
    const paid = data?.paid_bookings || 0;
    if (!paid) return 0;
    return toRupees(data.total_revenue_paise || 0) / paid;
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-72 gap-md">
        <Loader2 className="h-9 w-9 text-primary-container animate-spin" />
        <p className="font-body-sm text-body-sm text-on-surface-variant">Loading dashboard…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-card p-xl text-center"
      >
        <div className="w-14 h-14 rounded-full bg-error-container text-error mx-auto mb-md flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">error</span>
        </div>
        <p className="text-error font-body-sm text-body-sm mb-md">
          {error.response?.data?.error || 'Failed to load dashboard. Is the API running on :4000?'}
        </p>
        <button type="button" className="btn-ghost" onClick={() => refetch()}>
          Retry
        </button>
      </motion.div>
    );
  }

  const failed = Number(data.failed_payments) || 0;
  const stats = [
    {
      label: 'Total Revenue',
      numeric: toRupees(data.total_revenue_paise),
      prefix: '₹',
      decimals: 0,
      hint: `${data.paid_bookings} paid booking${data.paid_bookings === 1 ? '' : 's'}`,
      icon: 'payments',
      accent: 'from-primary-fixed/80 to-transparent',
      iconBg: 'bg-primary-fixed text-on-primary-fixed',
    },
    {
      label: 'Tickets Sold',
      numeric: data.tickets_sold ?? 0,
      hint: 'From paid bookings',
      icon: 'confirmation_number',
      accent: 'from-tertiary-fixed/60 to-transparent',
      iconBg: 'bg-tertiary/10 text-tertiary',
      trendUp: (data.tickets_sold ?? 0) > 0,
    },
    {
      label: 'Total Events',
      numeric: data.event_count ?? 0,
      hint: `${eventMix[0].value} published · ${eventMix[1].value} draft`,
      icon: 'calendar_month',
      accent: 'from-secondary-container/70 to-transparent',
      iconBg: 'bg-secondary-container text-on-secondary-container',
    },
    {
      label: 'Failed Payments',
      numeric: failed,
      hint: failed > 0 ? 'Requires attention' : 'All clear',
      icon: failed > 0 ? 'warning' : 'verified',
      accent: failed > 0 ? 'from-error-container/80 to-transparent' : 'from-surface-container to-transparent',
      iconBg: failed > 0 ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary',
      isError: failed > 0,
    },
  ];

  const latestFive = bookings.slice(0, 5);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="pb-lg">
      <motion.div
        variants={item}
        className="flex flex-wrap items-end justify-between gap-md mb-lg"
      >
        <div>
          <p className="font-label-caps text-label-caps uppercase tracking-wider text-primary mb-xs">
            Operations
          </p>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            Dashboard Overview
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Live totals from paid bookings and gateway payments.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={() => {
              refetch();
              recentBookings.refetch();
              eventsQuery.refetch();
            }}
            className="btn-ghost !py-xs"
            disabled={isFetching}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${isFetching ? 'animate-spin' : ''}`}
            >
              refresh
            </span>
            Refresh
          </button>
          <Link to="/events/create" className="btn-primary !rounded-lg !py-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Event
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg ambient-shadow`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.accent}`}
            />
            <div className="relative flex items-start justify-between gap-sm mb-md">
              <p className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
                {stat.label}
              </p>
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}
              >
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </span>
            </div>
            <p
              className={`relative font-display-lg-mobile text-display-lg-mobile font-bold leading-none ${
                stat.isError ? 'text-error' : 'text-on-surface'
              }`}
            >
              <AnimatedValue
                value={stat.numeric}
                prefix={stat.prefix || ''}
                decimals={stat.decimals || 0}
              />
            </p>
            <p
              className={`relative font-body-sm text-body-sm mt-sm flex items-center gap-xs ${
                stat.isError
                  ? 'text-error'
                  : stat.trendUp
                    ? 'text-tertiary'
                    : 'text-on-surface-variant'
              }`}
            >
              {stat.trendUp && (
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
              )}
              {stat.isError && (
                <span className="material-symbols-outlined text-[16px]">warning</span>
              )}
              {stat.hint}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        {[
          {
            label: 'Avg. ticket value',
            value: `₹${avgTicket.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            icon: 'sell',
          },
          {
            label: 'Paid bookings',
            value: String(data.paid_bookings ?? 0),
            icon: 'task_alt',
          },
          {
            label: 'Conversion pulse',
            value:
              bookings.length > 0
                ? `${Math.round(
                    ((bookings.filter((b) => b.status === 'paid').length || 0) /
                      bookings.length) *
                      100
                  )}%`
                : '—',
            icon: 'monitoring',
          },
          {
            label: 'Open drafts',
            value: String(eventMix[1].value),
            icon: 'edit_note',
          },
        ].map((chip) => (
          <motion.div
            key={chip.label}
            variants={item}
            className="rounded-xl border border-outline-variant/80 bg-surface-container-low px-md py-md flex items-center gap-md"
          >
            <span className="material-symbols-outlined text-primary text-[22px]">
              {chip.icon}
            </span>
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
                {chip.label}
              </p>
              <p className="font-headline-md text-[18px] font-bold text-on-surface leading-tight">
                {chip.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg mb-lg">
        <motion.div
          variants={item}
          className="xl:col-span-8 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg ambient-shadow"
        >
          <div className="flex flex-wrap items-center justify-between gap-sm mb-md">
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Revenue over time
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Paid bookings by day (last {revenueSeries.length} points)
              </p>
            </div>
            <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container animate-pulse" />
              Live
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.4} />
                    <stop offset="70%" stopColor="#ff6b35" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2dfff" strokeDasharray="4 6" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#594139', fontSize: 12, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#594139', fontSize: 12, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#ff6b35"
                  fill="url(#revenueFill)"
                  strokeWidth={2.5}
                  animationDuration={1100}
                  animationEasing="ease-out"
                  activeDot={{ r: 5, fill: '#ab3500', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="xl:col-span-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg ambient-shadow flex flex-col"
        >
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
            Booking status
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
            Mix from recent gateway activity
          </p>
          <div className="h-48 w-full">
            {statusMix.length === 0 ? (
              <div className="h-full flex items-center justify-center text-on-surface-variant font-body-sm text-body-sm">
                No booking data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    animationDuration={1000}
                  >
                    {statusMix.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={STATUS_COLORS[entry.key] || '#5b5b7e'}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="mt-auto space-y-sm">
            {statusMix.map((s) => (
              <li key={s.key} className="flex items-center justify-between font-body-sm text-body-sm">
                <span className="flex items-center gap-sm text-on-surface">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: STATUS_COLORS[s.key] }}
                  />
                  {s.name}
                </span>
                <span className="font-code-ticket text-code-ticket text-on-surface-variant">
                  {s.value}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg">
        <motion.div
          variants={item}
          className="xl:col-span-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg ambient-shadow"
        >
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
            Events pipeline
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
            Published vs draft
          </p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventMix} barSize={36}>
                <CartesianGrid stroke="#e2dfff" strokeDasharray="4 6" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#594139', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#594139', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="Events" radius={[8, 8, 0, 0]} animationDuration={900}>
                  {eventMix.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="xl:col-span-8">
          <div className="flex items-center justify-between mb-md">
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Recent bookings
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Latest ticket purchases
              </p>
            </div>
            <Link
              to="/bookings"
              className="font-label-caps text-label-caps uppercase tracking-wider text-primary hover:text-surface-tint inline-flex items-center gap-xs"
            >
              View all
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {recentBookings.isLoading ? (
            <div className="flex justify-center py-xl">
              <Loader2 className="h-6 w-6 text-primary-container animate-spin" />
            </div>
          ) : latestFive.length === 0 ? (
            <div className="rounded-xl border-[1.5px] border-dashed border-outline-variant bg-surface-container p-xl text-center">
              <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container mx-auto mb-md flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">receipt_long</span>
              </div>
              <p className="font-headline-md text-[18px] font-bold text-on-surface mb-xs">
                No bookings yet
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                They appear here after customers complete checkout.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest ambient-shadow">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    {['Booking', 'Event', 'Amount', 'Status'].map((h) => (
                      <th
                        key={h}
                        className={`px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider ${
                          h === 'Amount' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {latestFive.map((b, idx) => (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.3 }}
                      className="h-[52px] border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-md">
                        <div className="font-code-ticket text-code-ticket text-primary">
                          {b.ticket_code || `#BK-${b.id}`}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {b.customer_name}
                        </div>
                      </td>
                      <td className="px-md font-body-sm text-body-sm text-on-surface max-w-[160px] truncate">
                        {b.event_title || '—'}
                      </td>
                      <td className="px-md text-right font-code-ticket text-code-ticket text-on-surface">
                        {formatInr(b.amount_paise)}
                      </td>
                      <td className="px-md">
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
