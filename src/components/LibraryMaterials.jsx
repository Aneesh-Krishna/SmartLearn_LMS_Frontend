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
import RecommendedMaterials from './RecommendedMaterials';

function LibraryMaterials({ authToken }) {
  const [materials, setMaterials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isApplicationAdmin, setIsApplicationAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('accepted');
  const [file, setFile] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(null);
  const Categories = [
    "Science",
    "Mathematics",
    "Commerce",
    "Arts",
    "Fantasy",
    "Thriller",
    "Crime",
    "Suspense",
    "Fiction",
    "Kids",
    "Biography",
    "Business",
    "Health",
    "Cooking",
    "Horror",
    "Romance",
    "Social_Science",
    "Travel",
    "Sports",
    "Agriculture",
    "Self_Help"
  ];

  var filteredMaterials = [];

  useEffect(() => {
    fetchMaterials();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (filterStatus === "accepted") {
      fetchMaterials();
    }
    else if (filterStatus === "pending") {
      fetchUploadPendingMaterials();
    }
  }, [filterStatus]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5116/api/account/isAdmin`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
      });

      if (response.ok) {
        setIsApplicationAdmin(true);
      }
      else {
        setIsApplicationAdmin(false);
        console.log("An error occured while checking whether the user is admin...", response.text);
      }
    }
    catch (err) {
      setIsApplicationAdmin(false);
      console.error("Something went wrong...", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');

      setMaterials(null);

      const response = await fetch('http://localhost:5116/api/LibraryMaterial', {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data.$values || []);
      }
      else {
        console.log("An error occured while fetching the materials...", response.text);
      }
    }
    catch (error) {
      setError('Failed to fetch materials: ' + error.message);
      console.error("Something went wrong while fetching the courses...", error);
    }
    finally {
      setLoading(false);
    }
  };

  const fetchUploadPendingMaterials = async () => {
    try {
      setLoading(true);
      setMaterials(null);

      const response = await fetch(`http://localhost:5116/api/LibraryMaterial/getUploadPendingMaterials`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data.$values || []);
      }
      else {
        console.log("An error occured while fetching upload pending materials...", response.text);
      }
    }
    catch (error) {
      console.error("Something went wrong while fetching upload pending materials...", error);
    }
    finally {
      setLoading(false);
    }
  }

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
      console.log(selectedCategory);
      console.log(file);
      const response = await fetch(`http://localhost:5116/api/LibraryMaterial/${selectedCategory}/upload-library-material`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newMaterial = await response.json();
        fetchMaterials();
        setSuccess('Material uploaded successfully!');
        setFile(null);
        setUploadModalOpen(false);
      }
      else {
        console.log("An error occured while uploading the material...", response.text);
      }
    }
    catch (error) {
      setError('Failed to upload material: ' + error.message);
      console.error("Something went wrong while uploading the material...", error);
    }
    finally {
      setSelectedCategory(null);
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

      if (response.ok) {
        setSuccess('Material accepted!');
        fetchUploadPendingMaterials();
      }
      else {
        console.log("An error occured while accepting the material...", response.text);
      }
    } catch (error) {
      setError('Failed to accept material: ' + error.message);
      console.error("Something went wrong while accepting the materiall...", error);
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

      if (response.ok) {
        setSuccess('Material rejected!');
        fetchUploadPendingMaterials();
      }
      else {
        console.log("An error occured while rejecting the material...", response.text);
      }
    }
    catch (error) {
      setError('Failed to reject material: ' + error.message);
      console.error("Something went wrong while rejecting the material...", error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleDownload = async (libraryMaterialUploadId, materialUrl, fileName) => {
    try {
      const downloadHistoryResponse = await fetch(`http://localhost:5116/api/LibraryMaterial/${libraryMaterialUploadId}/downloadLibraryMaterialId`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!downloadHistoryResponse.ok) {
        console.error("Ann error occured while saving the download history...", downloadHistoryResponse.text);
        return;
      }

      const response = await fetch(`http://localhost:5116/api/file/${fileName}`, {
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

  return (
    <div className="gc-library-materials-container">
      <div className="gc-library-header">
        <h1>Library Materials</h1>
        <div className="gc-header-actions">
          <div className="gc-search-bar">
            {/* <Search size={20} className="gc-search-icon" /> */}
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="gc-filter-dropdown">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                if (e.target.value === "accepted") {
                  fetchMaterials();
                }
                else {
                  fetchUploadPendingMaterials();
                }
              }}
              className="gc-filter-select"
            >
              <option value="accepted">Accepted</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="gc-sort-dropdown">
            <button
              className="gc-sort-button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            >
              <SortAsc size={18} />
              <span>Sort</span>
              <ChevronDown size={16} />
            </button>
            {isSortDropdownOpen && (
              <div className="gc-sort-menu">
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
            className="gc-upload-button"
            onClick={() => {
              setUploadModalOpen(true);
              setError('');
              setSuccess('');
              setFile(null);
            }}
            disabled={loading}
          >
            <span className="gc-button-icon"><Upload size={18} /></span>
            Upload Material
          </button>
        </div>
      </div>

      {error && <div className="gc-error-message">{error}</div>}
      {success && <div className="gc-success-message">{success}</div>}

      {!loading && materials?.length > 0 && (
        <RecommendedMaterials authToken={authToken} />
      )}

      {loading ? (
        <div className="gc-loading-container">
          <div className="gc-loading-spinner"></div>
        </div>
      ) : materials?.length > 0 ? (
        <div className="gc-materials-grid">
          {materials?.map((material, index) => (
            <div key={material.libraryMaterialUploadId} className="gc-material-card">
              <div className="gc-material-icon">
                <FileText size={36} className="gc-file-icon" />
              </div>
              <div className="gc-material-content">
                <h3 className="gc-material-title">{material.libraryMaterialUploadName}</h3>
                <p className="gc-material-uploader">Uploaded by: {material.uploader || 'Unknown'}</p>
                <span
                  className={`gc-status gc-status-${material.acceptedOrRejected
                    ? material.acceptedOrRejected.toLowerCase()
                    : 'pending'
                    }`}
                >
                  {filterStatus === "accepted" ? 'Accepted' : 'Pending'}
                </span>
              </div>
              <div className="gc-material-actions">
                <button
                  className="gc-action-button gc-download-btn"
                  onClick={() =>
                    handleDownload(
                      material.libraryMaterialUploadId,
                      material.libraryMaterialUploadUrl,
                      material.libraryMaterialUploadName
                    )
                  }
                  title="Download"
                >
                  <Download size={18} />
                </button>
                {isApplicationAdmin && material.acceptedOrRejected === '' && (
                  <>
                    <button
                      className="gc-action-button gc-accept-btn"
                      onClick={() => handleAccept(material.libraryMaterialUploadId)}
                      title="Accept"
                      disabled={loading}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      className="gc-action-button gc-reject-btn"
                      onClick={() => handleReject(material.libraryMaterialUploadId)}
                      title="Reject"
                      disabled={loading}
                    >
                      <X size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="gc-no-materials">
          <FileText size={48} className="gc-empty-icon" />
          <p>No materials found</p>
        </div>
      )}

      {uploadModalOpen && (
        <div className="gc-modal-overlay">
          <div className="gc-modal">
            <div className="gc-modal-header">
              <h2>Upload Material</h2>
              <button
                className="gc-close-button"
                onClick={() => {
                  setUploadModalOpen(false);
                  setFile(null);
                  setError('');
                  setSuccess('');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="gc-modal-body">
              <div className="gc-category-selection">
                <label htmlFor="category-select" className="gc-form-label">Select Category</label>
                <select
                  id="category-select"
                  className="gc-form-select"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  value={selectedCategory || ''}
                  disabled={loading}
                >
                  <option value="">-- Select a Category --</option>
                  {Categories.map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gc-upload-area">
                <Upload size={36} color="#1a73e8" />
                <p className="gc-upload-text">Drag & Drop or Click to Upload</p>
                <p className="gc-upload-formats">Supported formats: PDF, DOCX, PPTX</p>
                <input
                  type="file"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setError('');
                    setSuccess('');
                  }}
                  className="gc-file-input"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="gc-modal-footer">
              <button
                className="gc-cancel-button"
                onClick={() => {
                  setUploadModalOpen(false);
                  setFile(null);
                  setSelectedCategory(null);
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="gc-upload-confirm-button"
                onClick={handleUpload}
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