import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'BUYER' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (form.password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await register(form);
            loginUser(res.data.token, form.role, form.name);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="subtitle">Join ShopVerse today</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" placeholder="John Doe" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="you@example.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <input type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                            <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}
                                aria-label="Toggle password visibility">
                                {showPass ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="input-with-icon">
                            <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} required />
                            <button type="button" className="toggle-pass" onClick={() => setShowConfirm(!showConfirm)}
                                aria-label="Toggle confirm password visibility">
                                {showConfirm ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>I want to</label>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            <option value="BUYER">Buy Products</option>
                            <option value="SELLER">Sell Products</option>
                        </select>
                    </div>
                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
