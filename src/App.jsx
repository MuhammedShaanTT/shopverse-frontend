import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import SellerDashboard from './pages/SellerDashboard';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import ProductDetail from './pages/ProductDetail';

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={
                    <ProtectedRoute allowedRoles={['BUYER']}>
                        <Cart />
                    </ProtectedRoute>
                } />
                <Route path="/orders" element={
                    <ProtectedRoute allowedRoles={['BUYER']}>
                        <Orders />
                    </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                    <ProtectedRoute allowedRoles={['BUYER']}>
                        <Wishlist />
                    </ProtectedRoute>
                } />
                <Route path="/seller" element={
                    <ProtectedRoute allowedRoles={['SELLER']}>
                        <SellerDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminPanel />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Navbar />
                    <div style={{ minHeight: 'calc(100vh - 160px)' }}>
                        <AnimatedRoutes />
                    </div>
                    <Footer />
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
