export default function Dashboard() {
  const stats = [
    { label: 'Total Revenue', value: '—', trend: null },
    { label: 'Tickets Sold', value: '—', trend: null },
    { label: 'Total Events', value: '—', trend: null },
    { label: 'Failed Payments', value: '—', trend: null, isError: true },
  ];

  return (
    <div>
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
        Dashboard Overview
      </h1>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
        Stats and charts land on Day 5.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        {stats.map(({ label, value, isError }) => (
          <div
            key={label}
            className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant admin-card-shadow"
          >
            <p className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant mb-sm">
              {label}
            </p>
            <p
              className={`font-display-lg-mobile text-display-lg-mobile font-bold ${
                isError ? 'text-error' : 'text-on-surface'
              }`}
            >
              {value}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">Coming soon</p>
          </div>
        ))}
      </div>

      <div className="admin-card p-xl text-center">
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
          Revenue Over Time
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Chart wiring arrives with the dashboard API on Day 5.
        </p>
      </div>
    </div>
  );
}
