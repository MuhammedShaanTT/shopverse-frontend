import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FiShoppingCart, FiLogOut, FiUser, FiPackage, FiGrid, FiHeart } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <span className="brand-icon">🛍️</span>
                <span className="brand-text">ShopVerse</span>
            </Link>

            <div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>

                {user ? (
                    <>
                        {user.role === 'BUYER' && (
                            <>
                                <Link to="/cart" className="nav-link cart-link">
                                    <FiShoppingCart /> Cart
                                </Link>
                                <Link to="/wishlist" className="nav-link">
                                    <FiHeart /> Wishlist
                                </Link>
                                <Link to="/orders" className="nav-link">
                                    <FiPackage /> Orders
                                </Link>
                            </>
                        )}
                        {user.role === 'SELLER' && (
                            <Link to="/seller" className="nav-link">
                                <FiGrid /> Dashboard
                            </Link>
                        )}
                        {user.role === 'ADMIN' && (
                            <Link to="/admin" className="nav-link">
                                <FiGrid /> Admin
                            </Link>
                        )}
                        <Link to="/profile" className="nav-link">
                            <FiUser />
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
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-btn register-btn">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
