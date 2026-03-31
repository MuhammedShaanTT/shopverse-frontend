import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWishlist, toggleWishlist, addToCart } from '../api';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import { PageTransition } from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';

export default function Wishlist() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const addToast = useToast();
    const navigate = useNavigate();

    useEffect(() => { loadWishlist(); }, []);

    const loadWishlist = async () => {
        try {
            const res = await getWishlist();
            setItems(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleRemove = async (productId) => {
        try {
            await toggleWishlist(productId);
            setItems(items.filter(i => i.productId !== productId));
        } catch (err) { console.error(err); }
    };

    const handleAddToCart = async (productId) => {
        try {
            await addToCart({ productId, quantity: 1 });
            addToast('Added to cart ✓', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleAddAllToCart = async () => {
        if (items.length === 0) return;
        setLoading(true);
        let addedCount = 0;
        for (const item of items) {
            try {
                await addToCart({ productId: item.productId, quantity: 1 });
                addedCount++;
            } catch (err) {
                // Ignore individual errors, e.g. out of stock
            }
        }
        if (addedCount > 0) {
            addToast(`Added ${addedCount} item(s) to cart ✓`, 'success');
        } else {
            addToast('Items could not be added (may be out of stock)', 'error');
        }
        setLoading(false);
    };

    if (loading) return <PageTransition><div className="page"><div className="loading">Loading...</div></div></PageTransition>;

    return (
        <PageTransition>
            <div className="page">
                <ScrollReveal>
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1>My Wishlist</h1>
                            <p>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
                        </div>
                        {items.length > 0 && (
                            <button className="btn-primary" onClick={handleAddAllToCart}>
                                <FiShoppingCart /> Add All to Cart
                            </button>
                        )}
                    </div>
                </ScrollReveal>

                {items.length === 0 ? (
                    <div className="empty-state"><span>💜</span>No items in your wishlist yet</div>
                ) : (
                    <div className="cart-items">
                        {items.map((item, index) => (
                            <ScrollReveal key={item.id} delay={index * 0.08}>
                                <div className="cart-item">
                                    <div className="cart-item-info">
                                        <h3>{item.productName}</h3>
                                        <p>₹{item.price} · {item.categoryName}</p>
                                    </div>
                                    <div className="cart-item-actions">
                                        <button className="btn-add-cart" style={{ flex: 'none', padding: '0.55rem 1.2rem' }}
                                            onClick={() => handleAddToCart(item.productId)}>
                                            <FiShoppingCart /> Add to Cart
                                        </button>
                                        <button className="btn-remove" onClick={() => handleRemove(item.productId)}>
                                            <FiTrash2 /> Remove
                                        </button>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
