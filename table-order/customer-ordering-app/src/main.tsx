import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { CartProvider } from './contexts/CartContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>
);
