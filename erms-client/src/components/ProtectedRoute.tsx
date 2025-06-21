import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If user is authenticated but not allowed, redirect to login
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 