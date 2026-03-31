import { getOrders, cancelOrder } from '../api';
import { PageTransition } from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { FiPrinter } from 'react-icons/fi';

const TIMELINE_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

function OrderTimeline({ status }) {
    if (status === 'CANCELLED') {
        return <div style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '0.5rem' }}>❌ This order was cancelled</div>;
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

    if (loading) return <PageTransition><div className="page"><div className="loading">Loading orders...</div></div></PageTransition>;

    return (
        <PageTransition>
            <div className="page">
                <ScrollReveal>
                    <div className="page-header">
                        <h1>My Orders</h1>
                        <p>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                    </div>
                </ScrollReveal>

                {msg && <div className="success-msg">{msg}</div>}

                {orders.length === 0 ? (
                    <div className="empty-state"><span>📦</span>No orders yet — start shopping!</div>
                ) : (
                    orders.map((order, index) => (
                        <ScrollReveal key={order.id} delay={index * 0.1}>
                            <div className="order-card">
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
                                    <button className="btn-secondary" onClick={() => {
                                        window.print();
                                    }} style={{ gap: '0.5rem', display: 'flex', alignItems: 'center', marginLeft: order.status === 'PENDING' ? '1rem' : '0' }}>
                                        <FiPrinter /> Print Invoice
                                    </button>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                        {order.estimatedDelivery && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>
                                                Expected Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        )}
                                        {order.status === 'DELIVERED' && (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 500 }}>
                                                Delivered
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))
                )}
            </div>
        </PageTransition>
    );
}
