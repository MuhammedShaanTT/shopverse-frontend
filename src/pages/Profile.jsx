import { useState, useEffect } from 'react';
import { getMe, updateProfile } from '../api';
import { useAuth } from '../AuthContext';
import { FiUser, FiMail, FiShield, FiSave } from 'react-icons/fi';

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
            setMsg('Profile updated! ✅');
            loginUser(user.token, res.data.role, res.data.name);
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return <div className="page"><div className="loading">Loading...</div></div>;

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '480px' }}>
                <h2>My Profile</h2>
                <p className="subtitle">Manage your account settings</p>

                {msg && <div className="success-msg">{msg}</div>}
                {error && <div className="error-msg">{error}</div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <FiMail style={{ color: '#64748b' }} />
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>{profile.email}</span>
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
            </div>
        </div>
    );
}
