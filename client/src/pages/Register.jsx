import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await API.post(
        "/auth/register",
        formData
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-stars" />
      <div className="auth-network auth-network-left" />
      <div className="auth-network auth-network-right" />
      <div className="auth-mountains" />

      <div className="auth-brand">
        <div className="auth-brand-mark">⌁</div>
        {/* <h1>
          Smart<span>RAG</span>
        </h1> */}
        {/* <p>Smarter Document Search&nbsp; • &nbsp;Powered by AI</p> */}
      </div>

      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">
          Start learning from your documents with AI
        </p>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <span className="auth-field-icon">♙</span>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <span className="auth-field-icon">✉</span>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field password-field">
            <span className="auth-field-icon">♙</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="show-password-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>

      <div className="auth-floating-dot dot-one" />
      <div className="auth-floating-dot dot-two" />
      <div className="auth-floating-dot dot-three" />
      <div className="auth-floating-dot dot-four" />
    </div>
  );
}

export default Register;