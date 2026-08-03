import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Ticket, Webhook, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Bookings', path: '/bookings', icon: Ticket },
    { name: 'Webhook Logs', path: '/webhooks', icon: Webhook },
  ];

  return (
    <div className="flex h-screen bg-deepPurple text-white overflow-hidden relative">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-electricViolet/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-hotPink/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-64 glass-panel flex flex-col relative z-10 border-r border-white/10">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <h1 className="text-2xl font-extrabold text-gradient tracking-wider">TicketBox</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors z-10 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-electricViolet rounded-xl -z-10 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-400 rounded-xl hover:bg-white/5 hover:text-hotPink transition-colors group"
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:text-hotPink transition-colors" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-8 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
