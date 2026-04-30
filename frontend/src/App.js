import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import '@/App.css';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { UIProvider } from '@/context/UIContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import HomePage from '@/pages/HomePage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrdersPage from '@/pages/OrdersPage';
import FavoritesPage from '@/pages/FavoritesPage';
import AdminPage from '@/pages/AdminPage';
import Footer from '@/components/Footer';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <UIProvider>
        <div className="App">
          <BrowserRouter>
            <AnalyticsTracker />
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
            <Footer />
            <CartDrawer />
            <AuthModal />
          </BrowserRouter>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1c1e1b',
                color: '#f2f0e6',
                border: '1px solid #2d302a',
              },
            }}
          />
        </div>
        </UIProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
