import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ChatProvider } from './context/ChatContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ConditionalChatPopup from './components/ConditionalChatPopup';
import AiChatPopup from './components/AiChatPopup';

// Layouts
import ShopLayout from './layouts/ShopLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Shop Pages
import HomePage from './pages/shop/HomePage';
import ProductListPage from './pages/shop/ProductListPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import CartPage from './pages/shop/CartPage';
import CheckoutPage from './pages/shop/CheckoutPage';
import ProfilePage from './pages/shop/ProfilePage';
import AccountSettingsPage from './pages/shop/AccountSettingsPage';
import ChangePasswordPage from './pages/profile/ChangePasswordPage';
import WishlistPage from './pages/shop/WishlistPage';
import PaymentCallbackPage from './pages/shop/PaymentCallbackPage';
import CustomerSupportPage from './pages/shop/CustomerSupportPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import ProductVariantsPage from './pages/admin/ProductVariantsPage';
import InventoryPage from './pages/admin/InventoryPage';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import UsersPage from './pages/admin/UsersPage';
import ChatDashboardPage from './pages/admin/ChatDashboardPage';
import ReportsPage from './pages/admin/ReportsPage';
import AbandonedCartsPage from './pages/admin/AbandonedCartsPage';
import ProductBehaviorPage from './pages/admin/ProductBehaviorPage';
import VouchersPage from './pages/admin/VouchersPage';

// Test Pages

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ChatProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
            {/* --- USER ROUTES (Khách hàng) --- */}
            <Route path="/" element={<ShopLayout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ProductListPage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/settings" element={<AccountSettingsPage />} />
              <Route path="profile/change-password" element={<ChangePasswordPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="payment-callback" element={<PaymentCallbackPage />} />
              <Route path="cham-soc-khach-hang" element={<CustomerSupportPage />} />
            </Route>

            {/* --- AUTH ROUTES --- */}
            <Route path="/login" element={<LoginPage />} />

            {/* --- ADMIN ROUTES (Bảo vệ bởi ProtectedRoute) --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />
              <Route path="products/:id/variants" element={<ProductVariantsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="abandoned-carts" element={<AbandonedCartsPage />} />
              <Route path="product-behavior" element={<ProductBehaviorPage />} />
              <Route path="vouchers" element={<VouchersPage />} />
              <Route path="chat" element={<ChatDashboardPage />} />
            </Route>

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* Admin Chat is now embedded inline in CustomerSupportPage */}
          <AiChatPopup />
        </BrowserRouter>
        <ToastContainer 
          position="top-center" 
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        </ChatProvider>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
  );
}

export default App;