export default function Webhooks() {
  return (
    <div>
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">
        Gateway Webhook Logs
      </h1>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
        Monitor incoming events from Razorpay.
      </p>

      <div className="border border-outline-variant rounded-xl p-md bg-surface-container-lowest flex flex-wrap gap-md mb-lg">
        <select className="h-[40px] px-md rounded-lg border-[1.5px] border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-0 appearance-none cursor-pointer">
          <option>All Event Types</option>
        </select>
        <select className="h-[40px] px-md rounded-lg border-[1.5px] border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-0 appearance-none cursor-pointer">
          <option>Signature Status</option>
        </select>
        <input
          type="date"
          className="h-[40px] px-md rounded-lg border-[1.5px] border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:border-primary focus:ring-0"
        />
      </div>

      <div className="bg-surface-container border-[1.5px] border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-md">
          <span className="material-symbols-outlined text-[32px]">webhook</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Coming Soon</h3>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-[300px]">
          Expandable webhook rows with signature badges land on Day 5.
        </p>
      </div>
    </div>
  );
}
