import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiPlus, FiUser, FiLogOut, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-logo">
                        <span className="logo-icon">🔍</span>
                        <span className="logo-text">ReFind</span>
                    </Link>

                    <div className="navbar-links">
                        <Link to="/" className="nav-link">
                            <FiSearch />
                            Browse Items
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/post" className="btn btn-primary btn-sm">
                                    <FiPlus />
                                    Post Item
                                </Link>
                                <Link to="/dashboard" className="nav-link">
                                    <FiUser />
                                    Dashboard
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin" className="nav-link nav-link-admin">
                                        <FiSettings />
                                        Admin
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="nav-link nav-link-button">
                                    <FiLogOut />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Login</Link>
                                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
                            </>
                        )}
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                            <FiSearch /> Browse Items
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/post" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    <FiPlus /> Post Item
                                </Link>
                                <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    <FiUser /> Dashboard
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                        <FiSettings /> Admin Panel
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="mobile-nav-link mobile-nav-button">
                                    <FiLogOut /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link to="/signup" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
