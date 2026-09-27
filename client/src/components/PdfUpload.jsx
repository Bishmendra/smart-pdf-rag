import { useState } from "react";
import API from "../services/api";

function PdfUpload({ onUploadSuccess }) {

  const [file, setFile] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ===============================
  // FILE SELECTION
  // ===============================

  const handleFileChange = (e) => {

    const selectedFile =
      e.target.files[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }


    // Check file type

    if (
      selectedFile.type !==
      "application/pdf"
    ) {

      setError(
        "Please select a PDF file."
      );

      setFile(null);

      return;
    }


    // Check file size

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {

      setError(
        "PDF size must be less than 10 MB."
      );

      setFile(null);

      return;
    }


    setFile(selectedFile);

  };


  // ===============================
  // UPLOAD PDF
  // ===============================

  const handleUpload = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");


    if (!file) {

      setError(
        "Please select a PDF first."
      );

      return;
    }


    const formData =
      new FormData();

    formData.append(
      "pdf",
      file
    );


    setLoading(true);


    try {

      const response =
        await API.post(
          "/documents/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );


      setMessage(
        response.data.message
      );


      // Tell parent component
      // that upload succeeded

      if (onUploadSuccess) {

        onUploadSuccess(
          response.data.document
        );

      }


      // Reset file

      setFile(null);

      document.getElementById(
        "pdf-input"
      ).value = "";


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

    <div className="upload-card">

      <h2>
        Upload Your PDF
      </h2>


      <p className="upload-description">
        Upload a PDF to chat with
        its content.
      </p>


      <form
        onSubmit={handleUpload}
      >

        <input
          id="pdf-input"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
        />


        {file && (

          <p className="selected-file">

            Selected:
            {" "}
            <strong>
              {file.name}
            </strong>

          </p>

        )}


        {error && (

          <p className="upload-error">
            {error}
          </p>

        )}


        {message && (

          <p className="upload-success">
            {message}
          </p>

        )}


        <button
          type="submit"
          disabled={
            loading || !file
          }
        >

          {loading
            ? "Uploading..."
            : "Upload PDF"}

        </button>

      </form>

    </div>

  );
}

export default PdfUpload;