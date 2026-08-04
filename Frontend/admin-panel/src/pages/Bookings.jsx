export default function Bookings() {
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
          <button type="button" className="btn-ghost">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export CSV
          </button>
          <button type="button" className="btn-ghost">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filter
          </button>
        </div>
      </div>

      <div className="bg-surface-container border-[1.5px] border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-md">
          <span className="material-symbols-outlined text-[32px]">receipt_long</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Coming Soon</h3>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-[300px]">
          Bookings table with PAID / CREATED / FAILED badges lands on Day 5.
        </p>
      </div>
    </div>
  );
}
