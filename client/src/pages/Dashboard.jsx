import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import PdfUpload from "../components/PdfUpload";


function Dashboard() {

  const navigate =
    useNavigate();


  const user =
    JSON.parse(
      localStorage.getItem("user")
    );


  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  // ===============================
  // GET USER DOCUMENTS
  // ===============================

  const fetchDocuments =
    async () => {

      try {

        const response =
          await API.get(
            "/documents"
          );

        setDocuments(
          response.data.documents
        );

      } catch (error) {

        console.error(
          "Failed to fetch documents:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


  // Load documents
  // when dashboard opens

  useEffect(() => {

    fetchDocuments();

  }, []);


  // ===============================
  // AFTER UPLOAD
  // ===============================

  const handleUploadSuccess =
    (document) => {

      setDocuments(
        (previousDocuments) => [
          document,
          ...previousDocuments,
        ]
      );

    };


  // ===============================
  // LOGOUT
  // ===============================

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");

  };


  return (

    <div className="dashboard">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>

          <h1>
            Smart PDF RAG
          </h1>

          <p>
            Welcome,{" "}
            {user?.name || "User"}
          </p>

        </div>


        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>


      {/* CONTENT */}

      <main className="dashboard-content">

        <PdfUpload
          onUploadSuccess={
            handleUploadSuccess
          }
        />


        {/* DOCUMENT LIST */}

        <div className="documents-section">

          <h2>
            Your Documents
          </h2>


          {loading ? (

            <p>
              Loading documents...
            </p>

          ) : documents.length === 0 ? (

            <p>
              No documents uploaded yet.
            </p>

          ) : (

            <div className="document-list">

              {documents.map(
                (document) => (

                  <div
                    className="document-item"
                    key={document.id}
                  >

                    <div>

                      <strong>
                        📄{" "}
                        {document.original_name}
                      </strong>

                      <p>
                        Status:{" "}
                        {document.status}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </main>

    </div>

  );
}


export default Dashboard;