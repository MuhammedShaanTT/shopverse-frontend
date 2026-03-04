import { useState, useEffect } from 'react';
import { getOrders, cancelOrder } from '../api';

const TIMELINE_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

function OrderTimeline({ status }) {
    if (status === 'CANCELLED') {
        return <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.5rem' }}>❌ This order was cancelled</div>;
    }

    const currentIndex = TIMELINE_STEPS.indexOf(status);

    return (
        <div className="order-timeline">
            {TIMELINE_STEPS.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < TIMELINE_STEPS.length - 1 ? 1 : 'none' }}>
                    <div className="timeline-step" style={{ flex: 'none' }}>
                        <div className={`timeline-dot ${i < currentIndex ? 'done' : i === currentIndex ? 'current' : ''}`}>
                            {i < currentIndex ? '✓' : ''}
                        </div>
                        <span className={`timeline-label ${i < currentIndex ? 'done' : i === currentIndex ? 'current' : ''}`}>
                            {step}
                        </span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`timeline-line ${i < currentIndex ? 'done' : ''}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const load = async () => {
            try { setOrders((await getOrders()).data); } catch (err) { console.error(err); }
            setLoading(false);
        };
        load();
    }, []);

    const handleCancel = async (id) => {
        try {
            await cancelOrder(id);
            setOrders(orders.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o));
            setMsg('Order cancelled. Stock restored.');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Cannot cancel order');
            setTimeout(() => setMsg(''), 3000);
        }
    };

    if (loading) return <div className="page"><div className="loading">Loading orders...</div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>My Orders</h1>
                <p>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
            </div>

            {msg && <div className="success-msg">{msg}</div>}

            {orders.length === 0 ? (
                <div className="empty-state"><span>📦</span>No orders yet — start shopping!</div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <span className="order-id">Order #{order.id}</span>
                            <span className={`status-badge status-${order.status}`}>{order.status}</span>
                        </div>
                        <div className="order-items">
                            {order.items.map((item, i) => (
                                <div key={i} className="order-item-row">
                                    <span>{item.productName} × {item.quantity}</span>
                                    <span>₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="order-total">
                            <span>Total</span>
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>

                        <OrderTimeline status={order.status} />

                        <div className="order-actions">
                            {order.status === 'PENDING' && (
                                <button className="btn-cancel" onClick={() => handleCancel(order.id)}>Cancel Order</button>
                            )}
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto' }}>
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
