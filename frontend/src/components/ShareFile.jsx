import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

function ShareFile() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const shareableLink = `https://vaultdrop-render.onrender.com/download/${fileId}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(
        `https://vaultdrop-render.onrender.com/api/files/share/${fileId}`,
        { email },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      console.error('Share error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 transform transition-all duration-500 hover:shadow-2xl animate-slide-up">
        <div className="flex items-center justify-center gap-3 animate-fade-in">
          <FiMail className="w-6 h-6 text-blue-700" />
          <h2 className="text-3xl font-bold text-blue-700">Share File</h2>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-12 bg-gray-300 rounded-md w-full"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <FiMail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Recipient email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiMail className="w-5 h-5" />
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-center animate-pulse flex items-center justify-center gap-2">
            <FiAlertTriangle className="w-5 h-5" />
            {error}
          </p>
        )}

        {/* Success Message and Shareable Link */}
        {message && (
          <div className="space-y-4 text-center animate-fade-in">
            <p className="text-green-600 flex items-center justify-center gap-2 animate-pulse">
              <FiCheckCircle className="w-5 h-5" />
              {message}
            </p>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <FiMail className="w-5 h-5" />
              Shareable Link:{' '}
              <a
                href={shareableLink}
                className="text-blue-600 hover:underline break-all animate-pulse"
              >
                {shareableLink}
              </a>
            </p>
          </div>
        )}

        {/* Back to Dashboard */}
        <p className="text-center text-gray-600">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 text-blue-600 hover:underline hover:text-blue-800 transition duration-200"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </p>
      </div>

      {/* Tailwind Animation Classes */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
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

export default ShareFile;