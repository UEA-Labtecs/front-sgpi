import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Patents from './pages/Patents';
import './index.css';
import Dashboard from './pages/Dashboard';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: { iconTheme: { primary: '#007B8F', secondary: '#fff' } },
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/patent-list"
            element={isAuthenticated ? <Patents /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
