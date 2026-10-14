import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../utils/constants';
import type { Product } from '../shop/shopTypes';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
};

const initialState: CartState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find((item) => item.productId === product.id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
        existing.price = product.price;
        existing.stock = product.stock;
      } else {
        state.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0] || null,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        });
      }
      saveCart(state.items);
    },
    setQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock));
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },
  },
});

export const { addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
