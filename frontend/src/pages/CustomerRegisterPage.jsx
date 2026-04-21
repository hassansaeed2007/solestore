import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendCustomerOTP, verifyCustomerOTP, clearError, resetOTP } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';
import OTPVerify from '../components/OTPVerify';

const CustomerRegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, otpSent, otpEmail } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user?.role === 'customer') navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);
  useEffect(() => () => dispatch(resetOTP()), [dispatch]);

  const handleSend = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    dispatch(sendCustomerOTP({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', padding: '0' }}>
      {/* Top bar */}
      <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 800, fontSize: '1rem', textDecoration: 'none' }}>
          👟 <span style={{ background: 'linear-gradient(135deg,#7c6fff,#ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SoleStore</span>
        </Link>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray)', fontSize: '0.85rem', textDecoration: 'none', padding: '0.4rem 0.9rem', border: '1px solid var(--border)', borderRadius: 50 }}>
          <FiHome size={13} /> Home
        </Link>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
      <div className="orb" style={{ width: 500, height: 500, background: '#7c6fff', top: '-20%', right: '-15%' }} />
      <div className="orb" style={{ width: 400, height: 400, background: '#ff6b8a', bottom: '-20%', left: '-15%' }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👟</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.3rem' }}>
            {otpSent ? 'Verify Your Email' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.88rem' }}>
            {otpSent ? 'Enter the code sent to your email' : 'Join SoleStore and start shopping'}
          </p>
        </div>

        <div className="card" style={{ padding: '2rem', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          {!otpSent ? (
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-icon-wrap">
                  <FiUser className="icon" size={15} />
                  <input className="form-control" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-icon-wrap">
                  <FiMail className="icon" size={15} />
                  <input className="form-control" type="email" placeholder="you@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--gray)', marginTop: '0.3rem' }}>📧 Verification code will be sent here</p>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-wrap" style={{ position: 'relative' }}>
                  <FiLock className="icon" size={15} />
                  <input className="form-control" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}>
                    {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-icon-wrap">
                  <FiLock className="icon" size={15} />
                  <input className="form-control" type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', borderRadius: 12 }}>
                {loading ? 'Sending code...' : '📧 Send Verification Code'}
              </button>
            </form>
          ) : (
            <OTPVerify email={otpEmail} onVerify={(otp) => dispatch(verifyCustomerOTP({ email: otpEmail, otp }))} onBack={() => dispatch(resetOTP())} loading={loading} />
          )}
        </div>

        {!otpSent && (
          <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.88rem', color: 'var(--gray)' }}>
            Already have an account?{' '}<Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 700 }}>Sign in</Link>
            {' · '}<Link to="/register/seller" style={{ color: 'rgba(255,255,255,0.4)' }}>Become a Seller</Link>
          </p>
        )}
      </div>
      </div>
    </div>
  );
};

export default CustomerRegisterPage;
