import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../state/AuthContext.jsx";

export default function RequireAdmin({ children }) {
  const { user, loadingMe } = useContext(AuthContext);

  if (loadingMe) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;

  return children;
}