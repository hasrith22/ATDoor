import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";

// Customer & General Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Services from "./pages/Services";
import MyBookings from "./pages/MyBookings";
import LiveTracking from "./pages/LiveTracking";
import Help from "./pages/Help";

// Workspace Pages
import ProviderWorkspace from "./pages/ProviderWorkspace";
import AdminDashboard from "./pages/AdminDashboard";
import SupportDashboard from "./pages/SupportDashboard";

// Operations Manager
import ManagerShell from "./components/manager/ManagerShell";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerOperations from "./pages/manager/ManagerOperations";
import ManagerBookings from "./pages/manager/ManagerBookings";
import ManagerProviders from "./pages/manager/ManagerProviders";
import ManagerAssignments from "./pages/manager/ManagerAssignments";
import ManagerSchedule from "./pages/manager/ManagerSchedule";
import ManagerEscalations from "./pages/manager/ManagerEscalations";
import ManagerQuality from "./pages/manager/ManagerQuality";
import ManagerAnalytics from "./pages/manager/ManagerAnalytics";
import ManagerHelp from "./pages/manager/ManagerHelp";

function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const isWorkspace =
    location.pathname.startsWith("/manager") ||
    location.pathname.startsWith("/provider") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/support");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!isWorkspace && <Navbar />}
      <div className="flex-1">
        <Routes>
          {/* Main User Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/services" element={<Services />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/tracking" element={<LiveTracking />} />
          <Route path="/help" element={<Help />} />

          {/* Role Workspaces */}
          <Route path="/provider" element={<ProviderWorkspace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/support" element={<SupportDashboard />} />

          {/* Operations Manager Nested Routes */}
          <Route path="/manager" element={<ManagerShell />}>
            <Route index element={<ManagerDashboard />} />
            <Route path="operations" element={<ManagerOperations />} />
            <Route path="bookings" element={<ManagerBookings />} />
            <Route path="providers" element={<ManagerProviders />} />
            <Route path="assignments" element={<ManagerAssignments />} />
            <Route path="schedule" element={<ManagerSchedule />} />
            <Route path="escalations" element={<ManagerEscalations />} />
            <Route path="quality" element={<ManagerQuality />} />
            <Route path="analytics" element={<ManagerAnalytics />} />
            <Route path="help" element={<ManagerHelp />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isWorkspace && (
        <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
          © 2026 AtDoor. Complete Home Services Marketplace platform.
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
