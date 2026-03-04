import { useState, useEffect } from 'react';
import { getCart, removeFromCart, clearCart, placeOrder, updateCartQuantity } from '../api';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiPlus, FiMinus } from 'react-icons/fi';

export default function Cart() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [ordering, setOrdering] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { loadCart(); }, []);

    const loadCart = async () => {
        try {
            const res = await getCart();
            setItems(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleQuantityChange = async (id, newQty) => {
        if (newQty <= 0) {
            handleRemove(id);
            return;
        }
        try {
            await updateCartQuantity(id, newQty);
            setItems(items.map(i => i.id === id ? { ...i, quantity: newQty, subtotal: i.productPrice * newQty } : i));
        } catch (err) { console.error(err); }
    };

    const handleRemove = async (id) => {
        try {
            await removeFromCart(id);
            setItems(items.filter(i => i.id !== id));
        } catch (err) { console.error(err); }
    };

    const handleClear = async () => {
        try {
            await clearCart();
            setItems([]);
        } catch (err) { console.error(err); }
    };

    const handleCheckout = async () => {
        setOrdering(true);
        try {
            await placeOrder();
            setMsg('Order placed successfully! 🎉');
            setItems([]);
            setTimeout(() => navigate('/orders'), 1500);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Checkout failed');
        }
        setOrdering(false);
    };

    const total = items.reduce((sum, i) => sum + i.subtotal, 0);

    if (loading) return <div className="page"><div className="loading">Loading cart...</div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>Your Cart</h1>
                <p>{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
            </div>

            {msg && <div className="success-msg">{msg}</div>}

            {items.length === 0 ? (
                <div className="empty-state">
                    <span>🛒</span>
                    Your cart is empty
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {items.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-info">
                                    <h3>{item.productName}</h3>
                                    <p>₹{item.productPrice} per unit</p>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button className="qty-btn" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                                            <FiMinus />
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                                            <FiPlus />
                                        </button>
                                    </div>
                                    <span className="cart-subtotal">₹{item.subtotal.toFixed(2)}</span>
                                    <button className="btn-remove" onClick={() => handleRemove(item.id)}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="cart-total">Total: <span>₹{total.toFixed(2)}</span></div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-remove" onClick={handleClear}>Clear All</button>
                            <button className="btn-checkout" onClick={handleCheckout} disabled={ordering}>
                                <FiShoppingBag /> {ordering ? 'Placing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
