import PdfDropzone from "./PdfDropzone";

const Hero = () => {

  const scrollToUpload = () => {
    document
      .getElementById("pdf-upload")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  return (
    <section className="hero-section">

      <div className="hero-content">

        <span className="hero-badge">
          AI Powered Document Learning
        </span>


        <h1>
          Turn Your PDFs
          <br />
          Into Knowledge
        </h1>


        <p>
          Upload your PDF, ask questions,
          understand your documents, and
          test your knowledge with AI.
        </p>


        <div className="hero-actions">

          <button
            className="primary-button"
            onClick={scrollToUpload}
          >
            Upload Your PDF
          </button>

        </div>


        <PdfDropzone />

      </div>

    </section>
  );
};

export default Hero;