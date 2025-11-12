import React, { useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import DoctorNew from "./pages/DoctorNew";
import DoctorEdit from "./pages/DoctorEdit";
import PatientNew from "./pages/PatientNew";
import PatientEdit from "./pages/PatientEdit";
import Profile from "./pages/Profile";
import SuperAdmin from "./pages/SuperAdmin";
import Login from "./pages/Login";
import { loadToken, setClinicContext, getCurrentUser } from "./lib/api";

function PrivateRoutes() {
  // simplistic auth gate
  const token = loadToken();
  const location = useLocation();
  useEffect(() => {
    // Set clinic context from current user
    const user = getCurrentUser();
    if (user?.clinicId) {
      setClinicContext(user.clinicId);
    } else {
      // Super admin doesn't have a clinicId, clear context
      setClinicContext(undefined);
    }
  }, []);
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return (
    <Layout />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/new" element={<DoctorNew />} />
        <Route path="/doctors/:id/edit" element={<DoctorEdit />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/new" element={<PatientNew />} />
        <Route path="/patients/:id/edit" element={<PatientEdit />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/superadmin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
      </Route>
    </Routes>
  );
}

function SuperAdminRoute({ children }: { children: JSX.Element }) {
  const user = getCurrentUser();
  if (user?.role !== "super-admin") return <Navigate to="/dashboard" replace />;
  return children;
}

