import React, { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import '../styles/LibraryMaterials.css';

function RecommendedMaterials({ authToken }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recommendationType, setRecommendationType] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('http://localhost:5116/api/LibraryMaterial/enhanced-recommendations', {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                debugger
                setRecommendationType(data?.recommendationType);
                setRecommendations(data?.recommendations?.$values || []);
            } else {
                console.log("An error occurred while fetching recommendations...", response.text);
                setError('Failed to fetch recommendations');
            }
        } catch (error) {
            setError('Failed to fetch recommendations: ' + error.message);
            console.error("Something went wrong while fetching recommendations...", error);
        } finally {
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
                console.error("An error occurred while saving the download history...", downloadHistoryResponse.text);
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

            // Refresh recommendations after download
            fetchRecommendations();
        } catch (error) {
            setError('Failed to download material: ' + error.message);
        }
    };

    return (
        <div className="recommended-materials-container">
            <div className="recommendations-header">
                {recommendationType === "personalized" ?
                    <h2>Recommended For You</h2>
                    :
                    <h2>Popular</h2>
                }
                {/* <p>Based on your download history</p> */}
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <div className="loading-animation">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                </div>
            ) : recommendations.length > 0 ? (
                <div className="recommendations-carousel">
                    {recommendations.map((material, index) => (
                        <div key={material.libraryMaterialUploadId} className="recommendation-card" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="material-cover">
                                <FileText size={36} />
                                <h3>{material.libraryMaterialUploadName}</h3>
                                <p>Uploaded by: {material.uploader || 'Unknown'}</p>
                                {material.similarityScore && (
                                    <span className="similarity-badge">{Math.round(material.similarityScore * 100)}% match</span>
                                )}
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
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-recommendations">
                    {/* <p>No recommendations available yet. Download materials to get personalized recommendations.</p> */}
                </div>
            )}
        </div>
    );
}

export default RecommendedMaterials;