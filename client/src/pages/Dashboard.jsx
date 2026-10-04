import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PdfUpload from "../components/PdfUpload";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      const response = await API.get("/documents");

      setDocuments(
        response.data.documents || []
      );

    } catch (error) {
      console.error(
        "Failed to load documents:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = () => {
    fetchDocuments();
    setShowUpload(false);
  };

  const handleProcess = async (documentId) => {
    if (processingId) return;

    try {
      setProcessingId(documentId);

      await API.post(
        `/documents/${documentId}/process`
      );

      await fetchDocuments();

    } catch (error) {
      console.error(
        "Processing Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to process PDF"
      );

    } finally {
      setProcessingId(null);
    }
  };

  const openChat = (documentId) => {
    navigate(`/chat/${documentId}`);
  };

  const processedCount = documents.filter(
    (document) =>
      document.status === "processed"
  ).length;

  return (
    <div className="dashboard-page">

      <Navbar />

      <main className="dashboard-main">

        {/* =========================
            HEADER
        ========================= */}

        <section className="dashboard-heading">

          <div>

            <span className="dashboard-eyebrow">
              YOUR WORKSPACE
            </span>

            <h1>
              Your Documents
            </h1>

            <p>
              Manage, chat with, and learn
              from your PDF documents.
            </p>

          </div>

          <button
            className="dashboard-upload-button"
            onClick={() =>
              setShowUpload(!showUpload)
            }
          >
            <span>+</span>
            Upload PDF
          </button>

        </section>


        {/* =========================
            STATISTICS
        ========================= */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-icon">
              📚
            </div>

            <div>
              <span>
                Total PDFs
              </span>

              <strong>
                {documents.length}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>
              <span>
                Processed
              </span>

              <strong>
                {processedCount}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ✦
            </div>

            <div>
              <span>
                AI Learning
              </span>

              <strong>
                Chat + Quiz
              </strong>
            </div>

          </div>

        </section>


        {/* =========================
            UPLOAD PANEL
        ========================= */}

        {showUpload && (

          <section className="dashboard-upload-panel">

            <div className="upload-panel-header">

              <div>

                <h2>
                  Upload a new PDF
                </h2>

                <p>
                  Add a document to your
                  SmartRAG workspace.
                </p>

              </div>

              <button
                className="close-upload"
                onClick={() =>
                  setShowUpload(false)
                }
              >
                ×
              </button>

            </div>

            <PdfUpload
              onUploadSuccess={
                handleUploadSuccess
              }
            />

          </section>

        )}


        {/* =========================
            DOCUMENTS
        ========================= */}

        <section className="documents-section">

          <div className="documents-section-header">

            <div>

              <h2>
                Your PDF Library
              </h2>

              <p>
                {documents.length === 0
                  ? "No documents uploaded yet."
                  : `${documents.length} document${
                      documents.length === 1
                        ? ""
                        : "s"
                    } in your library`}
              </p>

            </div>

            <button
              className="refresh-button"
              onClick={fetchDocuments}
            >
              ↻ Refresh
            </button>

          </div>


          {/* Loading */}

          {loading ? (

            <div className="dashboard-empty">

              <div className="loading-spinner">
                <div></div>
              </div>

              <p>
                Loading your documents...
              </p>

            </div>

          ) : documents.length === 0 ? (

            /* Empty */

            <div className="dashboard-empty">

              <div className="empty-document-icon">
                📄
              </div>

              <h3>
                No documents yet
              </h3>

              <p>
                Upload your first PDF to
                start learning with AI.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  setShowUpload(true)
                }
              >
                Upload Your First PDF
              </button>

            </div>

          ) : (

            /* Documents */

            <div className="document-grid">

              {documents.map((document) => {

                const isProcessing =
                  processingId ===
                  document.id;

                return (

                  <article
                    key={document.id}
                    className="document-card-new"
                  >

                    <div className="document-card-top">

                      <div className="document-file-icon">
                        PDF
                      </div>

                      <span
                        className={`document-status status-${document.status}`}
                      >
                        <span className="status-dot"></span>

                        {isProcessing
                          ? "Processing..."
                          : document.status}
                      </span>

                    </div>


                    <div className="document-card-content">

                      <h3>
                        {document.original_name}
                      </h3>

                      <p className="document-date">
                        Uploaded{" "}
                        {new Date(
                          document.created_at
                        ).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>

                    </div>


                    <div className="document-card-actions">

                      {document.status ===
                        "uploaded" && (

                        <button
                          className="document-primary-action"
                          onClick={() =>
                            handleProcess(
                              document.id
                            )
                          }
                          disabled={
                            isProcessing
                          }
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Process PDF"}
                        </button>

                      )}


                      {document.status ===
                        "processed" && (
                        <>
                          <button
                            className="document-primary-action"
                            onClick={() =>
                              openChat(
                                document.id
                              )
                            }
                          >
                            Chat with PDF
                          </button>

                          <button
                            className="document-quiz-action"
                            onClick={() =>
                              navigate(
                                `/quiz/${document.id}`
                              )
                            }
                          >
                            Generate Quiz
                          </button>
                        </>
                      )}


                      {document.status ===
                        "failed" && (

                        <button
                          className="document-primary-action"
                          onClick={() =>
                            handleProcess(
                              document.id
                            )
                          }
                        >
                          Retry Processing
                        </button>

                      )}

                    </div>

                  </article>

                );
              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default Dashboard;