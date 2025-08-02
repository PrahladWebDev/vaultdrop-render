import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  FiDownload,
  FiLock,
  FiKey,
  FiFile,
  FiImage,
  FiFileText,
  FiArchive,
  FiAlertTriangle,
} from 'react-icons/fi';

function DownloadFile() {
  const { fileId } = useParams();
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [description, setDescription] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadLimit, setDownloadLimit] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);

  useEffect(() => {
    const checkFile = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/api/files/check/${fileId}`);
        setRequiresOtp(res.data.requiresOtp);
        setHasPassword(res.data.hasPassword);
        setDescription(res.data.description);
        setDownloadLimit(res.data.downloadLimit);
        setDownloadCount(res.data.downloadCount);
        setFilename(res.data.filename || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to check file');
      } finally {
        setIsLoading(false);
      }
    };
    checkFile();
  }, [fileId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (requiresOtp && !otp) {
      setError('OTP is required');
      setIsLoading(false);
      return;
    }
    if (hasPassword && !password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(`/api/files/download/${fileId}`, {
        password,
        otp,
      });
      setUrl(res.data.url);
      setFilename(res.data.filename);
      setDescription(res.data.description);
      setError('');
      setDownloadCount((prevCount) => prevCount + 1);
    } catch (err) {
      console.error('Download error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Download failed');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDownload = () => {
  //   if (url && filename) {
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = filename;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // };

  

const handleDownload = async () => {
  if (url && filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const isRaw = ['pdf', 'txt', 'doc', 'docx', 'zip', 'rar'].includes(ext);

    if (isRaw) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Download error:', error);
        setError('Failed to download file.');
      }
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }
};



  const getFileIcon = (fileName) => {
    if (!fileName) return <FiFile className="w-6 h-6" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'png', 'jpeg', 'gif'].includes(ext)) return <FiImage className="w-6 h-6" />;
    if (['pdf'].includes(ext)) return <FiFileText className="w-6 h-6" />;
    if (['doc', 'docx'].includes(ext)) return <FiFile className="w-6 h-6" />;
    if (['zip', 'rar'].includes(ext)) return <FiArchive className="w-6 h-6" />;
    return <FiFile className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 transform transition-all duration-500 hover:shadow-2xl animate-slide-up">
        <div className="flex items-center justify-center gap-3 animate-fade-in">
          {getFileIcon(filename)}
          <h2 className="text-3xl font-bold text-blue-700">Download File</h2>
        </div>

        {/* Description */}
        {description && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <FiFileText className="w-4 h-4" />
              <span className="font-semibold">Description:</span> {description}
            </p>
          </div>
        )}

        {/* Downloads Remaining */}
        <p className="text-gray-600 text-sm text-center flex items-center justify-center gap-2">
          <FiDownload className="w-4 h-4" />
          <span className="font-semibold">Downloads Remaining:</span>{' '}
          {downloadLimit - downloadCount}
        </p>

        {/* Loading State */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-12 bg-gray-300 rounded-md w-full"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            {hasPassword && (
              <div className="relative">
                <FiLock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="File password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
              </div>
            )}

            {/* OTP Input */}
            {requiresOtp && (
              <div className="relative">
                <FiKey className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiDownload className="w-5 h-5" />
              {isLoading ? 'Processing...' : 'Download'}
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

        {/* OTP Expired Message */}
        {error === 'OTP has expired, please request a new OTP' && (
          <p className="text-gray-600 text-center text-sm">
            Please ask the file owner to send a new OTP via email.
          </p>
        )}

        {/* Download Link */}
        {url && (
          <div className="text-center">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 mx-auto text-blue-600 hover:underline animate-pulse"
            >
              {getFileIcon(filename)}
              <span>{filename}</span>
            </button>
          </div>
        )}
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

export default DownloadFile;
