import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FiUpload,
  FiLock,
  FiFileText,
  FiClock,
  FiDownload,
  FiMail,
  FiAlertTriangle,
  FiArrowLeft,
} from 'react-icons/fi';

function UploadFile() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [downloadLimit, setDownloadLimit] = useState(5);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // File size validation based on file type
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB
      const fileType = file.type.split('/')[0]; // 'image', 'video', or 'application' for raw/ZIP

      if (fileType === 'image' && fileSizeMB > 10) {
        setError('Image files must be less than 10 MB.');
        setIsLoading(false);
        return;
      }
      if (fileType === 'video' && fileSizeMB > 100) {
        setError('Video files must be less than 100 MB.');
        setIsLoading(false);
        return;
      }
      if (fileType === 'application' && fileSizeMB > 10) {
        setError('Raw files (e.g., ZIP) must be less than 10 MB.');
        setIsLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    formData.append('expiresInHours', expiresInHours);
    formData.append('downloadLimit', downloadLimit);
    formData.append('description', description);
    formData.append('isGlobal', isGlobal);

    try {
      const res = await axios.post('/api/files/upload', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setShareableLink(res.data.shareableLink);
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 transform transition-all duration-500 hover:shadow-2xl animate-slide-up">
        <div className="flex items-center justify-center gap-3 animate-fade-in">
          <FiUpload className="w-6 h-6 text-blue-700" />
          <h2 className="text-3xl font-bold text-blue-700">Upload File</h2>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-md w-full"></div>
            ))}
            <div className="h-12 bg-gray-300 rounded-md w-full"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Input */}
            <div className="relative">
              <FiFileText className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-600 hover:file:bg-blue-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max size: 10 MB (Images, Raw/ZIP), 100 MB (Videos)
              </p>
            </div>

            {/* Description Textarea */}
            <div className="relative">
              <FiFileText className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <textarea
                placeholder="File description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                rows="4"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <FiLock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Optional password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>

            {/* Expiration Input */}
            <div className="relative">
              <FiClock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <input
                type="number"
                placeholder="Expiration (hours)"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                required
                min="1"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>

            {/* Download Limit Input */}
            <div className="relative">
              <FiDownload className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <input
                type="number"
                placeholder="Download limit"
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(e.target.value)}
                required
                min="1"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => setIsGlobal(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label className="text-sm text-gray-600">Make file public (show in Explore)</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiUpload className="w-5 h-5" />
              {isLoading ? 'Uploading...' : 'Upload'}
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

        {/* Shareable Link */}
        {shareableLink && (
          <div className="space-y-4 text-center animate-fade-in">
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <FiFileText className="w-5 h-5" />
              Shareable Link:{' '}
              <a href={shareableLink} className="text-blue-600 hover:underline break-all animate-pulse">
                {shareableLink}
              </a>
            </p>
            <button
              onClick={() => navigate(`/share/${shareableLink.split('/').pop()}`)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105"
            >
              <FiMail className="w-5 h-5" />
              Share via Email
            </button>
          </div>
        )}

        {/* Back to Dashboard */}
        <p className="text-center text-gray-600">
          <a
            href="/dashboard"
            className="flex items-center justify-center gap-2 text-blue-600 hover:underline hover:text-blue-800 transition duration-200"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </a>
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

export default UploadFile;
