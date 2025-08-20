import { Navigate, Outlet } from 'react-router-dom';

const isAuthed = () => {
  return !!localStorage.getItem("user_id");
};

export function PrivateRoute() {
  return isAuthed() ? <Outlet /> : <Navigate to="/" replace />;
}
export function PublicRoute() {
  return isAuthed() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
