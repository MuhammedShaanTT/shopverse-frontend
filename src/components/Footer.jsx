export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <span className="footer-logo">🛍️ ShopVerse</span>
                    <p>Your one-stop destination for quality products from trusted sellers.</p>
                </div>
                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Shop</h4>
                        <a href="/">All Products</a>
                        <a href="/cart">My Cart</a>
                        <a href="/orders">My Orders</a>
                        <a href="/wishlist">Wishlist</a>
                    </div>
                    <div className="footer-col">
                        <h4>Account</h4>
                        <a href="/login">Login</a>
                        <a href="/register">Register</a>
                        <a href="/profile">Profile</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} ShopVerse. Built with ❤️</p>
            </div>
        </footer>
    );
}
