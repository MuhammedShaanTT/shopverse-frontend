import { useState, useEffect } from 'react';
import { addProduct, getMyProducts, getCategories, updateProduct, deleteProduct } from '../api';
import { FiEdit, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

export default function SellerDashboard() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([getMyProducts(), getCategories()]);
            setProducts(prodRes.data.content || []);
            setCategories(catRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
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
            setError(err.response?.data?.message || 'Failed');
        }
    };

    const startEdit = (p) => {
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

    const handleUpdate = async (id) => {
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

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await deleteProduct(id);
            setMsg('Product deleted');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    if (loading) return <div className="page"><div className="loading">Loading...</div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>Seller Dashboard</h1>
                <p>Manage your products</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Add New Product</h3>
                    {msg && <div className="success-msg">{msg}</div>}
                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Product Name</label>
                            <input type="text" placeholder="Enter name" value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input type="text" placeholder="Brief description" value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Price (₹)</label>
                            <input type="number" step="0.01" placeholder="999.99" value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Stock</label>
                            <input type="number" placeholder="10" value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Image URL (optional)</label>
                            <input type="url" placeholder="https://..." value={form.imageUrl}
                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                        </div>
                        <button className="btn-primary" type="submit">Add Product</button>
                    </form>
                </div>

                <div className="dashboard-card">
                    <h3>My Products ({products.length})</h3>
                    {products.length === 0 ? (
                        <div className="empty-state"><span>📦</span>No products yet</div>
                    ) : (
                        products.map(p => (
                            <div key={p.id} className="item-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                                {editingId === p.id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} />
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <input type="number" step="0.01" value={editForm.price}
                                                onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                                style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', flex: 1 }}
                                                placeholder="Price" />
                                            <input type="number" value={editForm.stock}
                                                onChange={e => setEditForm({ ...editForm, stock: e.target.value })}
                                                style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', flex: 1 }}
                                                placeholder="Stock" />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                                            <button className="btn-small" onClick={() => handleUpdate(p.id)} style={{ flex: 1 }}>
                                                <FiCheck /> Save
                                            </button>
                                            <button className="btn-danger" onClick={() => setEditingId(null)} style={{ padding: '0.5rem 1rem' }}>
                                                <FiX /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>{p.name}</strong>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>₹{p.price} · Stock: {p.stock} · {p.categoryName}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                                            <button className="btn-small" onClick={() => startEdit(p)} style={{ padding: '0.3rem 0.6rem', marginTop: 0 }}>
                                                <FiEdit />
                                            </button>
                                            <button className="btn-danger" onClick={() => handleDelete(p.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
