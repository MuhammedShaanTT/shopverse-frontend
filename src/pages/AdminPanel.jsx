import { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory, getAdminOrders, updateOrderStatus, getAdminUsers, getAdminStats } from '../api';
import { FiTrash2, FiUsers, FiPackage, FiGrid, FiDollarSign, FiShoppingBag } from 'react-icons/fi';

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
        <div className="page">
            <div className="page-header">
                <h1>Admin Panel</h1>
                <p>Manage your platform</p>
            </div>

            <div className="admin-tabs">
                <button className={`admin-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
                    <FiDollarSign style={{ marginRight: '4px' }} /> Dashboard
                </button>
                <button className={`admin-tab ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>
                    <FiGrid style={{ marginRight: '4px' }} /> Categories
                </button>
                <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
                    <FiPackage style={{ marginRight: '4px' }} /> Orders ({orders.length})
                </button>
                <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
                    <FiUsers style={{ marginRight: '4px' }} /> Users ({users.length})
                </button>
            </div>

            {msg && <div className="success-msg">{msg}</div>}
            {error && <div className="error-msg">{error}</div>}

            {/* STATS TAB */}
            {tab === 'stats' && stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#ede9fe' }}><FiDollarSign color="#7c3aed" size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">₹{Number(stats.totalRevenue).toLocaleString()}</span>
                            <span className="stat-label">Total Revenue</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dbeafe' }}><FiShoppingBag color="#2563eb" size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalOrders}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#dcfce7' }}><FiUsers color="#16a34a" size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalUsers}</span>
                            <span className="stat-label">Total Users</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fef3c7' }}><FiGrid color="#d97706" size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalProducts}</span>
                            <span className="stat-label">Total Products</span>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'categories' && (
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
                                <span>{cat.name}</span>
                                <button className="btn-danger" onClick={() => handleDeleteCategory(cat.id)}>
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'orders' && (
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
                                        <td style={{ fontWeight: 600, color: '#7c3aed' }}>₹{order.totalAmount.toFixed(2)}</td>
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
            )}

            {tab === 'users' && (
                <table className="admin-table">
                    <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>#{user.id}</td>
                                <td><strong>{user.name}</strong></td>
                                <td>{user.email}</td>
                                <td><span className="role-badge">{user.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
