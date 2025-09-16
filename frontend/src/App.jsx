import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiHome,
  FiLogIn,
  FiUserPlus,
  FiUpload,
  FiLogOut,
  FiMenu,
  FiX,
  FiSearch,
} from 'react-icons/fi';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import UploadFile from './components/UploadFile';
import ShareFile from './components/ShareFile';
import DownloadFile from './components/DownloadFile';
import Dashboard from './components/Dashboard';
import Explore from './components/Explore';

// Function to check if token is expired (assuming JWT)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiry;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Treat invalid tokens as expired
  }
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token && !isTokenExpired(token);
  const location = useLocation(); // Get current location

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{
          message: token ? 'Your session has expired. Please log in again.' : 'Please log in to access this page.',
          from: location.pathname + location.search, // Pass the current URL
        }}
        replace
      />
    );
  }
  return children;
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token && !isTokenExpired(token);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { state: { message: 'You have been logged out.' } });
    closeMenu();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-xl sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <NavLink
                to="/"
                className="flex items-center gap-2 text-2xl font-bold text-blue-700 hover:text-blue-800 transition duration-300 transform hover:scale-105"
              >
                <FiHome className="w-6 h-6" />
                VaultDrop
              </NavLink>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 transform hover:scale-105 ${
                    isActive ? 'text-blue-600 font-semibold' : ''
                  }`
                }
              >
                <FiHome className="w-5 h-5" />
                Home
              </NavLink>
              <NavLink
                to="/explore"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 transform hover:scale-105 ${
                    isActive ? 'text-blue-600 font-semibold' : ''
                  }`
                }
              >
                <FiSearch className="w-5 h-5" />
                Explore
              </NavLink>
              {!isLoggedIn && (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 transform hover:scale-105 ${
                        isActive ? 'text-blue-600 font-semibold' : ''
                      }`
                    }
                  >
                    <FiLogIn className="w-5 h-5" />
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 transform hover:scale-105 ${
                        isActive ? 'text-blue-600 font-semibold' : ''
                      }`
                    }
                  >
                    <FiUserPlus className="w-5 h-5" />
                    Register
                  </NavLink>
                </>
              )}
              {isLoggedIn && (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 transform hover:scale-105 ${
                        isActive ? 'text-blue-600 font-semibold' : ''
                      }`
                    }
                  >
                    <FiGrid className="w-5 h-5" />
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/upload"
                    className={({ isActive }) =>
                      `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 transform hover:scale-105 ${
                        isActive ? 'text-blue-600 font-semibold' : ''
                      }`
                    }
                  >
                    <FiUpload className="w-5 h-5" />
                    Upload
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 transform hover:scale-105"
                  >
                    <FiLogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              )}
            </nav>
            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden bg-white shadow-md animate-slide-down">
              <div className="flex flex-col space-y-2 px-4 py-4">
                <NavLink
                  to="/"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 py-2 ${
                      isActive ? 'text-blue-600 font-semibold' : ''
                    }`
                  }
                >
                  <FiHome className="w-5 h-5" />
                  Home
                </NavLink>
                <NavLink
                  to="/explore"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 py-2 ${
                      isActive ? 'text-blue-600 font-semibold' : ''
                    }`
                  }
                >
                  <FiSearch className="w-5 h-5" />
                  Explore
                </NavLink>
                {!isLoggedIn && (
                  <>
                    <NavLink
                      to="/login"
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 py-2 ${
                          isActive ? 'text-blue-600 font-semibold' : ''
                        }`
                      }
                    >
                      <FiLogIn className="w-5 h-5" />
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 py-2 ${
                          isActive ? 'text-blue-600 font-semibold' : ''
                        }`
                      }
                    >
                      <FiUserPlus className="w-5 h-5" />
                      Register
                    </NavLink>
                  </>
                )}
                {isLoggedIn && (
                  <>
                    <NavLink
                      to="/dashboard"
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 py-2 ${
                          isActive ? 'text-blue-600 font-semibold' : ''
                        }`
                      }
                    >
                      <FiGrid className="w-5 h-5" />
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/upload"
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 py-2 ${
                          isActive ? 'text-blue-600 font-semibold' : ''
                        }`
                      }
                    >
                      <FiUpload className="w-5 h-5" />
                      Upload
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-300 py-2 text-left"
                    >
                      <FiLogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadFile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/share/:fileId" element={<ShareFile />} />
          <Route path="/download/:fileId" element={<DownloadFile />} />
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
      </main>
      {/* Tailwind Animation Classes */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
