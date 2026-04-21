import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, clearError } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';

const CustomerLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  // After login, check role — only customer allowed here
  useEffect(() => {
    if (!user) return;
    if (user.role === 'customer') {
      navigate('/dashboard');
    } else if (user.role === 'seller') {
      toast.error('This is the customer portal. Please use Seller Login.');
      dispatch(logout());
    } else if (user.role === 'admin') {
      toast.error('This is the customer portal. Please use Admin Login.');
      dispatch(logout());
    }
  }, [user, navigate, dispatch]);

  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 800, fontSize: '1rem', textDecoration: 'none' }}>
          👟 <span style={{ background: 'linear-gradient(135deg,#7c6fff,#ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SoleStore</span>
        </Link>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray)', fontSize: '0.85rem', textDecoration: 'none', padding: '0.4rem 0.9rem', border: '1px solid var(--border)', borderRadius: 50 }}>
          <FiHome size={13} /> Home
        </Link>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
      {/* Left panel */}
      <div className="hide-mobile" style={{ flex: 1, background: 'var(--bg-2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div className="orb" style={{ width: 400, height: 400, background: '#7c6fff', top: '-10%', right: '-10%' }} />
        <div className="orb" style={{ width: 300, height: 300, background: '#ff6b8a', bottom: '-10%', left: '-10%' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '7rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 20px 40px rgba(124,111,255,0.5))' }} className="float">👟</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 800, color: 'white', marginBottom: '1rem', lineHeight: 1.1 }}>
            Welcome to<br /><span style={{ background: 'linear-gradient(135deg, #7c6fff, #ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SoleStore</span>
          </h1>
          <p style={{ color: 'var(--gray)', lineHeight: 1.8, maxWidth: 300, fontSize: '0.95rem' }}>Your premium destination for shoes. Thousands of styles, top brands, unbeatable prices.</p>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            {['50K+ Customers', '10K+ Products', '4.9★ Rating'].map((t) => (
              <span key={t} style={{ background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.25)', borderRadius: 50, padding: '0.35rem 0.9rem', fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #7c6fff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', boxShadow: '0 8px 24px rgba(124,111,255,0.4)' }}>
              <FiMail size={22} color="white" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.3rem' }}>Welcome back</h2>
            <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Sign in to your SoleStore account</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); dispatch(login(form)); }}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <FiMail className="icon" size={15} />
                <input className="form-control" type="email" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap" style={{ position: 'relative' }}>
                <FiLock className="icon" size={15} />
                <input className="form-control" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}>
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', borderRadius: 12, fontSize: '0.95rem', marginTop: '0.5rem' }}>
              {loading ? 'Signing in...' : <><span>Sign In</span><FiArrowRight /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.8rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray)' }}>
              New here?{' '}<Link to="/register/customer" style={{ color: 'var(--secondary)', fontWeight: 700 }}>Create free account</Link>
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray)', marginTop: '0.6rem' }}>
              <Link to="/login/seller" style={{ color: 'rgba(255,255,255,0.4)' }}>Seller Login</Link>
              {' · '}
              <Link to="/login/admin" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
