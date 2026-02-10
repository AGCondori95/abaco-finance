import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider, useAuth} from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

// Layout
import Layout from "./components/Layout/Layout";

// Protected Route Component
const ProtectedRoute = ({children, adminOnly = false}) => {
  const {isAuthenticated, isAdmin, loading} = useAuth();

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to='/dashboard' />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Protected Routes */}
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
            <Route index element={<Navigate to='/dashboard' />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='budgets' element={<Budgets />} />
            <Route path='transactions' element={<Transactions />} />
            <Route path='reports' element={<Reports />} />
            <Route path='profile' element={<Profile />} />

            {/* Admin Only */}
            <Route
              path='admin'
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
