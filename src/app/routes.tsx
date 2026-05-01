import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ModuleList } from "./pages/modules/ModuleList";
import { ModuleForm } from "./pages/modules/ModuleForm";
import { ROLE_ACCESS } from "./data/mockData";

const allPaths = Array.from(new Set(Object.values(ROLE_ACCESS).flatMap(routes => routes.map(r => r.path))));

const moduleRoutes = allPaths.map(path => {
  const cleanPath = path.replace('/', '');
  return {
    path: cleanPath,
    children: [
      { index: true, element: <ModuleList /> },
      { path: "new", element: <ModuleForm /> },
    ]
  };
});

const Root = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <Dashboard /> },
          ...moduleRoutes,
          { path: "*", element: <Navigate to="/" replace /> }
        ]
      },
      {
        path: "/login",
        element: <Login />,
      }
    ]
  }
]);
