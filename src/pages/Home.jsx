import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, searchProducts, getCategories, getProductsByCategory, addToCart, toggleWishlist, getWishlistIds, getProductReviews, addReview } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { FiSearch, FiHeart, FiStar } from 'react-icons/fi';

export default function Home() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [reviews, setReviews] = useState({});
    const { user } = useAuth();
    const addToast = useToast();

    useEffect(() => {
        loadProducts();
        loadCategories();
        if (user) loadWishlistIds();
    }, [user]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await getProducts();
            setProducts(res.data.content);
            // Load reviews for each product
            res.data.content.forEach(p => loadReviews(p.id));
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const loadCategories = async () => {
        try { setCategories((await getCategories()).data); } catch (err) { console.error(err); }
    };

    const loadWishlistIds = async () => {
        try { setWishlistIds((await getWishlistIds()).data); } catch (err) { console.error(err); }
    };

    const loadReviews = async (productId) => {
        try {
            const res = await getProductReviews(productId);
            setReviews(prev => ({ ...prev, [productId]: res.data }));
        } catch (err) { /* ignore */ }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) { loadProducts(); return; }
        setLoading(true);
        setActiveCategory(null);
        try {
            const res = await searchProducts(query);
            setProducts(res.data.content);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const filterByCategory = async (catId) => {
        if (catId === activeCategory) { setActiveCategory(null); loadProducts(); return; }
        setActiveCategory(catId);
        setLoading(true);
        try { setProducts((await getProductsByCategory(catId)).data.content); } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleAddToCart = async (productId) => {
        try {
            await addToCart({ productId, quantity: 1 });
            addToast('Added to cart! ✅', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to add to cart', 'error');
        }
    };

    const handleToggleWishlist = async (productId) => {
        try {
            await toggleWishlist(productId);
            setWishlistIds(prev =>
                prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
            );
        } catch (err) { console.error(err); }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await addReview(reviewModal, reviewData);
            setReviewModal(null);
            setReviewData({ rating: 5, comment: '' });
            loadReviews(reviewModal);
            addToast('Review submitted! ⭐', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Already reviewed', 'error');
            setReviewModal(null);
        }
    };

    const getStockLabel = (stock) => {
        if (stock === 0) return <span className="stock-badge out">Out of Stock</span>;
        if (stock <= 5) return <span className="stock-badge low">Low Stock ({stock})</span>;
        return <span className="product-stock">Stock: {stock}</span>;
    };

    const renderStars = (avg) => {
        return '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Discover Products</h1>
                <p>Browse our curated collection from top sellers</p>
            </div>

            <form className="search-bar" onSubmit={handleSearch}>
                <input placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} />
                <button type="submit"><FiSearch /> Search</button>
            </form>

            <div className="categories-filter">
                <button className={`category-btn ${!activeCategory ? 'active' : ''}`}
                    onClick={() => { setActiveCategory(null); loadProducts(); }}>All</button>
                {categories.map(cat => (
                    <button key={cat.id} className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => filterByCategory(cat.id)}>{cat.name}</button>
                ))}
            </div>



            {/* REVIEW MODAL */}
            {reviewModal && (
                <div className="modal-overlay" onClick={() => setReviewModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Write a Review</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className="form-group">
                                <label>Rating</label>
                                <div className="star-input">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <span key={s} className={`star-pick ${reviewData.rating >= s ? 'active' : ''}`}
                                            onClick={() => setReviewData({ ...reviewData, rating: s })}>★</span>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Comment (optional)</label>
                                <input type="text" placeholder="Great product!" value={reviewData.comment}
                                    onChange={e => setReviewData({ ...reviewData, comment: e.target.value })} />
                            </div>
                            <button className="btn-primary" type="submit">Submit Review</button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="product-grid">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-image" />
                            <div className="skeleton-body">
                                <div className="skeleton-line skeleton-title" />
                                <div className="skeleton-line skeleton-text" />
                                <div className="skeleton-meta">
                                    <div className="skeleton-line skeleton-price" />
                                    <div className="skeleton-line skeleton-badge" />
                                </div>
                                <div className="skeleton-line skeleton-btn" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="empty-state"><span>📦</span>No products found</div>
            ) : (
                <div className="product-grid">
                    {products.map(product => {
                        const rev = reviews[product.id];
                        return (
                            <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                                <div className="product-image">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        product.categoryName === 'Electronics' ? '💻' :
                                            product.categoryName === 'Clothing' ? '👕' : '🛍️'
                                    )}
                                    {user && (
                                        <button className={`wishlist-btn ${wishlistIds.includes(product.id) ? 'active' : ''}`}
                                            onClick={() => handleToggleWishlist(product.id)}>
                                            <FiHeart />
                                        </button>
                                    )}
                                </div>
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    {product.description && <p className="product-seller">{product.description}</p>}
                                    <div className="product-meta">
                                        <span className="product-price">₹{product.price}</span>
                                        <span className="product-category">{product.categoryName}</span>
                                    </div>
                                    <p className="product-seller">by {product.sellerName}</p>
                                    {getStockLabel(product.stock)}

                                    {rev && rev.totalReviews > 0 && (
                                        <div className="product-rating">
                                            <span className="stars">{renderStars(rev.averageRating)}</span>
                                            <span className="rating-text">{rev.averageRating} ({rev.totalReviews})</span>
                                        </div>
                                    )}

                                    {user?.role === 'BUYER' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <button className="btn-add-cart" onClick={() => handleAddToCart(product.id)}
                                                disabled={product.stock === 0}>
                                                {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                                            </button>
                                            <button className="btn-review" onClick={() => setReviewModal(product.id)}>
                                                <FiStar />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
