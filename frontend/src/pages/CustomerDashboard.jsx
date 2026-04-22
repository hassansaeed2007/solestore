import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import useLogout from '../hooks/useLogout';
import LogoutConfirm from '../components/LogoutConfirm';
import { fetchCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
  FiShoppingBag, FiMessageCircle, FiSearch, FiLogOut,
  FiPackage, FiShoppingCart, FiStar, FiUser, FiBarChart2, FiMenu, FiX,
} from 'react-icons/fi';
import BackButton from '../components/BackButton';

const MENU = [
  { key: 'shop',     label: 'Shop',       icon: <FiSearch size={18} /> },
  { key: 'orders',   label: 'My Orders',  icon: <FiPackage size={18} /> },
  { key: 'inbox',    label: 'Inbox',      icon: <FiMessageCircle size={18} />, badge: true },
  { key: 'profile',  label: 'Profile',    icon: <FiUser size={18} /> },
];

const CATEGORIES = ['all', 'sneakers', 'boots', 'sandals', 'formal', 'sports', 'casual', 'kids'];
const STATUS_STYLE = {
  pending:    { bg: '#fff3cd', color: '#856404' },
  processing: { bg: '#d1ecf1', color: '#0c5460' },
  shipped:    { bg: '#e2e3e5', color: '#383d41' },
  delivered:  { bg: '#d4edda', color: '#155724' },
  cancelled:  { bg: '#f8d7da', color: '#721c24' },
};

