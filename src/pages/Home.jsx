import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProducts, searchProducts, getCategories, getProductsByCategory, addToCart, toggleWishlist, getWishlistIds, getProductReviews, addReview } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { PageTransition } from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { FiSearch, FiHeart, FiStar, FiArrowRight } from 'react-icons/fi';

export default function Home() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [page, setPage] = useState(0);
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
            const res = await getProducts(page, sort, minPrice, maxPrice);
            setProducts(res.data.content);
            res.data.content.forEach(p => loadReviews(p.id));
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    // Re-fetch when sort, minPrice, maxPrice change. 
    useEffect(() => {
        loadProducts();
    }, [sort, minPrice, maxPrice, page]);

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
            addToast('Added to cart ✓', 'success');
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
            addToast('Review submitted ✓', 'success');
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

    // Duplicate categories for seamless marquee
    const marqueeItems = [...categories, ...categories, ...categories];

    return (
        <PageTransition>
            {/* ─── HERO SECTION ─── */}
            <section className="hero">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div className="hero-eyebrow">Curated for the Extraordinary</div>
                    <h1>Discover What<br />Defines You</h1>
                    <p className="hero-subtitle">
                        A carefully curated collection of premium products from trusted sellers around the world.
                    </p>
                    <button className="hero-cta" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
                        Explore Collection <FiArrowRight />
                    </button>
                </motion.div>
            </section>

            {/* ─── MARQUEE ─── */}
            {categories.length > 0 && (
                <div className="marquee-container">
                    <div className="marquee-track">
                        {marqueeItems.map((cat, i) => (
                            <span key={i} className="marquee-item">
                                <span className="marquee-dot" />
                                {cat.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── PRODUCTS SECTION ─── */}
            <div className="page" id="products">
                <ScrollReveal>
                    <div className="page-header">
                        <h2>The Collection</h2>
                        <p>Browse our curated selection</p>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                    <form className="search-bar" onSubmit={handleSearch}>
                        <input placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button type="submit"><FiSearch /> Search</button>
                    </form>
                </ScrollReveal>

                <ScrollReveal delay={0.15}>
                    <div className="categories-filter" style={{ marginBottom: '1rem' }}>
                        <button className={`category-btn ${!activeCategory ? 'active' : ''}`}
                            onClick={() => { setActiveCategory(null); loadProducts(); }}>All</button>
                        {categories.map(cat => (
                            <button key={cat.id} className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => filterByCategory(cat.id)}>{cat.name}</button>
                        ))}
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                    <div className="filter-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        <select className="input-field" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto' }}>
                            <option value="">Sort by: Featured</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest Arrivals</option>
                        </select>
                        <input className="input-field" type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: '120px' }} />
                        <input className="input-field" type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: '120px' }} />
                        <button className="btn-secondary" onClick={() => loadProducts()}>Apply Filters</button>
                    </div>
                </ScrollReveal>

                {/* REVIEW MODAL */}
                {reviewModal && (
                    <div className="modal-overlay" onClick={() => setReviewModal(null)}>
                        <motion.div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
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
                                    <input type="text" placeholder="Share your experience..." value={reviewData.comment}
                                        onChange={e => setReviewData({ ...reviewData, comment: e.target.value })} />
                                </div>
                                <button className="btn-primary" type="submit">Submit Review</button>
                            </form>
                        </motion.div>
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
                        {products.map((product, index) => {
                            const rev = reviews[product.id];
                            return (
                                <ScrollReveal key={product.id} delay={index * 0.05} direction="up">
                                    <motion.div
                                        className="product-card"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        whileHover={{ y: -4 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="product-image">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} />
                                            ) : (
                                                product.categoryName === 'Electronics' ? '💻' :
                                                    product.categoryName === 'Clothing' ? '👕' : '🛍️'
                                            )}
                                            {user && (
                                                <button className={`wishlist-btn ${wishlistIds.includes(product.id) ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); handleToggleWishlist(product.id); }}>
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
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                    <button className="btn-add-cart"
                                                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                                                        disabled={product.stock === 0}>
                                                        {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                                                    </button>
                                                    <button className="btn-review"
                                                        onClick={(e) => { e.stopPropagation(); setReviewModal(product.id); }}>
                                                        <FiStar />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
