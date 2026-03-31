import { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory, getAdminOrders, updateOrderStatus, getAdminUsers, getAdminStats } from '../api';
import { FiTrash2, FiUsers, FiPackage, FiGrid, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import { PageTransition } from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';

export default function AdminPanel() {
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [catName, setCatName] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try { setStats((await getAdminStats()).data); } catch (err) { console.error(err); }
        try { setCategories((await getCategories()).data); } catch (err) { console.error(err); }
        try { setOrders((await getAdminOrders()).data); } catch (err) { console.error(err); }
        try { setUsers((await getAdminUsers()).data); } catch (err) { console.error(err); }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault(); setMsg(''); setError('');
        try { await createCategory({ name: catName }); setMsg('Created! ✅'); setCatName(''); loadAll(); }
        catch (err) { setError(err.response?.data?.message || 'Failed'); }
    };

    const handleDeleteCategory = async (id) => {
        try { await deleteCategory(id); loadAll(); } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    };

    const handleStatusChange = async (orderId, status) => {
        try { await updateOrderStatus(orderId, status); loadAll(); }
        catch (err) { setError(err.response?.data?.message || 'Failed'); }
    };

    return (
        <PageTransition>
            <div className="page">
                <ScrollReveal>
                    <div className="page-header">
                        <h1>Admin Panel</h1>
                        <p>Manage your platform</p>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                    <div className="admin-tabs">
                        <button className={`admin-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
                            <FiDollarSign /> Dashboard
                        </button>
                        <button className={`admin-tab ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>
                            <FiGrid /> Categories
                        </button>
                        <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
                            <FiPackage /> Orders ({orders.length})
                        </button>
                        <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
                            <FiUsers /> Users ({users.length})
                        </button>
                    </div>
                </ScrollReveal>

                {msg && <div className="success-msg">{msg}</div>}
                {error && <div className="error-msg">{error}</div>}

                {/* STATS TAB */}
                {tab === 'stats' && stats && (
                    <div className="stats-grid">
                        {[
                            { icon: <FiDollarSign color="#c9a962" size={24} />, bg: 'var(--accent-gold-soft)', value: `₹${Number(stats.totalRevenue).toLocaleString()}`, label: 'Total Revenue' },
                            { icon: <FiShoppingBag color="#3b82f6" size={24} />, bg: 'rgba(59,130,246,0.1)', value: stats.totalOrders, label: 'Total Orders' },
                            { icon: <FiUsers color="#16a34a" size={24} />, bg: 'rgba(22,163,106,0.1)', value: stats.totalUsers, label: 'Total Users' },
                            { icon: <FiGrid color="#d97706" size={24} />, bg: 'rgba(217,119,6,0.1)', value: stats.totalProducts, label: 'Total Products' },
                        ].map((stat, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ background: stat.bg }}>{stat.icon}</div>
                                    <div className="stat-info">
                                        <span className="stat-value">{stat.value}</span>
                                        <span className="stat-label">{stat.label}</span>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}

                {tab === 'categories' && (
                    <ScrollReveal>
                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <h3>Add Category</h3>
                                <form onSubmit={handleCreateCategory}>
                                    <div className="form-group">
                                        <label>Category Name</label>
                                        <input type="text" placeholder="e.g. Electronics" value={catName}
                                            onChange={(e) => setCatName(e.target.value)} required />
                                    </div>
                                    <button className="btn-primary" type="submit">Create</button>
                                </form>
                            </div>
                            <div className="dashboard-card">
                                <h3>All Categories ({categories.length})</h3>
                                {categories.map(cat => (
                                    <div key={cat.id} className="item-row">
                                        <span style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                                        <button className="btn-danger" onClick={() => handleDeleteCategory(cat.id)}>
                                            <FiTrash2 /> Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {tab === 'orders' && (
                    <ScrollReveal>
                        <div>
                            {orders.length === 0 ? (
                                <div className="empty-state"><span>📦</span>No orders</div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr><th>ID</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td><strong>#{order.id}</strong></td>
                                                <td>{order.items.map(i => `${i.productName} ×${i.quantity}`).join(', ')}</td>
                                                <td style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>₹{order.totalAmount.toFixed(2)}</td>
                                                <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                                                <td>
                                                    <select className="status-select" value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                                                        <option value="PENDING">PENDING</option>
                                                        <option value="CONFIRMED">CONFIRMED</option>
                                                        <option value="SHIPPED">SHIPPED</option>
                                                        <option value="DELIVERED">DELIVERED</option>
                                                        <option value="CANCELLED">CANCELLED</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </ScrollReveal>
                )}

                {tab === 'users' && (
                    <ScrollReveal>
                        <table className="admin-table">
                            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>#{user.id}</td>
                                        <td><strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong></td>
                                        <td>{user.email}</td>
                                        <td><span className="role-badge">{user.role}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollReveal>
                )}
            </div>
        </PageTransition>
    );
}
