import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMe, updateProfile } from '../api';
import { useAuth } from '../AuthContext';
import { FiUser, FiMail, FiShield, FiSave } from 'react-icons/fi';
import { PageTransition } from '../components/PageTransition';

export default function Profile() {
    const { user, loginUser } = useAuth();
    const [profile, setProfile] = useState({ name: '', email: '', role: '' });
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getMe();
                setProfile(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        load();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setMsg(''); setError('');
        try {
            const data = { name: profile.name };
            if (password) data.password = password;
            const res = await updateProfile(data);
            setMsg('Profile updated ✓');
            loginUser(user.token, res.data.role, res.data.name);
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return <PageTransition><div className="page"><div className="loading">Loading...</div></div></PageTransition>;

    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : '?';

    return (
        <PageTransition>
            <div className="auth-page">
                <motion.div
                    className="auth-card"
                    style={{ maxWidth: '480px' }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                    {/* Avatar */}
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--accent-gold-soft)', color: 'var(--accent-gold)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-serif)', fontSize: '1.5rem',
                        margin: '0 auto 1rem', border: '2px solid var(--accent-gold)'
                    }}>
                        {initial}
                    </div>

                    <h2>My Profile</h2>
                    <p className="subtitle">Manage your account settings</p>

                    {msg && <div className="success-msg">{msg}</div>}
                    {error && <div className="error-msg">{error}</div>}

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        marginBottom: '1.25rem', padding: '0.85rem 1rem',
                        background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)'
                    }}>
                        <FiMail style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{profile.email}</span>
                        <span className="role-badge" style={{ marginLeft: 'auto' }}>{profile.role}</span>
                    </div>

                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label><FiUser style={{ marginRight: '4px' }} /> Display Name</label>
                            <input type="text" value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label><FiShield style={{ marginRight: '4px' }} /> New Password (leave blank to keep current)</label>
                            <input type="password" placeholder="••••••••" value={password}
                                onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button className="btn-primary" type="submit">
                            <FiSave style={{ marginRight: '4px' }} /> Save Changes
                        </button>
                    </form>
                </motion.div>
            </div>
        </PageTransition>
    );
}
