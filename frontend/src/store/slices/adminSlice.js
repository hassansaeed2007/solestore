import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAdminStats = createAsyncThunk('admin/stats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/stats');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAllUsers = createAsyncThunk('admin/users', async (role, { rejectWithValue }) => {
  try {
    const query = role ? `?role=${role}` : '';
    const res = await api.get(`/admin/users${query}`);
    return res.data.users;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/users/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchSellerRequests = createAsyncThunk('admin/sellerRequests', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/seller-requests');
    return res.data.sellers;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const approveSeller = createAsyncThunk('admin/approveSeller', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/admin/seller-requests/${id}/approve`);
    return res.data.user;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const rejectSeller = createAsyncThunk('admin/rejectSeller', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/admin/seller-requests/${id}/reject`, { reason });
    return res.data.user;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAllOrders = createAsyncThunk('admin/orders', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/orders?${query}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateOrderStatus = createAsyncThunk('admin/updateOrder', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null, users: [], orders: [], sellerRequests: [],
    loading: false, error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.fulfilled, (state, action) => { state.stats = action.payload.stats; })
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(fetchAllUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(fetchSellerRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchSellerRequests.fulfilled, (state, action) => { state.loading = false; state.sellerRequests = action.payload; })
      .addCase(fetchSellerRequests.rejected, (state) => { state.loading = false; })
      .addCase(approveSeller.fulfilled, (state, action) => {
        state.sellerRequests = state.sellerRequests.filter((s) => s._id !== action.payload._id);
        if (state.stats) state.stats.pendingSellers = Math.max(0, (state.stats.pendingSellers || 1) - 1);
      })
      .addCase(rejectSeller.fulfilled, (state, action) => {
        state.sellerRequests = state.sellerRequests.filter((s) => s._id !== action.payload._id);
        if (state.stats) state.stats.pendingSellers = Math.max(0, (state.stats.pendingSellers || 1) - 1);
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.orders = action.payload.orders; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map((o) => o._id === action.payload._id ? action.payload : o);
      });
  },
});

export default adminSlice.reducer;
