import { useState, useEffect } from 'react';
import { addProduct, getMyProducts, getCategories, updateProduct, deleteProduct, getSellerStats, getSellerOrders, replyReview } from '../api';
import { FiEdit, FiTrash2, FiX, FiCheck, FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiMessageCircle } from 'react-icons/fi';
import { PageTransition } from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';

export default function SellerDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, orders, reviews
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    
    // Product form state
    const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    
    // Review reply state
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [prodRes, catRes, statsRes, ordRes] = await Promise.all([
                getMyProducts(), 
                getCategories(),
                getSellerStats(),
                getSellerOrders()
            ]);
            setProducts(prodRes.data.content || []);
            setCategories(catRes.data);
            setStats(statsRes.data);
            setOrders(ordRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setError(''); setMsg('');
        try {
            const data = {
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.stock),
                categoryId: parseInt(form.categoryId)
            };
            await addProduct(data);
            setMsg('Product added! ✅');
            setForm({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product');
        }
    };

    const startEditProduct = (p) => {
        setEditingId(p.id);
        setEditForm({
            name: p.name,
            description: p.description || '',
            price: p.price,
            stock: p.stock,
            categoryId: categories.find(c => c.name === p.categoryName)?.id || '',
            imageUrl: p.imageUrl || ''
        });
    };

    const handleUpdateProduct = async (id) => {
        try {
            await updateProduct(id, {
                ...editForm,
                price: parseFloat(editForm.price),
                stock: parseInt(editForm.stock),
                categoryId: parseInt(editForm.categoryId)
            });
            setEditingId(null);
            setMsg('Product updated! ✅');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await deleteProduct(id);
            setMsg('Product deleted');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleReplyToReview = async (reviewId) => {
        try {
            await replyReview(reviewId, { sellerReply: replyText });
            setMsg('Reply posted successfully!');
            setReplyingTo(null);
            setReplyText('');
            loadData(); // To refresh stats/orders if reviews are linked, though usually they are separate endpoint
            // Wait, our backend doesn't have a direct "seller/reviews" endpoint, we'll need to fetch reviews. 
            // We can just reload page or ignore since reviews are in product endpoint?
            // Actually, for now let's just show success.
        } catch (err) {
            setError('Failed to post reply');
        }
    };

    if (loading) return <PageTransition><div className="page"><div className="loading">Loading...</div></div></PageTransition>;

    // Find products with low stock for alerts
    const lowStockProducts = products.filter(p => p.stock < 5);

    return (
        <PageTransition>
            <div className="page" style={{ padding: '120px 2rem 4rem' }}>
                <ScrollReveal>
                    <div className="page-header" style={{ marginBottom: '2rem' }}>
                        <h1>Seller Workspace</h1>
                        <p>Manage your business on TISWA</p>
                    </div>
                </ScrollReveal>

                {/* TABS */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', overflowX: 'auto' }}>
                    {['dashboard', 'products', 'orders'].map(tab => (
                        <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            style={{ 
                                padding: '0.5rem 1rem', background: 'transparent', border: 'none', 
                                color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab ? 600 : 400,
                                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                                cursor: 'pointer', textTransform: 'capitalize'
                            }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {msg && <div className="success-msg" style={{ marginBottom: '1rem' }}>{msg}</div>}
                {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && stats && (
                    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <ScrollReveal delay={0.1}>
                            <div className="stat-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}><FiDollarSign /> Total Revenue</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>₹{stats.totalRevenue.toLocaleString()}</div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={0.2}>
                            <div className="stat-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}><FiShoppingBag /> Total Orders</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalOrders}</div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={0.3}>
                            <div className="stat-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}><FiPackage /> Active Products</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalProducts}</div>
                            </div>
                        </ScrollReveal>
                        
                        {lowStockProducts.length > 0 && (
                            <ScrollReveal delay={0.4} style={{ gridColumn: '1 / -1' }}>
                                <div className="alerts-card" style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'rgba(255, 165, 0, 0.1)', border: '1px solid orange' }}>
                                    <h3 style={{ color: 'orange', margin: '0 0 1rem 0' }}>⚠️ Low Stock Alerts</h3>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text)' }}>
                                        {lowStockProducts.map(p => (
                                            <li key={p.id}>{p.name} - Only {p.stock} left in stock!</li>
                                        ))}
                                    </ul>
                                </div>
                            </ScrollReveal>
                        )}
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <div className="dashboard-grid">
                        <ScrollReveal delay={0.1}>
                            <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0' }}>Add New Product</h3>
                                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input className="input-field" type="text" placeholder="Enter name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea className="input-field" placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Price (₹)</label>
                                            <input className="input-field" type="number" step="0.01" placeholder="999.99" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Stock</label>
                                            <input className="input-field" type="number" placeholder="10" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                                            <option value="">Select category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Image URL (optional)</label>
                                        <input className="input-field" type="url" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                                        {form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', marginTop: '0.5rem', borderRadius: '8px' }} />}
                                    </div>
                                    <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-start' }}>Add Product</button>
                                </form>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2}>
                            <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0' }}>My Products ({products.length})</h3>
                                {products.length === 0 ? (
                                    <div className="empty-state"><span>📦</span>No products yet</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {products.map(p => (
                                            <div key={p.id} className="item-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                                {editingId === p.id ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <input className="input-field" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <input className="input-field" type="number" step="0.01" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="Price" />
                                                            <input className="input-field" type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} placeholder="Stock" />
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="btn-primary" onClick={() => handleUpdateProduct(p.id)} style={{ flex: 1, padding: '0.5rem' }}><FiCheck /> Save</button>
                                                            <button className="btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.5rem' }}><FiX /> Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}/> : <div style={{width:'40px',height:'40px',background:'var(--surface)',borderRadius:'4px',display:'grid',placeItems:'center'}}>📦</div>}
                                                            <div>
                                                                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{p.name}</strong>
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>₹{p.price} | Stock: {p.stock} | {p.categoryName}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="icon-btn" onClick={() => startEditProduct(p)} title="Edit"><FiEdit /></button>
                                                            <button className="icon-btn" style={{ color: 'var(--error, #e53e3e)' }} onClick={() => handleDeleteProduct(p.id)} title="Delete"><FiTrash2 /></button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollReveal>
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className="orders-section">
                        <h3 style={{ margin: '0 0 1.5rem 0' }}>Orders Containing Your Products</h3>
                        {orders.length === 0 ? (
                            <div className="empty-state"><span>📦</span>No orders received yet</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {orders.map((order, i) => (
                                    <ScrollReveal key={order.id} delay={i * 0.1}>
                                        <div className="order-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600 }}>Order #{order.id}</span>
                                                <span className={`status-badge status-${order.status}`}>{order.status}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                        <span>{item.productName} × {item.quantity}</span>
                                                        <span>₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </PageTransition>
    );
}
