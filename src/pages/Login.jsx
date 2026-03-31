import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login, getMe } from '../api';
import { useAuth } from '../AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { PageTransition } from '../components/PageTransition';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(form);
            const token = res.data.token;
            localStorage.setItem('token', token);
            const meRes = await getMe();
            const { name, role } = meRes.data;
            loginUser(token, role, name);
            navigate('/');
        } catch (err) {
            setError(
                err.response?.data?.message
                || (err.message === 'Network Error'
                    ? 'Cannot reach server. Please try again later.'
                    : 'Invalid email or password')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="auth-page">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                    <h2>Welcome Back</h2>
                    <p className="subtitle">Sign in to your TISWA account</p>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="you@example.com" value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}
                                    aria-label="Toggle password visibility">
                                    {showPass ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <button className="btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="auth-link">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </p>
                </motion.div>
            </div>
        </PageTransition>
    );
}
