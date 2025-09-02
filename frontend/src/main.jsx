import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";

// Import components for routing
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import FormList from "./components/forms/FormList";
import FormDetails from "./components/forms/FormDetails";
import FormBuilder from "./components/admin/FormBuilder";
import UserManagement from "./components/admin/UserManagement";
import RoleManagement from "./components/admin/RoleManagement";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <ProtectedRoute element={<Dashboard />} />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/forms",
        element: <ProtectedRoute element={<FormList />} />,
      },
      {
        path: "/forms/:formId",
        element: <ProtectedRoute element={<FormDetails />} />,
      },
      {
        path: "/admin",
        element: <ProtectedRoute element={<AdminDashboard />} adminOnly={true} />,
      },
      {
        path: "/admin/form-builder",
        element: <ProtectedRoute element={<FormBuilder />} adminOnly={true} />,
      },
      {
        path: "/admin/form-builder/:templateId",
        element: <ProtectedRoute element={<FormBuilder />} adminOnly={true} />,
      },
      {
        path: "/admin/users",
        element: <ProtectedRoute element={<UserManagement />} adminOnly={true} />,
      },
      {
        path: "/admin/roles",
        element: <ProtectedRoute element={<RoleManagement />} adminOnly={true} />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
