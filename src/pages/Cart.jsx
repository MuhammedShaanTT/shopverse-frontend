import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCart, removeFromCart, clearCart, updateCartQuantity, getAddresses } from '../api';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiPlus, FiMinus, FiMapPin } from 'react-icons/fi';
import { PageTransition } from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';

export default function Cart() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [ordering, setOrdering] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { 
        loadCart(); 
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const res = await getAddresses();
            setAddresses(res.data);
            const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
            if (defaultAddr) setSelectedAddress(defaultAddr.id);
        } catch (err) { console.error(err); }
    };

    const loadCart = async () => {
        try {
            const res = await getCart();
            setItems(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleQuantityChange = async (id, newQty) => {
        if (newQty <= 0) { handleRemove(id); return; }
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
        try { await clearCart(); setItems([]); } catch (err) { console.error(err); }
    };

    const handleCheckout = async () => {
        if (addresses.length === 0) {
            setMsg('Please add a shipping address before checkout.');
            return;
        }
        setOrdering(true);
        try {
            await API.post(`/orders${selectedAddress ? `?addressId=${selectedAddress}` : ''}`);
            setMsg('Order placed successfully! 🎉');
            setItems([]);
            setTimeout(() => navigate('/orders'), 1500);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Checkout failed');
        }
        setOrdering(false);
    };

    const total = items.reduce((sum, i) => sum + i.subtotal, 0);

    if (loading) return <PageTransition><div className="page"><div className="loading">Loading cart...</div></div></PageTransition>;

    return (
        <PageTransition>
            <div className="page">
                <ScrollReveal>
                    <div className="page-header">
                        <h1>Your Cart</h1>
                        <p>{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
                    </div>
                </ScrollReveal>

                {msg && <div className="success-msg">{msg}</div>}

                {items.length === 0 ? (
                    <div className="empty-state"><span>🛒</span>Your cart is empty</div>
                ) : (
                    <>
                        <div className="cart-items">
                            {items.map((item, index) => (
                                <ScrollReveal key={item.id} delay={index * 0.08}>
                                    <motion.div
                                        className="cart-item"
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -50 }}
                                    >
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
                                    </motion.div>
                                </ScrollReveal>
                            ))}
                        </div>

                        <ScrollReveal delay={0.2}>
                            <div className="cart-summary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div className="shipping-address-selector" style={{ flex: 1, minWidth: '250px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}><FiMapPin /> Shipping Address</label>
                                        {addresses.length > 0 ? (
                                            <select className="input-field" value={selectedAddress || ''} onChange={e => setSelectedAddress(e.target.value)}>
                                                {addresses.map(addr => (
                                                    <option key={addr.id} value={addr.id}>{addr.fullName} - {addr.street}, {addr.city}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div style={{ padding: '0.5rem 1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                                                No address found. <a href="/addresses" style={{ color: 'var(--accent)' }}>Add one</a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="cart-total" style={{ margin: 0 }}>Total: <span style={{ fontSize: '1.5rem', color: 'var(--accent)', marginLeft: '1rem' }}>₹{total.toFixed(2)}</span></div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button className="btn-secondary" onClick={handleClear}>Clear All</button>
                                    <button className="btn-checkout" onClick={handleCheckout} disabled={ordering || addresses.length === 0}>
                                        <FiShoppingBag /> {ordering ? 'Placing...' : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    </>
                )}
            </div>
        </PageTransition>
    );
}
