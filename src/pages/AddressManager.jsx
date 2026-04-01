import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api';
import { useToast } from '../components/Toast';
import { PageTransition } from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { FiHome, FiEdit2, FiTrash2, FiStar, FiPlus } from 'react-icons/fi';

export default function AddressManager() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAddress, setCurrentAddress] = useState(null);
    const addToast = useToast();

    // Form state
    const [formData, setFormData] = useState({
        fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        setLoading(true);
        try {
            const res = await getAddresses();
            setAddresses(res.data || []);
        } catch (err) {
            addToast('Failed to load addresses', 'error');
        }
        setLoading(false);
    };

    const handleOpenForm = (address = null) => {
        if (address) {
            setFormData(address);
            setCurrentAddress(address.id);
        } else {
            setFormData({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
            setCurrentAddress(null);
        }
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentAddress) {
                await updateAddress(currentAddress, formData);
                addToast('Address updated successfully', 'success');
            } else {
                await addAddress(formData);
                addToast('Address added successfully', 'success');
            }
            setIsEditing(false);
            loadAddresses();
        } catch (err) {
            addToast('Failed to save address', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await deleteAddress(id);
            addToast('Address deleted', 'success');
            loadAddresses();
        } catch (err) {
            addToast('Failed to delete address', 'error');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await setDefaultAddress(id);
            addToast('Default address updated', 'success');
            loadAddresses();
        } catch (err) {
            addToast('Failed to update default address', 'error');
        }
    };

    return (
        <PageTransition>
            <div className="page addresses-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 2rem 4rem' }}>
                <ScrollReveal>
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2>My Addresses</h2>
                            <p>Manage your shipping addresses below.</p>
                        </div>
                        <button className="btn-primary" onClick={() => handleOpenForm()}>
                            <FiPlus /> Add New
                        </button>
                    </div>
                </ScrollReveal>

                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        className="address-form-container glass-panel"
                        style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}
                    >
                        <h3>{currentAddress ? 'Edit Address' : 'New Address'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Full Name</label>
                                    <input className="input-field" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Phone Number</label>
                                    <input className="input-field" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Street Address</label>
                                <input className="input-field" required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>City</label>
                                    <input className="input-field" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>State</label>
                                    <input className="input-field" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>PIN Code</label>
                                    <input className="input-field" required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" id="default-checkbox" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} />
                                <label htmlFor="default-checkbox" style={{ margin: 0 }}>Make this my default address</label>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary">Save Address</button>
                                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {loading ? (
                    <div>Loading addresses...</div>
                ) : addresses.length === 0 && !isEditing ? (
                    <div className="empty-state">
                        <span><FiHome size={48} /></span>
                        <p>You haven't added any addresses yet.</p>
                    </div>
                ) : (
                    <div className="addresses-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {addresses.map((addr, index) => (
                            <ScrollReveal key={addr.id} delay={index * 0.1}>
                                <div className={`address-card glass-panel ${addr.isDefault ? 'default-address' : ''}`} style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', border: addr.isDefault ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                                    <div className="address-details" style={{ flex: 1 }}>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0' }}>
                                            {addr.fullName} 
                                            {addr.isDefault && <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'var(--accent)', color: 'var(--bg)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Default</span>}
                                        </h4>
                                        <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-muted)' }}>{addr.phone}</p>
                                        <p style={{ margin: '0', color: 'var(--text-muted)' }}>{addr.street}, {addr.city}, {addr.state} {addr.pincode}</p>
                                    </div>
                                    <div className="address-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="icon-btn" onClick={() => handleOpenForm(addr)} title="Edit"><FiEdit2 /></button>
                                            <button className="icon-btn" onClick={() => handleDelete(addr.id)} title="Delete" style={{ color: 'var(--error, #e53e3e)' }}><FiTrash2 /></button>
                                        </div>
                                        {!addr.isDefault && (
                                            <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleSetDefault(addr.id)}>
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
