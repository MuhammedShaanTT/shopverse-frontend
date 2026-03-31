import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProduct, addToCart, toggleWishlist, getWishlistIds, getProductReviews, addReview, getProductsByCategory } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import { PageTransition } from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { FiHeart, FiShoppingCart, FiArrowLeft, FiStar, FiPackage, FiUser, FiPlus, FiMinus } from 'react-icons/fi';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [related, setRelated] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [showReview, setShowReview] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const addToast = useToast();

    useEffect(() => {
        loadProduct();
        if (user) loadWishlistIds();
    }, [id, user]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            const res = await getProduct(id);
            setProduct(res.data);
            loadReviews();
            try {
                const relRes = await getProductsByCategory(res.data.categoryId || 0);
                setRelated((relRes.data.content || []).filter(p => p.id !== parseInt(id)).slice(0, 4));
            } catch (err) { /* ignore */ }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const loadReviews = async () => {
        try {
            const res = await getProductReviews(id);
            setReviews(res.data);
        } catch (err) { /* ignore */ }
    };

    const loadWishlistIds = async () => {
        try { setWishlistIds((await getWishlistIds()).data); } catch (err) { /* ignore */ }
    };

    const handleAddToCart = async () => {
        if (!user) { navigate('/login'); return; }
        try {
            await addToCart({ productId: parseInt(id), quantity });
            addToast(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart ✓`, 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to add to cart', 'error');
        }
    };

    const handleToggleWishlist = async () => {
        try {
            await toggleWishlist(parseInt(id));
            setWishlistIds(prev =>
                prev.includes(parseInt(id)) ? prev.filter(i => i !== parseInt(id)) : [...prev, parseInt(id)]
            );
        } catch (err) { console.error(err); }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await addReview(id, reviewData);
            setShowReview(false);
            setReviewData({ rating: 5, comment: '' });
            loadReviews();
            addToast('Review submitted ✓', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Already reviewed', 'error');
            setShowReview(false);
        }
    };

    const renderStars = (count) => '★'.repeat(Math.round(count)) + '☆'.repeat(5 - Math.round(count));

    if (loading) return <PageTransition><div className="page"><div className="loading">Loading product...</div></div></PageTransition>;
    if (!product) return <PageTransition><div className="page"><div className="empty-state"><span>😕</span>Product not found</div></div></PageTransition>;

    const isWishlisted = wishlistIds.includes(parseInt(id));

    return (
        <PageTransition>
            <div className="page">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Back
                </button>

                <div className="product-detail">
                    <motion.div
                        className="product-detail-image"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                        ) : (
                            <div className="product-detail-placeholder">
                                {product.categoryName === 'Electronics' ? '💻' :
                                    product.categoryName === 'Clothing' ? '👕' : '🛍️'}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        className="product-detail-info"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <span className="product-category">{product.categoryName}</span>
                        <h1>{product.name}</h1>
                        {product.description && <p className="product-detail-desc">{product.description}</p>}

                        <div className="product-detail-price">₹{Number(product.price).toLocaleString()}</div>

                        <div className="product-detail-meta">
                            <span><FiPackage /> {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                            <span><FiUser /> Sold by {product.sellerName}</span>
                        </div>

                        {reviews && reviews.totalReviews > 0 && (
                            <div className="product-detail-rating">
                                <span className="stars">{renderStars(reviews.averageRating)}</span>
                                <span>{reviews.averageRating.toFixed(1)} ({reviews.totalReviews} reviews)</span>
                            </div>
                        )}

                        {(user?.role === 'BUYER' || !user) && (
                            <div className="product-detail-actions">
                                <div className="quantity-selector">
                                    <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                                        <FiMinus />
                                    </button>
                                    <span className="qty-value">{quantity}</span>
                                    <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>
                                        <FiPlus />
                                    </button>
                                </div>
                                <button className="btn-add-cart" onClick={handleAddToCart}
                                    disabled={product.stock === 0}>
                                    <FiShoppingCart /> {product.stock === 0 ? 'Out of Stock' : user ? 'Add to Cart' : 'Login to Buy'}
                                </button>
                                {user && (
                                    <>
                                        <button className={`wishlist-action-btn ${isWishlisted ? 'active' : ''}`}
                                            onClick={handleToggleWishlist}>
                                            <FiHeart /> {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                                        </button>
                                        <button className="btn-review-action" onClick={() => setShowReview(!showReview)}>
                                            <FiStar /> Review
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {showReview && (
                            <motion.form
                                className="review-form"
                                onSubmit={handleSubmitReview}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                            >
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
                                <button className="btn-primary" type="submit" style={{ maxWidth: '200px' }}>Submit Review</button>
                            </motion.form>
                        )}
                    </motion.div>
                </div>

                {/* Reviews List */}
                {reviews && reviews.reviews && reviews.reviews.length > 0 && (
                    <ScrollReveal>
                        <div className="reviews-section">
                            <h2>Customer Reviews</h2>
                            <div className="reviews-list">
                                {reviews.reviews.map((rev, i) => (
                                    <ScrollReveal key={i} delay={i * 0.08}>
                                        <div className="review-card">
                                            <div className="review-header">
                                                <span className="review-stars">{renderStars(rev.rating)}</span>
                                                <span className="review-author">{rev.userName}</span>
                                            </div>
                                            {rev.comment && <p className="review-comment">{rev.comment}</p>}
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* Related Products */}
                {related.length > 0 && (
                    <ScrollReveal>
                        <div className="related-section">
                            <h2>You May Also Like</h2>
                            <div className="product-grid">
                                {related.map((p, i) => (
                                    <ScrollReveal key={p.id} delay={i * 0.1}>
                                        <div className="product-card" onClick={() => navigate(`/product/${p.id}`)}
                                            style={{ cursor: 'pointer' }}>
                                            <div className="product-image">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} />
                                                ) : '🛍️'}
                                            </div>
                                            <div className="product-info">
                                                <h3>{p.name}</h3>
                                                <div className="product-meta">
                                                    <span className="product-price">₹{p.price}</span>
                                                    <span className="product-category">{p.categoryName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                )}
            </div>
        </PageTransition>
    );
}
