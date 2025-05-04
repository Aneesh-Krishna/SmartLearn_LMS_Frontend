import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/MaterialsPage.css';

function MaterialsPage({ courseId, authToken, adminId }) {
  const [materials, setMaterials] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteMaterialName, setDeleteMaterialName] = useState('');
  const [deleteMaterialId, setDeleteMaterialId] = useState(null);
  const [fileName, setFileName] = useState('No file selected');

  useEffect(() => {
    fetchMaterials();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    const decodedToken = jwtDecode(authToken);
    setIsAdmin(adminId === decodedToken.sub);
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch(`http://localhost:5116/api/material/${courseId}/GetMaterials`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data.$values || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:5116/api/material/${courseId}/UploadMaterial`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        setFile(null);
        setFileName('No file selected');
        fetchMaterials();

        // Close modal
        const modalElement = document.getElementById('uploadMaterialModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) {
            modalInstance.hide();
          }
        }
      } else {
        setFile(null);
        setFileName('No file selected');
        alert('Failed to upload material');
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Error uploading material');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialName) => {
    try {
      const response = await fetch(`http://localhost:5116/api/file/${materialName}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = materialName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading material:', error);
      alert('Error downloading file');
    }
  };

  const handleDelete = async (materialId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5116/api/material/${materialId}/DeleteMaterial`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        fetchMaterials();
      } else {
        alert('Failed to delete material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Error deleting material');
    } finally {
      setLoading(false);
      setDeleteMaterialId(null);
      setDeleteMaterialName('');
    }
  };

  // Function to get file type icon
  const getFileIcon = (fileName) => {
    if (!fileName) return null;

    const extension = fileName.split('.').pop().toLowerCase();

    // PDF icon
    if (extension === 'pdf') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path d="M14 2v6h6"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
          <path d="M10 9H8"></path>
        </svg>
      );
    }

    // Image icon
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      );
    }

    // Document icon
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    }

    // Spreadsheet icon
    if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
      );
    }

    // Default file icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
    );
  };

  return (
    <div className="materials-container">
      <div className="materials-header">
        {/* <h1>
          <NavLink to="/courseDetails" className="btn-outline-primary">
            ◄ Back
          </NavLink>
          Course Materials
        </h1> */}
        {isAdmin && (
          <div className="material-upload">
            <button
              className="upload-button"
              data-bs-toggle="modal"
              data-bs-target="#uploadMaterialModal"
            >
              Upload Material
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-animation">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      ) : materials.length > 0 ? (
        <ul className="materials-list">
          {materials.map((material) => (
            <li key={material.materialId} className="material-item">
              <div className="material-info">
                <div className="material-icon">
                  {getFileIcon(material.materialName)}
                </div>
                <h3 className="material-name">{material.materialName}</h3>
              </div>
              <div className="material-actions">
                <button
                  className="action-button download-button"
                  onClick={() => handleDownload(material.materialName)}
                >
                  <span class="material-icons">download</span>
                </button>
                {isAdmin && (
                  <button
                    className="action-button delete-button"
                    onClick={() => {
                      setDeleteMaterialName(material.materialName);
                      setDeleteMaterialId(material.materialId);
                    }}
                    data-bs-toggle="modal"
                    data-bs-target="#deleteMaterialModal"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-materials">
          No materials available for this course yet.
        </div>
      )}

      {/* Upload Material Modal */}
      <div className="modal fade" id="uploadMaterialModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Upload Material</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Select File</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                />
                <div className="form-text mt-2">
                  {fileName}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleFileUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Material Modal */}
      <div className="modal fade" id="deleteMaterialModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Material</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete <b>{deleteMaterialName}</b>?
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteMaterialId)}
                data-bs-dismiss="modal"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialsPage;