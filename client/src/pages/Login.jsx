import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
      const response = await API.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

       navigate("/");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
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
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">
          Sign in to your SmartRAG account
        </p>

        {message && (
          <p className="message error-message">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>

      <div className="auth-floating-dot dot-one" />
      <div className="auth-floating-dot dot-two" />
      <div className="auth-floating-dot dot-three" />
      <div className="auth-floating-dot dot-four" />
    </div>
  );
}

export default Login;