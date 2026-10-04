import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const PdfDropzone = () => {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (selectedFile) => {
    setError("");

    if (!selectedFile) {
      return false;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("PDF size must be less than 10 MB.");
      return false;
    }

    return true;
  };

  const handleFile = (selectedFile) => {
    if (!validateFile(selectedFile)) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];

    handleFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      inputRef.current?.click();
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();

    formData.append("pdf", file);

    try {
      await API.post(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      /*
       * Upload succeeded.
       *
       * The PDF is uploaded but not processed yet.
       * Dashboard will allow the user to process it.
       */

      navigate("/dashboard");

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "PDF upload failed."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-upload-wrapper">

      <div
        id="pdf-upload"
        className={`pdf-dropzone ${
          dragging ? "dragging" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >

        <input
          ref={inputRef}
          id="home-pdf-input"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          hidden
        />

        <div className="upload-icon">
          ↑
        </div>

        {file ? (
          <>
            <h3>
              PDF Selected
            </h3>

            <p className="selected-file-home">
              {file.name}
            </p>

            <span>
              Click to choose another file
            </span>
          </>
        ) : (
          <>
            <h3>
              Drag & Drop your PDF here
            </h3>

            <p>
              or click to browse your files
            </p>

            <span>
              PDF files only • Maximum 10 MB
            </span>
          </>
        )}

      </div>


      {error && (
        <p className="home-upload-error">
          {error}
        </p>
      )}


      <button
        className="home-upload-button"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading
          ? "Uploading..."
          : file
          ? "Upload PDF"
          : "Choose PDF"}
      </button>

    </div>
  );
};

export default PdfDropzone;