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

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5116/api/material/${courseId}/UploadMaterial`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        setFile(null);
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error uploading material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialUrl) => {
    try {
      const response = await fetch(materialUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = materialUrl.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading material:', error);
    }
  };

  const handleDelete = async (materialId) => {
    try {
      const response = await fetch(`http://localhost:5116/api/material/${materialId}/DeleteMaterial`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  return (
    <div className="materials-container">
      <div className="materials-header">
        <h1>
          <NavLink to="/courseDetails" className="back-button">
            <span className="back-icon">◄</span> Back
          </NavLink>
          Course Materials
        </h1>
        {isAdmin && (
          <button
            className="upload-button"
            data-bs-toggle="modal"
            data-bs-target="#uploadMaterialModal"
          >
            Upload Material
          </button>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                </div>
                <h3 className="material-name">{material.materialName}</h3>
              </div>
              <div className="material-actions">
                <button
                  className="action-button download-button"
                  onClick={() => handleDownload(material.materialUrl)}
                >
                  Download
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
                    Delete
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
          <div className="modal-content upload-modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Upload Material</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="upload-area">
                <input
                  type="file"
                  className="form-control upload-input"
                  onChange={(e) => setFile(e.target.files[0])}
                  id="fileUpload"
                />
                <label htmlFor="fileUpload" className="upload-label">
                  <span className="upload-icon">📤</span>
                  <p className="upload-text">Drag & Drop or Click to Upload</p>
                  <p className="upload-hint">Supported formats: PDF, DOCX, PPTX</p>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary cancel-btn" data-bs-dismiss="modal">Cancel</button>
              <button
                className="btn btn-primary upload-submit"
                onClick={handleFileUpload}
                data-bs-dismiss="modal"
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