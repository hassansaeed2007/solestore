import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { fetchMyProducts, createProduct, updateProduct, deleteProduct } from '../store/slices/productSlice';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
  FiBarChart2, FiPackage, FiShoppingBag, FiMessageCircle,
  FiPlus, FiEdit2, FiTrash2, FiX, FiLogOut, FiDollarSign,
  FiCheck, FiMail, FiTrendingUp, FiMenu,
} from 'react-icons/fi';

const CATS = ['sneakers','boots','sandals','formal','sports','casual','kids'];
const MENU = [
  { key: 'overview',  label: 'Overview',    icon: <FiBarChart2 size={17} /> },
  { key: 'orders',    label: 'Orders',      icon: <FiShoppingBag size={17} /> },
  { key: 'products',  label: 'My Products', icon: <FiPackage size={17} /> },
  { key: 'messages',  label: 'Messages',    icon: <FiMessageCircle size={17} />, badge: true },
];
const STATUS = {
  pending:    { bg: 'rgba(201,169,110,0.15)', color: '#c9a96e' },
  processing: { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  shipped:    { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa' },
  delivered:  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
  cancelled:  { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
};

// ── Product Modal ───────────────────────────────────────
const EMPTY = { name: '', description: '', price: '', category: 'sneakers', brand: '', stock: '', image: null };
const ProductModal = ({ initial, onClose, onSave, loading }) => {
  const [form, setForm] = useState(initial || EMPTY);
  const [preview, setPreview] = useState(initial?.imageUrl || null);
  const isEdit = !!initial?._id;
  const handleImg = (e) => { const f = e.target.files[0]; if (f) { setForm({ ...form, image: f }); setPreview(URL.createObjectURL(f)); } };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && !form.image) { toast.error('Product image is required'); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && k !== 'imageUrl') fd.append(k, v); });
    onSave(fd, isEdit ? initial._id : null);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#0f0f0f', border: '1px solid rgba(201,169,110,0.25)', borderRadius: 0, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(201,169,110,0.12)' }}>
          <div>
            <h2 style={{ fontWeight: 800, color: 'white', fontSize: '1.1rem', fontFamily: "'Playfair Display',serif" }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{isEdit ? 'Update product details' : 'Fill in details to list your product'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.5rem', borderRadius: 8, display: 'flex' }}><FiX size={17} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Product Name</label><input className="form-control" placeholder="e.g. Nike Air Max 270" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Description</label><textarea className="form-control" rows={3} placeholder="Describe your product..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Price (USD)</label><input className="form-control" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
            <div className="form-group"><label>Stock</label><input className="form-control" type="number" min="0" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Category</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Brand</label><input className="form-control" placeholder="e.g. Nike, Adidas" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required /></div>
          </div>
          <div className="form-group">
            <label>Product Image {isEdit && <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem' }}>(leave empty to keep current)</span>}</label>
            <input type="file" accept="image/*" onChange={handleImg} className="form-control" style={{ padding: '0.5rem' }} />
            {preview && <div style={{ marginTop: '0.8rem', overflow: 'hidden', height: 130, background: '#111' }}><img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(201,169,110,0.1)' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.7rem 1.4rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', borderRadius: 0, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '0.7rem 1.8rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a0a', border: 'none', borderRadius: 0, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.3px' }}>
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Dashboard ──────────────────────────────────────
const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myProducts, loading: prodLoading } = useSelector((s) => s.products);
  const [active, setActive] = useState('overview');
  const [modal, setModal] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { dispatch(fetchMyProducts()); }, [dispatch]);
  const loadStats = useCallback(async () => { try { const r = await api.get('/seller/stats'); setStats(r.data.stats); } catch {} }, []);
  const loadOrders = useCallback(async () => { setLoadingData(true); try { const r = await api.get('/seller/orders'); setOrders(r.data.orders || []); } catch {} setLoadingData(false); }, []);
  const loadMessages = useCallback(async () => { setLoadingData(true); try { const r = await api.get('/seller/messages'); setMessages(r.data.messages || []); } catch {} setLoadingData(false); }, []);

  useEffect(() => {
    loadStats();
    if (active === 'orders') loadOrders();
    if (active === 'messages') loadMessages();
  }, [active, loadStats, loadOrders, loadMessages]);

  const handleSave = async (fd, id) => {
    const r = id ? await dispatch(updateProduct({ id, formData: fd })) : await dispatch(createProduct(fd));
    if (!r.error) { toast.success(id ? 'Updated!' : 'Product added!'); setModal(null); loadStats(); dispatch(fetchMyProducts()); }
    else toast.error(r.payload || 'Failed');
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const r = await dispatch(deleteProduct(id));
    if (!r.error) { toast.success('Deleted'); loadStats(); } else toast.error(r.payload || 'Failed');
  };
  const handleMarkRead = async (id) => {
    try { await api.put(`/seller/messages/${id}/read`); setMessages((p) => p.map((m) => m._id === id ? { ...m, isRead: true } : m)); loadStats(); } catch {}
  };
  const unreadCount = messages.filter((m) => !m.isRead).length;

  const G = '#c9a96e'; // gold

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.4rem 1.5rem', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.1rem', color: 'white', lineHeight: 1 }}>
          Sole<span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Store</span>
        </p>
        <p style={{ fontSize: '0.65rem', color: 'rgba(201,169,110,0.5)', marginTop: '0.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Seller Portal</p>
      </div>

      {/* User */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0a0a0a', fontSize: '0.9rem', flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(201,169,110,0.5)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.sellerInfo?.businessName || 'Seller'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.5rem 0' }}>
        {MENU.map((item) => (
          <button key={item.key} onClick={() => { setActive(item.key); setSidebarOpen(false); }} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.8rem 1.5rem', background: active === item.key ? 'rgba(201,169,110,0.1)' : 'transparent',
            border: 'none', borderLeft: `3px solid ${active === item.key ? G : 'transparent'}`,
            color: active === item.key ? G : 'rgba(255,255,255,0.45)',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: active === item.key ? 700 : 400,
            textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit',
          }}
            onMouseEnter={(e) => { if (active !== item.key) { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
            onMouseLeave={(e) => { if (active !== item.key) { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent'; } }}>
            <span style={{ color: active === item.key ? G : 'rgba(201,169,110,0.4)' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && unreadCount > 0 && (
              <span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a0a', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Quick stats */}
      <div style={{ padding: '0.8rem 1.5rem', borderTop: '1px solid rgba(201,169,110,0.08)', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {[{ l: 'Products', v: stats?.totalProducts ?? '—' }, { l: 'Orders', v: stats?.totalOrders ?? '—' }].map((s) => (
            <div key={s.l} style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.1)', padding: '0.6rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 900, fontSize: '1.1rem', color: G }}>{s.v}</p>
              <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '1rem 1.5rem' }}>
        <button onClick={() => dispatch(logout())} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s', borderRadius: 0 }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}>
          <FiLogOut size={14} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>

      {/* Mobile top bar */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#0a0a0a', borderBottom: '1px solid rgba(201,169,110,0.1)', zIndex: 300, alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }} className="seller-mobile-bar">
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: 'white', fontSize: '1rem' }}>
          Sole<span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Store</span>
        </p>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', color: G, padding: '0.5rem', cursor: 'pointer', display: 'flex', borderRadius: 0 }}>
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside style={{ width: 280, background: '#0d0d0d', borderRight: '1px solid rgba(201,169,110,0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }} className="seller-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 250 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setSidebarOpen(false)} />
          <aside style={{ position: 'absolute', top: 0, left: 0, width: 240, height: '100vh', background: '#0d0d0d', borderRight: '1px solid rgba(201,169,110,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1 }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', overflowX: 'hidden', background: '#0a0a0a', minWidth: 0 }}>

        {/* OVERVIEW */}
        {active === 'overview' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
              <p style={{ color: 'rgba(201,169,110,0.5)', fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Seller Dashboard</p>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', fontFamily: "'Playfair Display',serif", lineHeight: 1.1 }}>
                Welcome back,<br />
                <span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                {user?.sellerInfo?.businessName && `${user.sellerInfo.businessName} · `}Here's your store overview
              </p>
            </div>

            {/* Stat cards — 2 rows */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', marginBottom: '2rem', background: 'rgba(201,169,110,0.08)' }}>
              {[
                { icon: <FiPackage size={20} />,    label: 'Total Products',  value: stats?.totalProducts ?? '—',                          sub: 'Listed in store' },
                { icon: <FiShoppingBag size={20} />, label: 'Total Orders',   value: stats?.totalOrders ?? '—',                            sub: 'All time' },
                { icon: <FiDollarSign size={20} />,  label: 'Revenue',        value: stats ? `$${stats.totalRevenue.toFixed(2)}` : '—',    sub: 'Total earned' },
                { icon: <FiTrendingUp size={20} />,  label: 'Units Sold',     value: stats?.totalSold ?? '—',                              sub: 'Products sold' },
                { icon: <FiMail size={20} />,        label: 'Unread Messages',value: stats?.unreadMessages ?? '—',                         sub: 'From customers' },
              ].map((s) => (
                <div key={s.label} style={{ background: '#0a0a0a', padding: '1.4rem', cursor: 'default', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0f0f0f'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0a0a0a'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, lineHeight: 1.4 }}>{s.label}</p>
                    <div style={{ color: 'rgba(201,169,110,0.35)', flexShrink: 0 }}>{s.icon}</div>
                  </div>
                  <p style={{ fontWeight: 900, fontSize: '1.8rem', color: '#c9a96e', lineHeight: 1, fontFamily: "'Playfair Display',serif", marginBottom: '0.3rem' }}>{s.value}</p>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Recent products */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: 'rgba(201,169,110,0.5)', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Inventory</p>
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', fontFamily: "'Playfair Display',serif" }}>Recent Products</h2>
              </div>
              <button onClick={() => setActive('products')} style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', color: '#c9a96e', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit', padding: '0.45rem 1rem', letterSpacing: '0.3px', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,169,110,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201,169,110,0.08)'}>
                View All →
              </button>
            </div>

            {myProducts.length === 0 ? (
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,169,110,0.1)', padding: '3rem', textAlign: 'center' }}>
                <FiPackage size={40} style={{ color: 'rgba(201,169,110,0.3)', marginBottom: '1rem' }} />
                <p style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>No products yet</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>Add your first product to start selling</p>
                <button onClick={() => setActive('products')} style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a0a', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiPlus size={14} /> Add Product
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(201,169,110,0.08)' }}>
                {myProducts.slice(0, 6).filter(p => p.image?.url).map((p) => (
                  <div key={p._id} style={{ background: '#0a0a0a', overflow: 'hidden', transition: 'background 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#0f0f0f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#0a0a0a'}>
                    <div style={{ height: 140, overflow: 'hidden', background: '#111', position: 'relative' }}>
                      <img src={p.image?.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
                      <div style={{ position: 'absolute', top: 8, right: 8, background: p.stock > 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.5rem', letterSpacing: '0.5px' }}>
                        {p.stock > 0 ? `${p.stock} LEFT` : 'OUT'}
                      </div>
                    </div>
                    <div style={{ padding: '0.9rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'white', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                      <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem', textTransform: 'capitalize' }}>{p.brand} · {p.category}</p>
                      <p style={{ fontWeight: 900, color: '#c9a96e', fontSize: '1rem', fontFamily: "'Playfair Display',serif" }}>${p.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {active === 'orders' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: G, fontSize: '0.68rem', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Sales</p>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: "'Playfair Display',serif" }}>Customer Orders</h1>
            </div>
            {loadingData ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
              : orders.length === 0 ? (
                <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,169,110,0.1)', padding: '4rem', textAlign: 'center' }}>
                  <FiShoppingBag size={40} style={{ color: 'rgba(201,169,110,0.3)', marginBottom: '1rem' }} />
                  <p style={{ color: 'white', fontWeight: 700, marginBottom: '0.4rem' }}>No orders yet</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>Orders will appear here when customers buy your products.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(201,169,110,0.08)' }}>
                  {orders.map((order) => {
                    const s = STATUS[order.status] || STATUS.pending;
                    return (
                      <div key={order._id} style={{ background: '#0a0a0a', padding: '1.2rem', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#0d0d0d'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#0a0a0a'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                          <div>
                            <p style={{ fontWeight: 800, color: 'white', fontFamily: 'monospace', fontSize: '0.9rem' }}>#{order._id.slice(-8).toUpperCase()}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '0.1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ background: s.bg, color: s.color, padding: '0.25rem 0.8rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>{order.status}</span>
                            <span style={{ fontWeight: 900, color: G, fontSize: '1rem', fontFamily: "'Playfair Display',serif" }}>${order.sellerTotal?.toFixed(2)}</span>
                          </div>
                        </div>
                        <div style={{ background: '#0d0d0d', padding: '0.7rem 1rem', marginBottom: '0.8rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                          {[{ l: 'Customer', v: order.user?.name }, { l: 'Email', v: order.user?.email }, { l: 'Ship To', v: `${order.shippingAddress?.city}, ${order.shippingAddress?.country}` }].map((f) => (
                            <div key={f.l}>
                              <p style={{ fontSize: '0.62rem', color: 'rgba(201,169,110,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>{f.l}</p>
                              <p style={{ fontWeight: 600, fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>{f.v}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {order.items.map((item) => (
                            <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#111', padding: '0.4rem 0.7rem', maxWidth: 200, overflow: 'hidden' }}>
                              <img src={item.image} alt={item.name} style={{ width: 30, height: 30, objectFit: 'cover', flexShrink: 0 }} />
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.75rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>×{item.quantity} · ${item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* PRODUCTS */}
        {active === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ color: G, fontSize: '0.68rem', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Inventory</p>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: "'Playfair Display',serif" }}>My Products</h1>
              </div>
              <button onClick={() => setModal('add')} style={{ padding: '0.7rem 1.4rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a0a', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.3px' }}>
                <FiPlus size={15} /> Add Product
              </button>
            </div>
            {prodLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
              : myProducts.length === 0 ? (
                <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,169,110,0.1)', padding: '4rem', textAlign: 'center' }}>
                  <FiPackage size={40} style={{ color: 'rgba(201,169,110,0.3)', marginBottom: '1rem' }} />
                  <p style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>No products yet</p>
                  <button onClick={() => setModal('add')} style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a0a', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FiPlus size={14} /> Add First Product
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid rgba(201,169,110,0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0a0a0a', tableLayout: 'fixed', minWidth: 600 }}>
                    <colgroup><col style={{ width: '38%' }} /><col style={{ width: '14%' }} /><col style={{ width: '13%' }} /><col style={{ width: '10%' }} /><col style={{ width: '13%' }} /><col style={{ width: '12%' }} /></colgroup>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(201,169,110,0.1)', background: '#0d0d0d' }}>
                        {['Product','Category','Price','Stock','Rating','Actions'].map((h) => (
                          <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, color: 'rgba(201,169,110,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myProducts.map((p, i) => (
                        <tr key={p._id} style={{ borderBottom: i < myProducts.length - 1 ? '1px solid rgba(201,169,110,0.06)' : 'none', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#0d0d0d'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '0.8rem 1rem', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                              <div style={{ width: 38, height: 38, overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                                <img src={p.image?.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>{p.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <span style={{ background: 'rgba(201,169,110,0.08)', color: G, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'capitalize', letterSpacing: '0.3px' }}>{p.category}</span>
                          </td>
                          <td style={{ padding: '0.8rem 1rem', fontWeight: 800, fontSize: '0.9rem', color: G, fontFamily: "'Playfair Display',serif" }}>${p.price.toFixed(2)}</td>
                          <td style={{ padding: '0.8rem 1rem', fontWeight: 700, fontSize: '0.88rem', color: p.stock > 0 ? '#34d399' : '#f87171' }}>{p.stock}</td>
                          <td style={{ padding: '0.8rem 1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>⭐ {p.averageRating.toFixed(1)} <span style={{ color: 'rgba(255,255,255,0.25)' }}>({p.numReviews})</span></td>
                          <td style={{ padding: '0.8rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button onClick={() => setModal({ ...p, imageUrl: p.image?.url })} style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.15)', color: G, padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,169,110,0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201,169,110,0.08)'}>
                                <FiEdit2 size={13} />
                              </button>
                              <button onClick={() => handleDelete(p._id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}

        {/* MESSAGES */}
        {active === 'messages' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: G, fontSize: '0.68rem', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Inbox</p>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: "'Playfair Display',serif" }}>Customer Messages</h1>
            </div>
            {loadingData ? <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
              : messages.length === 0 ? (
                <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,169,110,0.1)', padding: '4rem', textAlign: 'center' }}>
                  <FiMessageCircle size={40} style={{ color: 'rgba(201,169,110,0.3)', marginBottom: '1rem' }} />
                  <p style={{ color: 'white', fontWeight: 700, marginBottom: '0.4rem' }}>No messages yet</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>Customer messages will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(201,169,110,0.08)' }}>
                  {messages.map((msg) => (
                    <div key={msg._id} style={{ background: '#0a0a0a', padding: '1.2rem', borderLeft: `3px solid ${msg.isRead ? 'transparent' : G}`, transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#0d0d0d'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#0a0a0a'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem', flexShrink: 0 }}>
                              {msg.senderName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{msg.senderName}</p>
                                {!msg.isRead && <span style={{ background: G, color: '#0a0a0a', fontSize: '0.6rem', padding: '0.1rem 0.5rem', fontWeight: 900, letterSpacing: '0.5px' }}>NEW</span>}
                              </div>
                              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem' }}>{msg.sender?.email}</p>
                            </div>
                          </div>
                          {msg.productName && (
                            <p style={{ fontSize: '0.72rem', color: 'rgba(201,169,110,0.5)', marginBottom: '0.5rem' }}>About: <span style={{ color: G, fontWeight: 600 }}>{msg.productName}</span></p>
                          )}
                          <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>{msg.text}</p>
                          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem' }}>{new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                        {!msg.isRead && (
                          <button onClick={() => handleMarkRead(msg._id)} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0, fontFamily: 'inherit', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}>
                            <FiCheck size={12} /> Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

      </main>

      {modal && <ProductModal initial={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} loading={prodLoading} />}

      <style>{`
        @media (max-width: 640px) {
          .seller-sidebar { display: none !important; }
          .seller-mobile-bar { display: flex !important; }
          main { padding-top: 70px !important; }
        }
      `}</style>
    </div>
  );
};

export default SellerDashboard;
