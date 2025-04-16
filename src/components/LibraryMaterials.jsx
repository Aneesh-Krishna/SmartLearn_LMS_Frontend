import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Upload,
  FileText,
  Search,
  Filter,
  Check,
  X,
  Download,
  SortAsc,
  ChevronDown,
} from 'lucide-react';
import '../styles/LibraryMaterials.css';

function LibraryMaterials({ authToken }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploaderIdFilter, setUploaderIdFilter] = useState('');
  const [file, setFile] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMaterials();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    try {
      const decodedToken = jwtDecode(authToken);
      setIsAdmin(decodedToken.role === 'Admin');
    } catch (err) {
      setError('Failed to verify admin status');
      setIsAdmin(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5116/api/LibraryMaterial', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch materials: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialsByUploader = async () => {
    if (!uploaderIdFilter) {
      setError('Please enter an uploader ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:5116/api/LibraryMaterial/${uploaderIdFilter}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setMaterials(Array.isArray(data) ? data : []);
      setSuccess(`Showing materials for uploader ${uploaderIdFilter}`);
    } catch (error) {
      setError('Failed to fetch materials: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await fetch('http://localhost:5116/api/LibraryMaterial/upload-library-material', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const newMaterial = await response.json();
      setMaterials((prev) => [...prev, newMaterial]);
      setSuccess('Material uploaded successfully!');
      setFile(null);
      setUploadModalOpen(false);
    } catch (error) {
      setError('Failed to upload material: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (materialId) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:5116/api/LibraryMaterial/${materialId}/Accept`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setSuccess('Material accepted!');
      fetchMaterials();
    } catch (error) {
      setError('Failed to accept material: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (materialId) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:5116/api/LibraryMaterial/${materialId}/Reject`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setSuccess('Material rejected!');
      setMaterials((prev) => prev.filter((m) => m.libraryMaterialUploadId !== materialId));
    } catch (error) {
      setError('Failed to reject material: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialUrl, fileName) => {
    try {
      const response = await fetch(materialUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download material: ' + error.message);
    }
  };

  const handleSort = (type) => {
    setSortBy(type);
    const sortedMaterials = [...materials].sort((a, b) => {
      if (type === 'name') {
        return a.libraryMaterialUploadName.localeCompare(b.libraryMaterialUploadName);
      } else if (type === 'uploader') {
        return a.uploader.localeCompare(b.uploader);
      }
      return 0;
    });
    setMaterials(sortedMaterials);
    setIsSortDropdownOpen(false);
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.libraryMaterialUploadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.uploader.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'accepted' && material.acceptedOrRejected === 'Accepted') ||
      (filterStatus === 'pending' && material.acceptedOrRejected === '');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="library-materials-container">
      <div className="library-header">
        <h1>Library Materials</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <Filter size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="accepted">Accepted</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {isAdmin && (
            <div className="uploader-filter">
              <Filter size={20} />
              <input
                type="text"
                placeholder="Filter by Uploader ID"
                value={uploaderIdFilter}
                onChange={(e) => setUploaderIdFilter(e.target.value)}
              />
              <button onClick={fetchMaterialsByUploader} disabled={loading}>
                Apply
              </button>
              <button onClick={() => { setUploaderIdFilter(''); fetchMaterials(); }} disabled={loading}>
                Clear
              </button>
            </div>
          )}

          <div className="sort-dropdown">
            <button
              className="sort-button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            >
              <SortAsc size={20} />
              <span>Sort</span>
              <ChevronDown size={16} />
            </button>
            {isSortDropdownOpen && (
              <div className="sort-menu">
                <button onClick={() => handleSort('name')}>
                  Sort by Name
                </button>
                <button onClick={() => handleSort('uploader')}>
                  Sort by Uploader
                </button>
              </div>
            )}
          </div>

          <button
            className="upload-button"
            onClick={() => {
              console.log('Opening upload modal'); // Debug
              setUploadModalOpen(true);
              setError('');
              setSuccess('');
              setFile(null);
            }}
            disabled={loading}
          >
            <Upload size={20} />
            Upload Material
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {loading ? (
        <div className="loading-animation">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="materials-grid">
          {filteredMaterials.map((material, index) => (
            <div key={material.libraryMaterialUploadId} className="material-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="material-icon">
                <FileText size={24} />
              </div>
              <div className="material-info">
                <h3>{material.libraryMaterialUploadName}</h3>
                <p>Uploaded by: {material.uploader || 'Unknown'}</p>
                <span
                  className={`status ${
                    material.acceptedOrRejected
                      ? material.acceptedOrRejected.toLowerCase()
                      : 'pending'
                  }`}
                >
                  {material.acceptedOrRejected || 'Pending'}
                </span>
              </div>
              <div className="material-actions">
                <button
                  className="action-button download"
                  onClick={() =>
                    handleDownload(
                      material.libraryMaterialUploadUrl,
                      material.libraryMaterialUploadName
                    )
                  }
                  title="Download"
                >
                  <Download size={20} />
                </button>
                {isAdmin && material.acceptedOrRejected === '' && (
                  <>
                    <button
                      className="action-button accept"
                      onClick={() => handleAccept(material.libraryMaterialUploadId)}
                      title="Accept"
                      disabled={loading}
                    >
                      <Check size={20} />
                    </button>
                    <button
                      className="action-button reject"
                      onClick={() => handleReject(material.libraryMaterialUploadId)}
                      title="Reject"
                      disabled={loading}
                    >
                      <X size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-materials">
          <FileText size={48} />
          <p>No materials found</p>
        </div>
      )}

      {uploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Upload Material</h2>
              <button
                className="close-button"
                onClick={() => {
                  console.log('Closing upload modal'); // Debug
                  setUploadModalOpen(false);
                  setFile(null);
                  setError('');
                  setSuccess('');
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}
              <input
                type="file"
                onChange={(e) => {
                  console.log('File selected:', e.target.files[0]); // Debug
                  setFile(e.target.files[0]);
                  setError('');
                  setSuccess('');
                }}
                className="file-input"
                disabled={loading}
              />
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  console.log('Cancel upload'); // Debug
                  setUploadModalOpen(false);
                  setFile(null);
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="upload-button"
                onClick={() => {
                  console.log('Attempting upload'); // Debug
                  handleUpload();
                }}
                disabled={!file || loading}
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryMaterials;