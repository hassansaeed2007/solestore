import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const saveAuth = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
};

// ── Customer OTP flow ──────────────────────────────────
export const sendCustomerOTP = createAsyncThunk('auth/sendCustomerOTP', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register/customer/send-otp', data);
    return { ...res.data, email: data.email };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to send OTP');
  }
});

export const verifyCustomerOTP = createAsyncThunk('auth/verifyCustomerOTP', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register/customer/verify-otp', data);
    saveAuth(res.data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Invalid code');
  }
});

// ── Seller OTP flow ────────────────────────────────────
export const sendSellerOTP = createAsyncThunk('auth/sendSellerOTP', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register/seller/send-otp', data);
    return { ...res.data, email: data.email };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to send OTP');
  }
});

export const verifySellerOTP = createAsyncThunk('auth/verifySellerOTP', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register/seller/verify-otp', data);
    saveAuth(res.data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Invalid code');
  }
});

export const resendOTP = createAsyncThunk('auth/resendOTP', async (email, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to resend');
  }
});
// ── Login ──────────────────────────────────────────────
export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    saveAuth(res.data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    loading: false,
    error: null,
    otpSent: false,
    otpEmail: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.otpSent = false;
      state.otpEmail = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) { state.error = null; },
    resetOTP(state) { state.otpSent = false; state.otpEmail = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };
    const authed = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.otpSent = false;
    };

    builder
      // Send OTP
      .addCase(sendCustomerOTP.pending, pending)
      .addCase(sendCustomerOTP.fulfilled, (state, action) => {
        state.loading = false; state.otpSent = true; state.otpEmail = action.payload.email;
      })
      .addCase(sendCustomerOTP.rejected, rejected)

      .addCase(sendSellerOTP.pending, pending)
      .addCase(sendSellerOTP.fulfilled, (state, action) => {
        state.loading = false; state.otpSent = true; state.otpEmail = action.payload.email;
      })
      .addCase(sendSellerOTP.rejected, rejected)

      // Verify OTP
      .addCase(verifyCustomerOTP.pending, pending)
      .addCase(verifyCustomerOTP.fulfilled, authed)
      .addCase(verifyCustomerOTP.rejected, rejected)

      .addCase(verifySellerOTP.pending, pending)
      .addCase(verifySellerOTP.fulfilled, authed)
      .addCase(verifySellerOTP.rejected, rejected)

      // Resend
      .addCase(resendOTP.pending, pending)
      .addCase(resendOTP.fulfilled, (state) => { state.loading = false; })
      .addCase(resendOTP.rejected, rejected)

      // Login
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, authed)
      .addCase(login.rejected, rejected);
  },
});

export const { logout, clearError, resetOTP } = authSlice.actions;
export default authSlice.reducer;
