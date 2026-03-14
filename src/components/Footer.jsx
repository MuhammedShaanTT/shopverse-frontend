import { Link } from 'react-router-dom';
import { FiGithub, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <span className="footer-logo">🛍️ ShopVerse</span>
                    <p>Your one-stop destination for quality products from trusted sellers worldwide.</p>
                    <div className="footer-social">
                        <a href="https://github.com/MuhammedShaanTT" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <FiGithub />
                        </a>
                        <a href="mailto:contact@shopverse.com" aria-label="Email">
                            <FiMail />
                        </a>
                    </div>
                </div>
                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Shop</h4>
                        <Link to="/">All Products</Link>
                        <Link to="/cart">My Cart</Link>
                        <Link to="/orders">My Orders</Link>
                        <Link to="/wishlist">Wishlist</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Account</h4>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                        <Link to="/profile">Profile</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <span className="footer-contact"><FiMapPin /> India</span>
                        <span className="footer-contact"><FiPhone /> +91 XXXXX XXXXX</span>
                        <span className="footer-contact"><FiMail /> contact@shopverse.com</span>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} ShopVerse. Built with ❤️ by Muhammed Shaan</p>
            </div>
        </footer>
    );
}
