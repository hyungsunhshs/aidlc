import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, Menu } from '../types';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menu: Menu; quantity: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { menuId: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { menuId: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CART_STORAGE_KEY = 'table-order-cart';

const calculateTotals = (items: CartItem[]): { totalAmount: number; itemCount: number } => {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { totalAmount, itemCount };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menu, quantity } = action.payload;
      const existingIndex = state.items.findIndex((item) => item.menuId === menu.id);

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          {
            menuId: menu.id,
            menuName: menu.name,
            price: menu.price,
            quantity,
            imageUrl: menu.imageUrl,
          },
        ];
      }

      return { items: newItems, ...calculateTotals(newItems) };
    }

    case 'UPDATE_QUANTITY': {
      const { menuId, quantity } = action.payload;
      if (quantity <= 0) {
        const newItems = state.items.filter((item) => item.menuId !== menuId);
        return { items: newItems, ...calculateTotals(newItems) };
      }

      const newItems = state.items.map((item) =>
        item.menuId === menuId ? { ...item, quantity } : item
      );
      return { items: newItems, ...calculateTotals(newItems) };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.menuId !== action.payload.menuId);
      return { items: newItems, ...calculateTotals(newItems) };
    }

    case 'CLEAR_CART':
      return { items: [], totalAmount: 0, itemCount: 0 };

    case 'LOAD_CART':
      return { items: action.payload, ...calculateTotals(action.payload) };

    default:
      return state;
  }
};

interface CartContextType {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  addItem: (menu: Menu, quantity?: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  removeItem: (menuId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalAmount: 0,
    itemCount: 0,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart) as CartItem[];
        dispatch({ type: 'LOAD_CART', payload: items });
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (menu: Menu, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { menu, quantity } });
  };

  const updateQuantity = (menuId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuId, quantity } });
  };

  const removeItem = (menuId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { menuId } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalAmount: state.totalAmount,
        itemCount: state.itemCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
