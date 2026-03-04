import { useState, useEffect } from 'react';
import { getWishlist, toggleWishlist } from '../api';
import { FiHeart, FiTrash2 } from 'react-icons/fi';

export default function Wishlist() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="page"><div className="loading">Loading...</div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>My Wishlist</h1>
                <p>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
            </div>

            {items.length === 0 ? (
                <div className="empty-state">
                    <span>💜</span>
                    No items in your wishlist yet
                </div>
            ) : (
                <div className="cart-items">
                    {items.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-info">
                                <h3>{item.productName}</h3>
                                <p>₹{item.price} · {item.categoryName}</p>
                            </div>
                            <button className="btn-remove" onClick={() => handleRemove(item.productId)}>
                                <FiTrash2 /> Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
