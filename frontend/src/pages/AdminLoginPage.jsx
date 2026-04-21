import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, clearError } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff, FiHome, FiArrowRight } from 'react-icons/fi';

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'customer') {
      toast.error('Access denied. This portal is for admins only.');
      dispatch(logout());
    } else if (user.role === 'seller') {
      toast.error('Access denied. This portal is for admins only.');
      dispatch(logout());
    }
  }, [user, navigate, dispatch]);

  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a1f' }}>
      {/* Left — luxury image */}
      <div className="hide-mobile" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900&q=90" alt="Luxury Shoes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(10,10,31,0.8) 0%,rgba(10,10,31,0.35) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '3rem' }}>
          <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: '1.2rem', marginBottom: '2rem' }}>
            <p style={{ color: '#f87171', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Restricted Access</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Admin<br />Control Panel</h2>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 320 }}>
            Authorized personnel only. All access is logged and monitored.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', background: '#0d0d14' }}>
        {/* Top bar */}
        <div style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" style={{ fontWeight: 800, fontSize: '1rem', color: 'white', textDecoration: 'none' }}>
            👟 <span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SoleStore</span>
          </Link>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textDecoration: 'none', padding: '0.35rem 0.8rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            <FiHome size={13} /> Home
          </Link>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            {/* Shield icon */}
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <FiShield size={22} color="#f87171" />
            </div>

            <p style={{ color: '#f87171', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.8rem', fontWeight: 600 }}>Restricted</p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.4rem' }}>Admin Portal</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Authorized personnel only</p>

            {/* Warning */}
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f87171', fontSize: '0.8rem' }}>
              ⚠️ This portal is for system administrators only.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); dispatch(login(form)); }}>
              <div className="form-group">
                <label>Admin Email</label>
                <div className="input-icon-wrap">
                  <FiMail className="icon" size={15} />
                  <input className="form-control" type="email" placeholder="admin@solestore.com"
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
                style={{ width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', marginTop: '0.5rem', boxShadow: '0 8px 24px rgba(239,68,68,0.3)', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(239,68,68,0.5)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,68,68,0.3)'; }}>
                {loading ? 'Authenticating...' : <><span>Access Admin Panel</span><FiArrowRight size={15} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
