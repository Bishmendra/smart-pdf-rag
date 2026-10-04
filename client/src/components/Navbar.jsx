import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">S</span>
          <span>
            Smart<span>RAG</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>

          <a href="/#about" className="nav-link">
            About
          </a>

          <a href="/#contact" className="nav-link">
            Contact
          </a>
        </div>

        {/* User */}
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              U
            </div>

            <span>User</span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;