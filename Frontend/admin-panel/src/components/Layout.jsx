import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const NAV_ICONS = {
  Dashboard: 'dashboard',
  Events: 'calendar_today',
  Bookings: 'confirmation_number',
  'Webhook Logs': 'webhook',
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Webhook Logs', path: '/webhooks' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md">
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 border-r border-outline-variant bg-surface-container-low p-md gap-lg z-40">
        <div className="mb-lg">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            TicketBox Admin
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Management Console
          </p>
        </div>

        <div className="flex flex-col gap-xs flex-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-sm px-sm py-sm rounded-lg font-body-sm text-body-sm transition-colors ${
                  active
                    ? 'bg-primary-container text-on-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {NAV_ICONS[item.name]}
                </span>
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-md border-t border-outline-variant space-y-sm">
          <Link to="/events/create" className="btn-admin-cta">
            <span className="material-symbols-outlined text-[18px] mr-xs">add</span>
            Create Event
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-sm px-sm py-sm rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-col flex-1 md:ml-64 min-w-0">
        <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-lg h-14">
          <div className="relative flex items-center input-glow rounded-full border border-outline-variant bg-surface-container-lowest flex-1 max-w-md">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-sm text-[20px]">
              search
            </span>
            <input
              type="text"
              className="w-full h-[40px] pl-[40px] pr-md rounded-full bg-transparent text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/60 focus:outline-none"
              placeholder="Search events..."
              readOnly
            />
          </div>
          <div className="flex items-center gap-sm ml-md">
            <button type="button" className="p-sm text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Notifications">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
            <button type="button" className="p-sm text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Settings">
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>
            <Link to="/events/create" className="hidden sm:inline-flex btn-admin-cta !w-auto px-lg">
              + Create Event
            </Link>
          </div>
        </header>

        <main className="flex-1 p-lg md:p-xl bg-surface overflow-y-auto">
          <div className="animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
