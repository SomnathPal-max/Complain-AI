import React, { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintsProvider } from './context/ComplaintsContext';
import { ThemeProvider } from './context/ThemeContext';
import { DisplayModeProvider } from './context/DisplayModeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WorkspaceShell } from './components/WorkspaceShell';
import { PageMotion } from './components/PageMotion';
import { HomePage } from './pages/HomePage';
const SubmitComplaintPage = lazy(async () => ({
  default: (await import('./pages/SubmitComplaintPage')).SubmitComplaintPage,
}));
const TrackComplaintPage = lazy(async () => ({
  default: (await import('./pages/TrackComplaintPage')).TrackComplaintPage,
}));
const LoginPage = lazy(async () => ({
  default: (await import('./pages/LoginPage')).LoginPage,
}));
const RegisterPage = lazy(async () => ({
  default: (await import('./pages/RegisterPage')).RegisterPage,
}));
const AdminLoginPage = lazy(async () => ({
  default: (await import('./pages/AdminLoginPage')).AdminLoginPage,
}));
const AdminRegisterPage = lazy(async () => ({
  default: (await import('./pages/AdminRegisterPage')).AdminRegisterPage,
}));
const UserDashboardPage = lazy(async () => ({
  default: (await import('./pages/UserDashboardPage')).UserDashboardPage,
}));
const AdminDashboardPage = lazy(async () => ({
  default: (await import('./pages/AdminDashboardPage')).AdminDashboardPage,
}));
const AdminComplaintDetailPage = lazy(async () => ({
  default: (await import('./pages/AdminComplaintDetailPage'))
    .AdminComplaintDetailPage,
}));
const ModelEvaluationPage = lazy(async () => ({
  default: (await import('./pages/ModelEvaluationPage')).ModelEvaluationPage,
}));

// Protected Route wrapper for regular authenticated users (Mandatory Login Enforcement)
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center">
        <div className="w-10 h-10 rounded-2xl bg-primaryViolet flex items-center justify-center text-white mb-3 shadow-glossy-light">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
          Verifying ResolveX-AI authentication...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname + location.search,
          message:
            'Please sign in or create an account to access ResolveX-AI features.',
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};

// Protected Route wrapper for administrators
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center">
        <div className="w-10 h-10 rounded-2xl bg-primaryViolet flex items-center justify-center text-white mb-3 shadow-glossy-light">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
          Checking administrative clearance...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        state={{
          from: location.pathname + location.search,
          message:
            'Please sign in with authorized administrator credentials to access the Facility Admin Portal.',
        }}
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#171F3B] border border-rose-200 dark:border-rose-500/30 shadow-card-light dark:shadow-card-dark text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-500/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-[#172033] dark:text-[#F8FAFC]">
            Administrative Clearance Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your account (
            <strong className="text-slate-800 dark:text-slate-200">
              {user.email}
            </strong>
            ) is currently signed in as a student and is not authorized to
            access the Facility Admin Console.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-primaryViolet text-white text-xs font-bold shadow-xs hover:bg-violet-700 transition-colors"
            >
              Go to Student Dashboard
            </Link>
            <Link
              to="/admin/login"
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
            >
              Switch to Admin Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Public marketing pages and the responsive authenticated workspace.
const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const workspaceRoute =
    ['/dashboard', '/submit', '/track', '/model-eval'].includes(pathname) ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/complaints/');
  const routes = (
    <>
    <PageMotion />
    <Suspense
      fallback={
        <div className="state-block" role="status">
          Loading workspace…
        </div>
      }
    >
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin-login"
          element={<Navigate to="/admin/login" replace />}
        />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route
          path="/admin-register"
          element={<Navigate to="/admin/register" replace />}
        />

        {/* Mandatory Protected Application Pages */}
        <Route
          path="/submit"
          element={
            <ProtectedUserRoute>
              <SubmitComplaintPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/track"
          element={
            <ProtectedUserRoute>
              <TrackComplaintPage />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/model-eval"
          element={
            <ProtectedUserRoute>
              <ModelEvaluationPage />
            </ProtectedUserRoute>
          }
        />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedUserRoute>
              <UserDashboardPage />
            </ProtectedUserRoute>
          }
        />

        {/* Admin Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/complaints/:publicId"
          element={
            <ProtectedAdminRoute>
              <AdminComplaintDetailPage />
            </ProtectedAdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </>
  );
  if (workspaceRoute && user)
    return (
      <>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <WorkspaceShell>{routes}</WorkspaceShell>
      </>
    );
  return (
    <div className="site-layout">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">{routes}</main>
      {pathname === '/' && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DisplayModeProvider>
        <AuthProvider>
          <ComplaintsProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </ComplaintsProvider>
        </AuthProvider>
      </DisplayModeProvider>
    </ThemeProvider>
  );
};

export default App;