const Stars = ({ rating }) => (
  <span>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(rating) ? '#ffc107' : '#ddd' }}>★</span>)}</span>
);

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart);
  const [active, setActive] = useState('shop');

  // Shop state
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Inbox state
  const [sentMessages, setSentMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [msgModal, setMsgModal] = useState(null); // { sellerId, sellerName, productName }
  const [msgText, setMsgText] = useState('');
  const { showConfirm, requestLogout, cancelLogout, confirmLogout } = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (keyword) params.append('keyword', keyword);
      if (category !== 'all') params.append('category', category);
      if (sort) params.append('sort', sort);
      const r = await api.get(`/products?${params}`);
      setProducts(r.data.products || []);
      setPagination(r.data.pagination);
    } catch {}
    setLoadingProducts(false);
  }, [page, keyword, category, sort]);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try { const r = await api.get('/orders/my-orders'); setOrders(r.data.orders || []); } catch {}
    setLoadingOrders(false);
  }, []);

  const loadMessages = useCallback(async () => {
    setLoadingMsgs(true);
    try {
      // Get messages sent by this customer (from all sellers)
      const r = await api.get('/customer/messages');
      setSentMessages(r.data.messages || []);
    } catch {}
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    if (active === 'shop') loadProducts();
    if (active === 'orders') loadOrders();
    if (active === 'inbox') loadMessages();
  }, [active, loadProducts, loadOrders, loadMessages]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadProducts(); };

  const handleAddToCart = async (productId) => {
    try {
      await api.post('/cart', { productId, quantity: 1 });
      dispatch(fetchCart());
      toast.success('Added to cart!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    try {
      await api.post(`/seller/${msgModal.sellerId}/message`, {
        text: msgText,
        productId: msgModal.productId,
        productName: msgModal.productName,
      });
      toast.success('Message sent!');
      setMsgModal(null);
      setMsgText('');
      if (active === 'inbox') loadMessages();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile top bar */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#0a0a0a', borderBottom: '1px solid rgba(201,169,110,0.1)', zIndex: 300, alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }} className="seller-mobile-bar">
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: 'white', fontSize: '1rem' }}>
          Sole<span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Store</span>
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {cartCount > 0 && (
            <Link to="/cart" style={{ position: 'relative', color: '#c9a96e', padding: '0.4rem', display: 'flex' }}>
              <FiShoppingCart size={20} />
              <span style={{ position: 'absolute', top: 0, right: 0, background: '#c9a96e', color: '#0a0a0a', borderRadius: '50%', width: 15, height: 15, fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{cartCount}</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', color: '#c9a96e', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>
      {/* ── Sidebar ── */}
      <aside style={{ width: 220, background: 'var(--bg-2)', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', borderRight: '1px solid var(--border)' }}>
        <div style={{ padding: '1.5rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontWeight: 800, fontSize: '1rem' }}>👟 SoleStore</p>
          <p style={{ fontSize: '0.72rem', opacity: 0.6 }}>Customer Portal</p>
        </div>
        <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.2 }}>{user?.name}</p>
              <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>Customer</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0.8rem 0' }}>
          {MENU.map((item) => (
            <button key={item.key} onClick={() => setActive(item.key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem',
              padding: '0.75rem 1.2rem', background: active === item.key ? 'rgba(233,69,96,0.2)' : 'transparent',
              border: 'none', color: active === item.key ? 'var(--secondary)' : 'rgba(255,255,255,0.75)',
              borderLeft: active === item.key ? '3px solid var(--secondary)' : '3px solid transparent',
              cursor: 'pointer', fontSize: '0.88rem', fontWeight: active === item.key ? 700 : 400,
              textAlign: 'left', transition: 'all 0.15s',
            }}>
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.key === 'shop' && cartCount > 0 && (
                <span style={{ background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>
              )}
            </button>
          ))}
          <button onClick={() => navigate('/cart')} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.75rem 1.2rem', background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: '0.88rem', textAlign: 'left',
            borderLeft: '3px solid transparent',
          }}>
            <FiShoppingCart size={18} />
            <span style={{ flex: 1 }}>Cart</span>
            {cartCount > 0 && <span style={{ background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>}
          </button>
        </nav>
        <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={requestLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.75)', borderRadius: 8, cursor: 'pointer', fontSize: '0.88rem' }}>
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 250 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setSidebarOpen(false)} />
          <aside style={{ position: 'absolute', top: 0, left: 0, width: 260, height: '100vh', background: 'var(--bg-2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1 }}>
            {/* Same sidebar content */}
            <div style={{ padding: '1.5rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontWeight: 800, fontSize: '1rem' }}>👟 SoleStore</p>
              <p style={{ fontSize: '0.72rem', opacity: 0.6 }}>Customer Portal</p>
            </div>
            <nav style={{ flex: 1, padding: '0.8rem 0' }}>
              {MENU.map((item) => (
                <button key={item.key} onClick={() => { setActive(item.key); setSidebarOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.75rem 1.2rem', background: active === item.key ? 'rgba(233,69,96,0.2)' : 'transparent', border: 'none', color: active === item.key ? 'var(--secondary)' : 'rgba(255,255,255,0.75)', borderLeft: active === item.key ? '3px solid var(--secondary)' : '3px solid transparent', cursor: 'pointer', fontSize: '0.88rem', fontWeight: active === item.key ? 700 : 400, textAlign: 'left', fontFamily: 'inherit' }}>
                  {item.icon}<span style={{ flex: 1 }}>{item.label}</span>
                </button>
              ))}
            </nav>
            <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={requestLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.75)', borderRadius: 8, cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit' }}>
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'var(--bg)' }}>

        {/* ── SHOP ── */}
        {active === 'shop' && (
          <div>
            <BackButton />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>Shop Shoes</h1>
                <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{pagination?.total || 0} products available</p>
              </div>
              <button onClick={() => navigate('/cart')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiShoppingCart size={16} /> Cart {cartCount > 0 && `(${cartCount})`}
              </button>
            </div>

            {/* Search & Filters */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                <input className="form-control" placeholder="Search shoes, brands..."
                  value={keyword} onChange={(e) => setKeyword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }} />
              </div>
              <select className="form-control" style={{ width: 150 }} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <select className="form-control" style={{ width: 160 }} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                <option value="">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {loadingProducts ? <div className="loading-container"><div className="spinner" /></div>
              : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 12 }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👟</div>
                  <h3>No products found</h3>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {products.map((p) => (
                      <div key={p._id} className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <Link to={`/products/${p._id}`}>
                          <img src={p.image?.url} alt={p.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                        </Link>
                        <div style={{ padding: '0.9rem' }}>
                          <p style={{ fontSize: '0.72rem', color: 'var(--gray)', textTransform: 'capitalize', marginBottom: '0.2rem' }}>{p.category} · {p.brand}</p>
                          <Link to={`/products/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.6rem' }}>
                            <Stars rating={p.averageRating} />
                            <span style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>({p.numReviews})</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '1.1rem' }}>${p.price.toFixed(2)}</span>
                            <span style={{ fontSize: '0.72rem', color: p.stock > 0 ? '#28a745' : '#dc3545', fontWeight: 600 }}>{p.stock > 0 ? `${p.stock} left` : 'Out of stock'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleAddToCart(p._id)} disabled={p.stock === 0}
                              style={{ flex: 1, padding: '0.5rem', background: p.stock > 0 ? 'var(--secondary)' : 'var(--border)', color: p.stock > 0 ? 'white' : 'var(--gray)', border: 'none', borderRadius: 7, fontWeight: 600, cursor: p.stock > 0 ? 'pointer' : 'not-allowed', fontSize: '0.8rem' }}>
                              <FiShoppingCart size={13} style={{ marginRight: 4 }} />Add to Cart
                            </button>
                            <button onClick={() => setMsgModal({ sellerId: p.seller?._id, sellerName: p.seller?.name, productId: p._id, productName: p.name })}
                              style={{ padding: '0.5rem 0.7rem', background: 'transparent', border: '1.5px solid #0f3460', color: '#0f3460', borderRadius: 7, cursor: 'pointer', fontSize: '0.8rem' }}>
                              <FiMessageCircle size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pagination */}
                  {pagination?.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)} style={{ width: 34, height: 34, borderRadius: 7, border: 'none', background: p === page ? 'var(--secondary)' : 'white', color: p === page ? 'white' : 'var(--primary)', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)' }}>{p}</button>
                      ))}
                    </div>
                  )}
                </>
              )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {active === 'orders' && (
          <div>
            <BackButton />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem' }}>My Orders</h1>
            <p style={{ color: 'var(--gray)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>Track all your purchases</p>
            {loadingOrders ? <div className="loading-container"><div className="spinner" /></div>
              : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 12 }}>
                  <FiPackage size={48} style={{ color: 'var(--gray)', marginBottom: '1rem' }} />
                  <h3>No orders yet</h3>
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActive('shop')}>Start Shopping</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map((order) => (
                    <div key={order._id} className="card" style={{ padding: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{order._id.slice(-8).toUpperCase()}</p>
                          <p style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ padding: '0.25rem 0.8rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', background: STATUS_STYLE[order.status]?.bg, color: STATUS_STYLE[order.status]?.color }}>{order.status}</span>
                          <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>${order.totalPrice.toFixed(2)}</span>
                          <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">View</Link>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {order.items.map((item) => (
                          <div key={item._id} style={{ position: 'relative' }}>
                            <img src={item.image} alt={item.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 7 }} />
                            {item.quantity > 1 && <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: 17, height: 17, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{item.quantity}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── INBOX ── */}
        {active === 'inbox' && (
          <div>
            <BackButton />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem' }}>Inbox</h1>
            <p style={{ color: 'var(--gray)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>Messages you sent to sellers</p>
            {loadingMsgs ? <div className="loading-container"><div className="spinner" /></div>
              : sentMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 12 }}>
                  <FiMessageCircle size={48} style={{ color: 'var(--gray)', marginBottom: '1rem' }} />
                  <h3>No messages yet</h3>
                  <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>Go to Shop and click the message icon on any product to contact a seller.</p>
                  <button className="btn btn-primary" onClick={() => setActive('shop')}>Browse Products</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {sentMessages.map((msg) => (
                    <div key={msg._id} className="card" style={{ padding: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <FiMessageCircle size={16} color="var(--secondary)" />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>To: {msg.sellerName || 'Seller'}</span>
                          </div>
                          {msg.productName && <p style={{ fontSize: '0.78rem', color: 'var(--gray)', marginBottom: '0.4rem' }}>About: <strong>{msg.productName}</strong></p>}
                          <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{msg.text}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.4rem' }}>{new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {active === 'profile' && (
          <div>
            <BackButton />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.8rem' }}>My Profile</h1>
            <div className="card" style={{ padding: '2rem', maxWidth: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{user?.name}</p>
                  <p style={{ color: 'var(--gray)', fontSize: '0.88rem' }}>{user?.email}</p>
                  <span style={{ background: '#d4edda', color: '#155724', padding: '0.2rem 0.6rem', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>Customer</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, background: '#f8f9fa', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--secondary)' }}>{orders.length}</p>
                  <p style={{ color: 'var(--gray)', fontSize: '0.82rem' }}>Total Orders</p>
                </div>
                <div style={{ flex: 1, background: '#f8f9fa', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--secondary)' }}>{cartCount}</p>
                  <p style={{ color: 'var(--gray)', fontSize: '0.82rem' }}>Cart Items</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Message Modal ── */}
      {msgModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700 }}>Message Seller</h3>
              <button onClick={() => setMsgModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', fontSize: '1.2rem' }}>✕</button>
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              To: <strong>{msgModal.sellerName}</strong> · About: <strong>{msgModal.productName}</strong>
            </p>
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label>Your Message</label>
                <textarea className="form-control" rows={4} placeholder="Ask about size, availability, delivery..."
                  value={msgText} onChange={(e) => setMsgText(e.target.value)} required style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setMsgModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><FiMessageCircle size={15} /> Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showConfirm && <LogoutConfirm onConfirm={confirmLogout} onCancel={cancelLogout} />}
    </div>
  );
};

export default CustomerDashboard;

