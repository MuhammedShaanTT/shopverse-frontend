import { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory, getAdminOrders, updateOrderStatus, getAdminUsers, getAdminStats, toggleUserStatus, updateUserRole, getAdminReports } from '../api';
import { FiTrash2, FiUsers, FiPackage, FiGrid, FiDollarSign, FiShoppingBag, FiDownload} from 'react-icons/fi';
import { PageTransition } from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminPanel() {
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
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
        try { setRevenueData((await getAdminReports()).data.revenueData); } catch (err) { console.error(err); }
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

    const handleToggleUser = async (userId) => {
        try { await toggleUserStatus(userId); loadAll(); }
        catch (err) { setError(err.response?.data?.message || 'Failed to toggle status'); }
    };

    const handleRoleChange = async (userId, role) => {
        try { await updateUserRole(userId, role); loadAll(); }
        catch (err) { setError(err.response?.data?.message || 'Failed to update role'); }
    };

    const handleExportOrders = () => {
        if (orders.length === 0) return;
        const headers = 'Order ID,Date,Status,Total amount,Items\n';
        const rows = orders.map(o => {
            const date = new Date(o.createdAt).toLocaleDateString();
            const items = o.items.map(i => `${i.productName} (x${i.quantity})`).join('; ');
            return `${o.id},${date},${o.status},${o.totalAmount},"${items}"`;
        }).join('\n');
        
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tiswa_orders.csv';
        a.click();
    };

    return (
        <PageTransition>
            <div className="page" style={{ padding: '120px 2rem 4rem' }}>
                <ScrollReveal>
                    <div className="page-header" style={{ marginBottom: '2rem' }}>
                        <h1>Admin Executive Panel</h1>
                        <p>Manage users, orders, and platform settings</p>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                    <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', overflowX: 'auto' }}>
                        {[
                            { id: 'stats', icon: <FiDollarSign />, label: 'Dashboard' },
                            { id: 'categories', icon: <FiGrid />, label: 'Categories' },
                            { id: 'orders', icon: <FiPackage />, label: `Orders (${orders.length})` },
                            { id: 'users', icon: <FiUsers />, label: `Users (${users.length})` }
                        ].map(t => (
                            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`}
                                onClick={() => setTab(t.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem', background: 'transparent', border: 'none', 
                                    color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                                    fontWeight: tab === t.id ? 600 : 400,
                                    borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                                    cursor: 'pointer'
                                }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </ScrollReveal>

                {msg && <div className="success-msg" style={{ marginBottom: '1rem' }}>{msg}</div>}
                {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

                {/* STATS TAB */}
                {tab === 'stats' && stats && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {[
                                { icon: <FiDollarSign color="#c9a962" size={24} />, bg: 'var(--accent-gold-soft)', value: `₹${Number(stats.totalRevenue).toLocaleString()}`, label: 'Total Revenue' },
                                { icon: <FiShoppingBag color="#3b82f6" size={24} />, bg: 'rgba(59,130,246,0.1)', value: stats.totalOrders, label: 'Total Orders' },
                                { icon: <FiUsers color="#16a34a" size={24} />, bg: 'rgba(22,163,106,0.1)', value: stats.totalUsers, label: 'Total Users' },
                                { icon: <FiGrid color="#d97706" size={24} />, bg: 'rgba(217,119,6,0.1)', value: stats.totalProducts, label: 'Total Products' },
                            ].map((stat, i) => (
                                <ScrollReveal key={i} delay={i * 0.1}>
                                    <div className="stat-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="stat-icon" style={{ background: stat.bg, padding: '1rem', borderRadius: '50%' }}>{stat.icon}</div>
                                        <div className="stat-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</span>
                                            <span className="stat-label" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                        
                        {revenueData && revenueData.length > 0 && (
                            <ScrollReveal delay={0.4}>
                                <div className="chart-card glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                                    <h3 style={{ margin: '0 0 1.5rem 0' }}>Revenue Overview</h3>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={revenueData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                                <Tooltip 
                                                    cursor={{ fill: 'var(--surface-active)' }}
                                                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text)' }} 
                                                    itemStyle={{ color: 'var(--accent)' }} 
                                                />
                                                <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </ScrollReveal>
                        )}
                    </div>
                )}

                {tab === 'categories' && (
                    <ScrollReveal>
                        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                                <h3>Add Category</h3>
                                <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Category Name</label>
                                        <input className="input-field" type="text" placeholder="e.g. Electronics" value={catName}
                                            onChange={(e) => setCatName(e.target.value)} required />
                                    </div>
                                    <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-start' }}>Create Category</button>
                                </form>
                            </div>
                            <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                                <h3>All Categories ({categories.length})</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {categories.map(cat => (
                                        <div key={cat.id} className="item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat.name}</span>
                                            <button className="icon-btn" style={{ color: 'var(--error, #e53e3e)' }} onClick={() => handleDeleteCategory(cat.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {tab === 'orders' && (
                    <ScrollReveal>
                        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Recent Orders</h3>
                                <button className="btn-secondary" onClick={handleExportOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiDownload /> Export CSV
                                </button>
                            </div>
                            {orders.length === 0 ? (
                                <div className="empty-state"><span>📦</span>No orders</div>
                            ) : (
                                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Items</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Total</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem' }}><strong>#{order.id}</strong></td>
                                                <td style={{ padding: '1rem', maxWidth: '300px' }}>{order.items.map(i => `${i.productName} ×${i.quantity}`).join(', ')}</td>
                                                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--accent)' }}>₹{order.totalAmount.toFixed(2)}</td>
                                                <td style={{ padding: '1rem' }}><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                                                <td style={{ padding: '1rem' }}>
                                                    <select className="input-field" style={{ padding: '0.4rem', fontSize: '0.85rem' }} value={order.status}
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
                        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
                            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>User</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Role</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {user.role === 'ADMIN' ? (
                                                    <span className="role-badge" style={{ background: 'var(--accent-gold-soft)', color: 'var(--accent-gold)' }}>ADMIN</span>
                                                ) : (
                                                    <select className="input-field" style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'auto' }} value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                                                        <option value="BUYER">BUYER</option>
                                                        <option value="SELLER">SELLER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`status-badge stat-${user.enabled ? 'active' : 'inactive'}`} 
                                                    style={{ backgroundColor: user.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: user.enabled ? '#22c55e' : '#ef4444' }}>
                                                    {user.enabled ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {user.role !== 'ADMIN' && (
                                                    <button className={user.enabled ? 'btn-danger' : 'btn-primary'} 
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                        onClick={() => handleToggleUser(user.id)}>
                                                        {user.enabled ? 'Disable' : 'Enable'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ScrollReveal>
                )}
            </div>
        </PageTransition>
    );
}
