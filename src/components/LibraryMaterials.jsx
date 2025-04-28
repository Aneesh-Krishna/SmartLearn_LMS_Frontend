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
  // const [uploaderIdFilter, setUploaderIdFilter] = useState('');
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
        // setMaterials((prev) => [...prev, newMaterial]);
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
        // setMaterials((prev) => prev.filter((m) => m.libraryMaterialUploadId !== materialId));
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
              onChange={(e) => {
                setFilterStatus(e.target.value);
                if (e.target.value === "accepted") {
                  fetchMaterials();
                }
                else {
                  fetchUploadPendingMaterials();
                }
              }}
            >
              <option value="accepted" onClick={fetchMaterials}>Accepted</option>
              <option value="pending" onClick={fetchUploadPendingMaterials}>Pending</option>
            </select>
          </div>

          {/* {isApplicationAdmin && (
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
          )} */}

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

      {!loading && materials?.length > 0 && (
        <RecommendedMaterials authToken={authToken} />
      )}

      {loading ? (
        <div className="loading-animation">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      ) : materials?.length > 0 ? (
        <div className="materials-grid">
          {materials?.map((material, index) => (
            <div key={material.libraryMaterialUploadId} className="material-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="material-cover">
                <FileText size={48} />
                <h3>{material.libraryMaterialUploadName}</h3>
                <p>Uploaded by: {material.uploader || 'Unknown'}</p>
                <span
                  className={`status ${material.acceptedOrRejected
                    ? material.acceptedOrRejected.toLowerCase()
                    : 'pending'
                    }`}
                >
                  {filterStatus === "accepted" ? 'Accepted' : 'Pending'}
                </span>
              </div>
              <div className="material-actions">
                <button
                  className="action-button download"
                  onClick={() =>
                    handleDownload(
                      material.libraryMaterialUploadId,
                      material.libraryMaterialUploadUrl,
                      material.libraryMaterialUploadName
                    )
                  }
                  title="Download"
                >
                  <Download size={20} />
                </button>
                {isApplicationAdmin && material.acceptedOrRejected === '' && (
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
              {/* Category dropdown as a separate section */}
              <div className="category-selection mb-4">
                <label htmlFor="category-select" className="form-label">Select Category</label>
                <select
                  id="category-select"
                  className="form-select"
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

              {/* Upload area as a separate section with position relative */}
              <div className="upload-area position-relative">
                <Upload size={40} color="#2E7D32" />
                <p>Drag & Drop or Click to Upload</p>
                <p>Supported formats: PDF, DOCX, PPTX</p>
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
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 1
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  console.log('Cancel upload'); // Debug
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