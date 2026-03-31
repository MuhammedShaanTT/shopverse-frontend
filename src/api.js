import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout on 401 (expired/invalid token)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('name');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Products
export const getProducts = (page = 0, sort = '', minPrice = '', maxPrice = '') => {
    let url = `/products?page=${page}&size=12`;
    if (sort) url += `&sort=${sort}`;
    if (minPrice) url += `&minPrice=${minPrice}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;
    return API.get(url);
};
export const getProduct = (id) => API.get(`/products/${id}`);
export const searchProducts = (query) => API.get(`/products/search?query=${query}`);
export const getProductsByCategory = (id) => API.get(`/products/category/${id}`);
export const addProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getMyProducts = () => API.get('/products/my-products');

// Addresses
export const getAddresses = () => API.get('/addresses');
export const addAddress = (data) => API.post('/addresses', data);
export const updateAddress = (id, data) => API.put(`/addresses/${id}`, data);
export const deleteAddress = (id) => API.delete(`/addresses/${id}`);
export const setDefaultAddress = (id) => API.put(`/addresses/${id}/default`);

// Categories
export const getCategories = () => API.get('/categories');

// Cart
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart', data);
export const updateCartQuantity = (id, quantity) => API.put(`/cart/${id}`, { quantity });
export const removeFromCart = (id) => API.delete(`/cart/${id}`);
export const clearCart = () => API.delete('/cart');

// Orders
export const placeOrder = (addressId) => API.post(`/orders${addressId ? `?addressId=${addressId}` : ''}`);
export const getOrders = () => API.get('/orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);

// Wishlist
export const toggleWishlist = (productId) => API.post(`/wishlist/${productId}`);
export const getWishlist = () => API.get('/wishlist');
export const getWishlistIds = () => API.get('/wishlist/ids');

// Reviews
export const addReview = (productId, data) => API.post(`/reviews/${productId}`, data);
export const getProductReviews = (productId) => API.get(`/reviews/${productId}`);
export const replyReview = (id, data) => API.put(`/reviews/${id}/reply`, data);

// Seller Dashboard
export const getSellerStats = () => API.get('/seller/stats');
export const getSellerOrders = () => API.get('/seller/orders');
export const getSellerRevenue = () => API.get('/seller/revenue');

// Admin
export const createCategory = (data) => API.post('/admin/categories', data);
export const deleteCategory = (id) => API.delete(`/admin/categories/${id}`);
export const getAdminOrders = () => API.get('/admin/orders');
export const updateOrderStatus = (id, status) => API.put(`/admin/orders/${id}/status`, { status });
export const getAdminUsers = () => API.get('/admin/users');
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle-status`);
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const getAdminProducts = () => API.get('/admin/products');
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminReports = () => API.get('/admin/reports');

export default API;
