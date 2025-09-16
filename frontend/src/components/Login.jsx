import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirectMessage, setRedirectMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect message from location.state or localStorage
  useEffect(() => {
    // Get message from location.state (preferred)
    const message = location.state?.message || localStorage.getItem('loginMessage') || '';
    setRedirectMessage(message);
    console.log('Location state:', location.state);
    console.log('Redirect message:', message);
    // Clear localStorage message after displaying
    if (localStorage.getItem('loginMessage')) {
      localStorage.removeItem('loginMessage');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setError(''); // Clear any previous errors
      setRedirectMessage(''); // Clear redirect message on successful login
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6 transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-center text-blue-600">Login to VaultDrop</h2>
        {/* Display redirect message */}
        {redirectMessage && (
          <p className="text-yellow-600 bg-yellow-100 p-3 rounded-md text-center animate-fade-in">
            {redirectMessage}
          </p>
        )}
        {/* Display error message */}
        {error && (
          <p className="text-red-500 bg-red-100 p-3 rounded-md text-center animate-pulse">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <a
            href="/register"
            className="text-blue-600 hover:underline hover:text-blue-800 transition duration-200"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
