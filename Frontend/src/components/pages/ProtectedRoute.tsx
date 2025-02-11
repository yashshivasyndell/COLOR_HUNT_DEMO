import { useTypedSelector } from "../../app/store";
import { Navigate, Outlet } from "react-router-dom";
import { Loader } from "../Loader";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useTypedSelector(
    (state) => state.auth
  );

  useEffect(() => {
    console.log("Is Authenticatedddd: ", isAuthenticated);
  }, [isAuthenticated]);

  if (isLoading) return <Loader />;

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
