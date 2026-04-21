import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/products?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch product');
  }
});

export const fetchMyProducts = createAsyncThunk('products/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/my-products');
    return res.data.products;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch your products');
  }
});

export const createProduct = createAsyncThunk('products/create', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create product');
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update product');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
  }
});

export const addReview = createAsyncThunk('products/addReview', async ({ id, data }, { rejectWithValue }) => {
  try {
    await api.post(`/products/${id}/reviews`, data);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add review');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    myProducts: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProductError(state) { state.error = null; },
    clearProduct(state) { state.product = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.product = action.payload; })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchMyProducts.fulfilled, (state, action) => { state.myProducts = action.payload; })

      .addCase(createProduct.fulfilled, (state, action) => { state.myProducts.unshift(action.payload); })

      .addCase(updateProduct.fulfilled, (state, action) => {
        state.myProducts = state.myProducts.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.myProducts = state.myProducts.filter((p) => p._id !== action.payload);
        state.products = state.products.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearProductError, clearProduct } = productSlice.actions;
export default productSlice.reducer;
