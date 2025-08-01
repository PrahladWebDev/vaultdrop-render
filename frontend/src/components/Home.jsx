import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiDownload, FiLock, FiArrowRight, FiUsers } from 'react-icons/fi';

function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 sm:px-6 lg:px-8 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-700 mb-6 transform transition-all duration-500 hover:scale-105">
          Secure File Sharing with VaultDrop
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-8 animate-slide-up">
          Upload, share, and download files securely with password protection, OTP verification, and expiration controls.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(isLoggedIn ? '/upload' : '/register')}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105"
          >
            <FiUploadCloud className="w-5 h-5" />
            {isLoggedIn ? 'Upload Now' : 'Get Started'}
          </button>
          {isLoggedIn && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105"
            >
              <FiArrowRight className="w-5 h-5" />
              Go to Dashboard
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-700 text-center mb-12 animate-fade-in">
            Why Choose VaultDrop?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl shadow-xl p-6 text-center transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-slide-up">
              <FiUploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Uploads</h3>
              <p className="text-gray-600">
                Upload files quickly and set custom expiration times and download limits.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl shadow-xl p-6 text-center transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-slide-up animation-delay-200">
              <FiLock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Sharing</h3>
              <p className="text-gray-600">
                Protect your files with passwords and OTPs for secure sharing.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl shadow-xl p-6 text-center transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-slide-up animation-delay-400">
              <FiDownload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Controlled Downloads</h3>
              <p className="text-gray-600">
                Track download counts and manage access with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-6 animate-fade-in">
          Start Sharing Files Today
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-slide-up">
          Join thousands of users who trust VaultDrop for secure and efficient file sharing.
        </p>
        <button
          onClick={() => navigate(isLoggedIn ? '/upload' : '/register')}
          className="flex items-center justify-center gap-2 mx-auto bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105"
        >
          <FiUsers className="w-5 h-5" />
          {isLoggedIn ? 'Start Uploading' : 'Sign Up Now'}
        </button>
      </section>

      {/* Tailwind Animation Classes */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
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

export default Home;