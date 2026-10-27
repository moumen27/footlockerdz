import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '../context/ThemeContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { LanguageProvider } from '../context/LanguageContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/layout/ScrollToTop';
import HomePage from '../pages/home/HomePage';
import ShopListingPage from '../pages/shop/ShopListingPage';
import ProductDetailPage from '../pages/product/ProductDetailPage';
import FavoritesPage from '../pages/favorites/FavoritesPage';
import AuthPage from '../pages/auth/AuthPage';
import BrandsPage from '../pages/brands/BrandsPage';
import BrandDetailPage from '../pages/brands/BrandDetailPage';
import CartPage from '../pages/cart/CartPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import CheckoutSuccessPage from '../pages/checkout/CheckoutSuccessPage';
import CartDrawer from '../components/cart/CartDrawer';
import NotFoundPage from '../pages/error/NotFoundPage';
import VerifyPage from '../pages/auth/VerifyPage';
import PublicLayout from '../layouts/PublicLayout';
import AccountLayout from '../layouts/AccountLayout';
import AccountOverviewPage from '../pages/account/AccountOverviewPage';
import AccountOrdersPage from '../pages/account/AccountOrdersPage';
import AccountOrderDetailPage from '../pages/account/AccountOrderDetailPage';
import AccountAddressesPage from '../pages/account/AccountAddressesPage';
import AccountSettingsPage from '../pages/account/AccountSettingsPage';
import AccountReviewsPage from '../pages/account/AccountReviewsPage';
import AdminRoute from '../routes/AdminRoute';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from '../pages/admin/AdminOrderDetailPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminProductEditPage from '../pages/admin/AdminProductEditPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminBannersPage from '../pages/admin/AdminBannersPage';
import AdminBrandsPage from '../pages/admin/AdminBrandsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminTranslationsPage from '../pages/admin/AdminTranslationsPage';
import AdminReviewsModerationPage from '../pages/admin/AdminReviewsModerationPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <WishlistProvider>
                <CartProvider>
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <ScrollToTop />
                    <AuthProvider>
                      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
                        <Routes>
                          {/* Routes Publiques avec Layout Public */}
                          <Route element={<PublicLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/shop" element={<ShopListingPage />} />
                            <Route path="/shop/:category" element={<ShopListingPage />} />
                            <Route path="/sale" element={<ShopListingPage forceFilter="sale" />} />
                            <Route path="/new" element={<ShopListingPage forceFilter="new" />} />
                            <Route path="/brands" element={<BrandsPage />} />
                            <Route path="/brands/:brandSlug" element={<BrandDetailPage />} />
                            <Route path="/product/:slug" element={<ProductDetailPage />} />
                            <Route path="/favorites" element={<FavoritesPage />} />
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/reset/:token" element={<AuthPage />} />
                            <Route path="/verify/:token" element={<VerifyPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                            <Route path="/account" element={<AccountLayout />}>
                              <Route index element={<AccountOverviewPage />} />
                              <Route path="orders" element={<AccountOrdersPage />} />
                              <Route path="orders/:id" element={<AccountOrderDetailPage />} />
                              <Route path="addresses" element={<AccountAddressesPage />} />
                              <Route path="reviews" element={<AccountReviewsPage />} />
                              <Route path="settings" element={<AccountSettingsPage />} />
                            </Route>
                            <Route path="*" element={<NotFoundPage />} />
                          </Route>
                          
                          {/* Admin Routes (Sans Header/Footer client) */}
                          <Route path="/admin" element={<AdminRoute />}>
                            <Route element={<AdminLayout />}>
                              <Route index element={<AdminDashboardPage />} />
                              <Route path="users" element={<AdminUsersPage />} />
                              <Route path="orders" element={<AdminOrdersPage />} />
                              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                              <Route path="products" element={<AdminProductsPage />} />
                              <Route path="products/new" element={<AdminProductEditPage />} />
                              <Route path="products/:id" element={<AdminProductEditPage />} />
                              <Route path="brands" element={<AdminBrandsPage />} />
                              <Route path="settings" element={<AdminSettingsPage />} />
                              <Route path="banners" element={<AdminBannersPage />} />
                              <Route path="moderation" element={<AdminReviewsModerationPage />} />
                            </Route>
                          </Route>
                        </Routes>
                        <ToastContainer position="bottom-right" theme="dark" />
                      </div>
                    </AuthProvider>
                  </BrowserRouter>
                </CartProvider>
              </WishlistProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
