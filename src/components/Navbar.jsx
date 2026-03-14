import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FiShoppingCart, FiLogOut, FiUser, FiPackage, FiGrid, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/login');
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand" onClick={closeMenu}>
                <span className="brand-icon">🛍️</span>
                <span className="brand-text">ShopVerse</span>
            </Link>

            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen ? <FiX /> : <FiMenu />}
            </button>

            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>

                {user ? (
                    <>
                        {user.role === 'BUYER' && (
                            <>
                                <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
                                    <FiShoppingCart /> Cart
                                </Link>
                                <Link to="/wishlist" className="nav-link" onClick={closeMenu}>
                                    <FiHeart /> Wishlist
                                </Link>
                                <Link to="/orders" className="nav-link" onClick={closeMenu}>
                                    <FiPackage /> Orders
                                </Link>
                            </>
                        )}
                        {user.role === 'SELLER' && (
                            <Link to="/seller" className="nav-link" onClick={closeMenu}>
                                <FiGrid /> Dashboard
                            </Link>
                        )}
                        {user.role === 'ADMIN' && (
                            <Link to="/admin" className="nav-link" onClick={closeMenu}>
                                <FiGrid /> Admin
                            </Link>
                        )}
                        <Link to="/profile" className="nav-link" onClick={closeMenu}>
                            <FiUser /> Profile
                        </Link>
                        <div className="nav-user">
                            <span>{user.name}</span>
                            <span className="role-badge">{user.role}</span>
                        </div>
                        <button className="nav-btn logout-btn" onClick={handleLogout}>
                            <FiLogOut /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
                        <Link to="/register" className="nav-btn register-btn" onClick={closeMenu}>Register</Link>
                    </>
                )}
            </div>

            {menuOpen && <div className="navbar-overlay" onClick={closeMenu} />}
        </nav>
    );
}
