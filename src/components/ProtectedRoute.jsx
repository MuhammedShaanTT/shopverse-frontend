import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <h2 style={{ background: 'none', WebkitTextFillColor: '#dc2626', fontSize: '1.4rem' }}>
                        🚫 Access Denied
                    </h2>
                    <p className="subtitle">You don't have permission to view this page.</p>
                    <button className="btn-primary" onClick={() => window.history.back()}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
}
