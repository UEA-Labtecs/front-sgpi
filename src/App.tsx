// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Patents from './pages/Patents';
import Dashboard from './pages/Dashboard';
import RequireRole from './components/RequireRoles';
import Forbidden403 from './pages/Forbidden403';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* /register AGORA é só para admin */}
          <Route
            path="/register"
            element={
              <RequireRole allowed={['admin']}>
                <Register />
              </RequireRole>
            }
          />
          <Route
            path="/patent-list"
            element={isAuthenticated ? <Patents /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route path="/403" element={<Forbidden403 />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
