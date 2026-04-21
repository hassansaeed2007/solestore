import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, clearError } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHome, FiArrowRight } from 'react-icons/fi';

const SellerLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'seller') {
      navigate('/seller');
    } else if (user.role === 'customer') {
      toast.error('This is the seller portal. Please use Customer Login.');
      dispatch(logout());
    } else if (user.role === 'admin') {
      toast.error('This is the seller portal. Please use Admin Login.');
      dispatch(logout());
    }
  }, [user, navigate, dispatch]);

  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a1f' }}>
      {/* Left — luxury image */}
      <div className="hide-mobile" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=90" alt="Luxury Shoes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,10,31,0.7) 0%,rgba(10,10,31,0.3) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '3rem' }}>
          <div style={{ borderLeft: '3px solid #c9a96e', paddingLeft: '1.2rem', marginBottom: '2rem' }}>
            <p style={{ color: '#c9a96e', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Seller Portal</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Grow Your<br />Shoe Business</h2>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Add Products', 'Track Orders', 'Earn Revenue'].map((t) => (
              <div key={t} style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)', borderRadius: 8, padding: '0.5rem 0.9rem', fontSize: '0.75rem', color: '#c9a96e', fontWeight: 600 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', background: '#0d0d14' }}>
        {/* Top bar */}
        <div style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
          <Link to="/" style={{ fontWeight: 800, fontSize: '1rem', color: 'white', textDecoration: 'none' }}>
            👟 <span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SoleStore</span>
          </Link>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textDecoration: 'none', padding: '0.35rem 0.8rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#c9a96e'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            <FiHome size={13} /> Home
          </Link>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <p style={{ color: '#c9a96e', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.8rem', fontWeight: 600 }}>Welcome Back</p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.4rem' }}>Seller Login</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Access your seller dashboard</p>

            <form onSubmit={(e) => { e.preventDefault(); dispatch(login(form)); }}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-icon-wrap">
                  <FiMail className="icon" size={15} />
                  <input className="form-control" type="email" placeholder="seller@business.com"
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
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a1f', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', marginTop: '0.5rem', letterSpacing: '0.5px', boxShadow: '0 8px 24px rgba(201,169,110,0.3)', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,169,110,0.5)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,169,110,0.3)'; }}>
                {loading ? 'Signing in...' : <><span>Sign In to Dashboard</span><FiArrowRight size={15} /></>}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                New seller?{' '}<Link to="/register/seller" style={{ color: '#c9a96e', fontWeight: 700, textDecoration: 'none' }}>Apply for account</Link>
              </p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem' }}>
                Customer?{' '}<Link to="/login" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Customer login</Link>
                {' · '}<Link to="/login/admin" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Admin</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLoginPage;
