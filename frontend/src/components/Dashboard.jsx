import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FiUpload,
  FiDownload,
  FiFile,
  FiImage,
  FiFileText,
  FiArchive,
  FiMail,
  FiAlertTriangle,
} from 'react-icons/fi';
import { FaVideo } from 'react-icons/fa'; // Added for video files

function Dashboard() {
  const [stats, setStats] = useState({ totalUploads: 0, totalDownloads: 0, activeFiles: 0 });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('https://vaultdrop-render.onrender.com/api/analytics/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStats(res.data.stats);
        setFiles(res.data.files);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const truncateDescription = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    let fileType = ext.toUpperCase();
    let icon;

    if (['jpg', 'png', 'jpeg', 'gif'].includes(ext)) {
      icon = <FiImage className="w-6 h-6" />;
      fileType = 'IMAGE';
    } else if (['pdf'].includes(ext)) {
      icon = <FiFileText className="w-6 h-6" />;
      fileType = 'PDF';
    } else if (['doc', 'docx'].includes(ext)) {
      icon = <FiFile className="w-6 h-6" />;
      fileType = 'DOC';
    } else if (['zip', 'rar'].includes(ext)) {
      icon = <FiArchive className="w-6 h-6" />;
      fileType = 'ARCHIVE';
    } else if (['mp4', 'mov', 'avi'].includes(ext)) {
      icon = <FaVideo className="w-6 h-6" />;
      fileType = 'VIDEO';
    } else if (['txt', 'md'].includes(ext)) {
      icon = <FiFileText className="w-6 h-6" />;
      fileType = 'TEXT';
    } else {
      icon = <FiFile className="w-6 h-6" />;
      fileType = 'FILE';
    }

    return { icon, fileType };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-blue-700">VaultDrop Dashboard</h2>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-500 hover:shadow-2xl animate-slide-up">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Stats</h3>
          {isLoading ? (
            <div className="animate-pulse grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center transform transition-all duration-300 hover:scale-110">
                <p className="text-gray-600 flex items-center justify-center gap-2">
                  <FiUpload className="w-5 h-5" />
                  Total Uploads
                </p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUploads}</p>
              </div>
              <div className="text-center transform transition-all duration-300 hover:scale-110">
                <p className="text-gray-600 flex items-center justify-center gap-2">
                  <FiDownload className="w-5 h-5" />
                  Total Downloads
                </p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalDownloads}</p>
              </div>
              <div className="text-center transform transition-all duration-300 hover:scale-110">
                <p className="text-gray-600 flex items-center justify-center gap-2">
                  <FiFile className="w-5 h-5" />
                  Active Files
                </p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeFiles}</p>
              </div>
            </div>
          )}
        </div>

        {/* Files List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Files</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-md p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <p className="text-gray-600 text-center flex items-center justify-center gap-2">
              <FiFile className="w-5 h-5" />
              No files uploaded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {files.map((file) => {
                const { icon, fileType } = getFileIcon(file.fileName);
                return (
                  <div
                    key={file._id}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition duration-300 transform hover:-translate-y-1 relative file-card"
                    style={{ '--file-type': `"${fileType}"` }}
                  >
                    <div className="flex items-center gap-3">
                      {icon}
                      <p className="text-gray-800 font-medium">{file.fileName}</p>
                    </div>
                    {file.description && (
                      <p className="text-gray-600 text-sm mt-2" title={file.description}>
                        <span className="font-semibold">Description:</span>{' '}
                        {truncateDescription(file.description)}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mt-1">
                      Downloads: {file.downloadCount}/{file.downloadLimit} | Expires:{' '}
                      {new Date(file.expiresAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Shareable Link:{' '}
                      <a
                        href={`http://localhost:5173/download/${file._id}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        http://localhost:5173/download/{file._id}
                      </a>
                    </p>
                    <button
                      onClick={() => navigate(`/share/${file._id}`)}
                      className="mt-3 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105"
                    >
                      <FiMail className="w-5 h-5" />
                      Share via Email
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-center mt-6 animate-pulse flex items-center justify-center gap-2">
            <FiAlertTriangle className="w-5 h-5" />
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105"
          >
            <FiUpload className="w-5 h-5" />
            Upload New File
          </button>
        </div>
      </div>

      {/* Tailwind Animation Classes and Watermark Styling */}
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
        .file-card {
          position: relative;
          overflow: hidden;
        }
        .file-card::before {
          content: var(--file-type);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 3rem;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.1);
          pointer-events: none;
          text-transform: uppercase;
          z-index: 0;
        }
        .file-card > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
