import { Navigate, Outlet } from 'react-router-dom';

const isAuthed = () => !!localStorage.getItem('token');

export function PrivateRoute() {
  return isAuthed() ? <Outlet /> : <Navigate to="/" replace />;
}
export function PublicRoute() {
  return isAuthed() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
