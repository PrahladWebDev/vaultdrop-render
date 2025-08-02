import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiFileText, FiUser, FiClock } from 'react-icons/fi';

function Explore() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`/api/files/explore`);
        setFiles(res.data);
      } catch (err) {
        setError('Failed to load public files');
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        <FiFileText className="w-6 h-6" /> Publicly Shared Files
      </h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-6">
        {files.length === 0 && <p>No public files found.</p>}

        {files.map((file) => (
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


