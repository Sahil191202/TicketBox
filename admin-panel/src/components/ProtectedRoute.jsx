import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const hasToken = localStorage.getItem('ticketbox-auth');

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
