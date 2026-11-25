import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StartSessionPage } from './pages/StartSessionPage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StartSessionPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<OrderHistoryPage />} />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
