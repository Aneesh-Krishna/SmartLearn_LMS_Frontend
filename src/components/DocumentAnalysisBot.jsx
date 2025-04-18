import React, { useState } from "react";

function DocumentAnalysisBot() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setUploadStatus("");
        setAnswer("");
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus("Please select a PDF file.");
            return;
        }

        setIsLoading(true);
        setUploadStatus("Uploading...");

        const formData = new FormData();
        formData.append("pdf_file", selectedFile);

        try {
            const response = await fetch("http://localhost:5000/", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setUploadStatus("File uploaded successfully! Now ask a question.");
            } else {
                setUploadStatus("File upload failed. Please try again.");
            }
        } catch (error) {
            setUploadStatus("Error uploading file. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAsk = async () => {
        if (!question.trim()) {
            setAnswer("Please enter a question.");
            return;
        }

        setIsLoading(true);
        setAnswer("Processing your question...");

        const formData = new FormData();
        formData.append("question", question);

        try {
            const response = await fetch("http://localhost:5000/ask", {
                method: "POST",
                body: formData,
            });

            const text = await response.text();
            const data = JSON.parse(text);
            const responseAnswer = data.answer;
            setAnswer(responseAnswer ? responseAnswer : "I couldn't find an answer. Please try a different question.");
        } catch (error) {
            setAnswer("Error retrieving answer. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📄 Document Q&A Bot</h1>
                <p style={styles.subtitle}>Upload a PDF and get answers to your questions</p>
            </div>

            <div style={styles.uploadSection}>
                <label style={styles.fileInputLabel}>
                    Choose PDF
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={styles.fileInput}
                        disabled={isLoading}
                    />
                </label>
                <button
                    onClick={handleUpload}
                    style={styles.button}
                    disabled={isLoading || !selectedFile}
                >
                    {isLoading ? "Uploading..." : "Upload PDF"}
                </button>
                {selectedFile && (
                    <p style={styles.fileName}>{selectedFile.name}</p>
                )}
            </div>

            {uploadStatus && (
                <div style={uploadStatus.includes("successfully") ? styles.successMessage : styles.errorMessage}>
                    {uploadStatus}
                </div>
            )}

            <div style={styles.questionSection}>
                <input
                    type="text"
                    placeholder="Ask a question about the document..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    style={styles.questionInput}
                    disabled={!uploadStatus.includes("successfully") || isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                />
                <button
                    onClick={handleAsk}
                    style={styles.button}
                    disabled={!uploadStatus.includes("successfully") || isLoading || !question.trim()}
                >
                    {isLoading ? "Thinking..." : "Ask"}
                </button>
            </div>

            {answer && (
                <div style={styles.answerSection}>
                    <div style={styles.answerHeader}>Answer</div>
                    <div style={styles.answerText}>
                        {answer.split('\n').map((paragraph, index) => (
                            paragraph.trim() ? (
                                <p key={index} style={styles.answerParagraph}>
                                    {paragraph.split(/(\d+\.\s+\*\*[^*]+\*\*)/g).map((text, i) => {
                                        // Handle numbered points with bold headings
                                        if (text.match(/^\d+\.\s+\*\*[^*]+\*\*$/)) {
                                            return (
                                                <React.Fragment key={i}>
                                                    <br />
                                                    <strong style={styles.pointHeader}>{text.replace(/\*\*/g, '')}</strong>
                                                </React.Fragment>
                                            );
                                        }
                                        // Handle bold text within paragraphs
                                        const parts = text.split(/(\*\*[^*]+\*\*)/g);
                                        return (
                                            <span key={i}>
                                                {parts.map((part, j) =>
                                                    part.startsWith('**') && part.endsWith('**') ? (
                                                        <strong key={j}>{part.slice(2, -2)}</strong>
                                                    ) : (
                                                        part
                                                    )
                                                )}
                                            </span>
                                        );
                                    })}
                                </p>
                            ) : null
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    header: {
        marginBottom: "2rem",
        textAlign: "center",
    },
    title: {
        color: "#2c3e50",
        marginBottom: "0.5rem",
    },
    subtitle: {
        color: "#7f8c8d",
        marginTop: 0,
    },
    uploadSection: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1rem",
        flexWrap: "wrap",
    },
    fileInputLabel: {
        padding: "0.5rem 1rem",
        backgroundColor: "#3498db",
        color: "white",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
    fileInput: {
        display: "none",
    },
    fileName: {
        color: "#7f8c8d",
        fontSize: "0.9rem",
        marginLeft: "1rem",
    },
    button: {
        padding: "0.5rem 1.5rem",
        backgroundColor: "#2ecc71",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
    buttonDisabled: {
        backgroundColor: "#95a5a6",
        cursor: "not-allowed",
    },
    questionSection: {
        display: "flex",
        gap: "1rem",
        marginTop: "2rem",
        marginBottom: "2rem",
    },
    questionInput: {
        flex: 1,
        padding: "0.75rem",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "1rem",
    },
    successMessage: {
        color: "#27ae60",
        padding: "0.5rem",
        marginBottom: "1rem",
    },
    errorMessage: {
        color: "#e74c3c",
        padding: "0.5rem",
        marginBottom: "1rem",
    },
    answerSection: {
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        marginTop: "1rem",
        borderLeft: "4px solid #3498db",
    },
    answerHeader: {
        fontWeight: "bold",
        color: "#2c3e50",
        fontSize: "1.3rem",
        marginBottom: "1rem",
        paddingBottom: "0.5rem",
        borderBottom: "1px solid #eee",
    },
    answerText: {
        lineHeight: "1.7",
        color: "#34495e",
        fontSize: "1rem",
    },
    answerParagraph: {
        marginBottom: "1rem",
        textAlign: "justify",
    },
    pointHeader: {
        display: "inline-block",
        color: "#2c3e50",
        margin: "0.5rem 0",
    },
};

export default DocumentAnalysisBot;