import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiFileText, FiUser, FiClock, FiSearch } from 'react-icons/fi';

function Explore() {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`/api/files/explore`);
        setFiles(res.data);
        setFilteredFiles(res.data); // Initialize filteredFiles with all files
      } catch (err) {
        setError('Failed to load public files');
      }
    };
    fetchFiles();
  }, []);

  // Handle search input change
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchEmail(searchTerm);

    // Filter files based on email
    const filtered = files.filter((file) =>
      file.userId?.email.toLowerCase().includes(searchTerm)
    );
    setFilteredFiles(filtered);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        <FiFileText className="w-6 h-6" /> Publicly Shared Files
      </h2>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by uploader's email..."
            value={searchEmail}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-6">
        {filteredFiles.length === 0 && <p>No public files found.</p>}

        {filteredFiles.map((file) => (
          <div key={file._id} className="bg-white shadow-md rounded-lg p-5 border hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600 break-all">{file.fileName}</h3>
            {file.description && <p className="text-gray-700 mb-2">{file.description}</p>}
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              Uploaded by: <span className="font-medium">{file.userId?.email}</span>
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              Expires: {new Date(file.expiresAt).toLocaleString()}
            </p>
            <a
              href={`/download/${file._id}`}
              className="inline-block mt-3 text-blue-600 hover:underline font-medium"
            >
              View / Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Explore;
