import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  
  // Redirect if the user is not logged in
  if (!user) return <Navigate to="/login" />;

  // Redirect if admin-only page is accessed by a non-admin user
  if (adminOnly && user.role !== "admin") return <Navigate to="/user-dashboard" />;
  
  return children;
};

export default ProtectedRoute;
