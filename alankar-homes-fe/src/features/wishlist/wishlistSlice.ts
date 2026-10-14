import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { logout } from '../auth/authSlice';
import { addToWishlistApi, fetchWishlist, removeFromWishlistApi } from '../shop/shopService';
import { getErrorMessage } from '../../utils/helpers';

interface WishlistState {
  // Only ids are kept here so every heart on the page can light up instantly
  ids: number[];
  loaded: boolean;
}

const initialState: WishlistState = {
  ids: [],
  loaded: false,
};

export const loadWishlist = createAsyncThunk('wishlist/load', async () => {
  const products = await fetchWishlist();
  return products.map((p) => p.id);
});

export const toggleWishlist = createAsyncThunk<
  { productId: number; saved: boolean },
  number,
  { state: { wishlist: WishlistState }; rejectValue: string }
>('wishlist/toggle', async (productId, { getState, rejectWithValue }) => {
  // The pending reducer has already flipped the heart, so this is the state we want to save
  const shouldSave = getState().wishlist.ids.includes(productId);
  try {
    if (shouldSave) await addToWishlistApi(productId);
    else await removeFromWishlistApi(productId);
    return { productId, saved: shouldSave };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const flip = (state: WishlistState, productId: number) => {
  state.ids = state.ids.includes(productId)
    ? state.ids.filter((id) => id !== productId)
    : [productId, ...state.ids];
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWishlist.fulfilled, (state, action) => {
        state.ids = action.payload;
        state.loaded = true;
      })
      // Flip the heart straight away, and flip it back if the server says no
      .addCase(toggleWishlist.pending, (state, action) => {
        flip(state, action.meta.arg);
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        flip(state, action.meta.arg);
      })
      .addCase(logout, () => initialState);
  },
});

export default wishlistSlice.reducer;
