import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  fetchAdminStats, fetchAllUsers, deleteUser,
  fetchSellerRequests, approveSeller, rejectSeller,
  fetchAllOrders, updateOrderStatus,
} from '../store/slices/adminSlice';
import { toast } from 'react-toastify';
import {
  FiUsers, FiPackage, FiShoppingBag, FiDollarSign,
  FiTrash2, FiCheck, FiX, FiGrid, FiLogOut,
  FiShield, FiBarChart2, FiClock, FiAlertCircle, FiMenu,
} from 'react-icons/fi';

const MENU = [
  { key: 'overview',        label: 'Overview',         icon: <FiBarChart2 size={18} /> },
  { key: 'seller_requests', label: 'Seller Requests',  icon: <FiClock size={18} />, badge: true },
  { key: 'sellers',         label: 'Sellers',          icon: <FiGrid size={18} /> },
  { key: 'customers',       label: 'Customers',        icon: <FiUsers size={18} /> },
  { key: 'orders',          label: 'Orders',           icon: <FiShoppingBag size={18} /> },
  { key: 'products',        label: 'Products',         icon: <FiPackage size={18} /> },
];

const STATUS_BADGE = {
  pending: { bg: '#fff3cd', color: '#856404' },
  processing: { bg: '#d1ecf1', color: '#0c5460' },
  shipped: { bg: '#e2e3e5', color: '#383d41' },
  delivered: { bg: '#d4edda', color: '#155724' },
  cancelled: { bg: '#f8d7da', color: '#721c24' },
};

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
    <div style={{ background: color + '18', color, borderRadius: 14, padding: '0.9rem', display: 'flex', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontWeight: 800, fontSize: '1.6rem', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.2rem' }}>{sub}</p>}
    </div>
  </div>
);

const Table = ({ headers, rows }) => (
  <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {headers.map((h) => (
            <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
);

const TR = ({ children, i }) => (
  <tr style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
    {children}
  </tr>
);

const TD = ({ children, style }) => (
  <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', ...style }}>{children}</td>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { stats, users, orders, sellerRequests, loading } = useSelector((s) => s.admin);
  const [active, setActive] = useState('overview');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  useEffect(() => {
    if (active === 'customers') dispatch(fetchAllUsers('customer'));
    if (active === 'sellers') dispatch(fetchAllUsers('seller'));
    if (active === 'orders') dispatch(fetchAllOrders({}));
    if (active === 'seller_requests') dispatch(fetchSellerRequests());
    if (active === 'products') {
      fetch('/api/products?limit=100').then(r => r.json()).then(d => setAllProducts(d.products || []));
    }
  }, [active, dispatch]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    const r = await dispatch(deleteUser(id));
    if (!r.error) toast.success('User deleted'); else toast.error(r.payload || 'Failed');
  };

  const handleApprove = async (id) => {
    const r = await dispatch(approveSeller(id));
    if (!r.error) toast.success('Seller approved!'); else toast.error(r.payload || 'Failed');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Provide a rejection reason'); return; }
    const r = await dispatch(rejectSeller({ id: rejectModal, reason: rejectReason }));
    if (!r.error) { toast.success('Seller rejected'); setRejectModal(null); setRejectReason(''); }
    else toast.error(r.payload || 'Failed');
  };

  const handleStatusChange = async (id, status) => {
    const r = await dispatch(updateOrderStatus({ id, status }));
    if (!r.error) toast.success('Order updated'); else toast.error(r.payload || 'Failed');
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (r.ok) { toast.success('Product deleted'); setAllProducts(p => p.filter(x => x._id !== id)); }
    else toast.error('Failed to delete product');
  };

  const handleLogout = () => { dispatch(logout()); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Mobile top bar */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#0a0a0a', borderBottom: '1px solid rgba(201,169,110,0.1)', zIndex: 300, alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }} className="seller-mobile-bar">
        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: 'white', fontSize: '1rem' }}>
          Sole<span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Store</span>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem', fontFamily: 'Inter,sans-serif', fontWeight: 400 }}>Admin</span>
        </p>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', color: '#c9a96e', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 250 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setSidebarOpen(false)} />
          <aside style={{ position: 'absolute', top: 0, left: 0, width: 260, height: '100vh', background: 'var(--bg-2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1 }}>
            <div style={{ padding: '1.5rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontWeight: 800, color: 'white' }}>Admin Panel</p>
            </div>
            <nav style={{ flex: 1, padding: '0.5rem 0' }}>
              {MENU.map((item) => (
                <button key={item.key} onClick={() => { setActive(item.key); setSidebarOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.75rem 1.2rem', background: active === item.key ? 'rgba(201,169,110,0.1)' : 'transparent', border: 'none', color: active === item.key ? '#c9a96e' : 'rgba(255,255,255,0.6)', borderLeft: active === item.key ? '3px solid #c9a96e' : '3px solid transparent', cursor: 'pointer', fontSize: '0.88rem', fontWeight: active === item.key ? 700 : 400, textAlign: 'left', fontFamily: 'inherit' }}>
                  {item.icon}<span style={{ flex: 1 }}>{item.label}</span>
                </button>
              ))}
            </nav>
            <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => { dispatch(logout()); setSidebarOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.7rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                <FiLogOut size={15} /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, background: 'var(--bg-2)', color: 'white',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', borderRight: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--secondary)', borderRadius: 10, padding: '0.5rem', display: 'flex' }}>
              <FiShield size={20} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>SoleStore</p>
              <p style={{ fontSize: '0.72rem', opacity: 0.6 }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--secondary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.2 }}>{user?.name}</p>
              <p style={{ fontSize: '0.72rem', opacity: 0.6 }}>Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.8rem 0' }}>
          {MENU.map((item) => (
            <button key={item.key} onClick={() => setActive(item.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.75rem 1.2rem', background: active === item.key ? 'rgba(124,111,255,0.12)' : 'transparent',
                border: 'none', color: active === item.key ? 'white' : 'rgba(255,255,255,0.5)',
                borderLeft: active === item.key ? '3px solid #7c6fff' : '3px solid transparent',
                cursor: 'pointer', fontSize: '0.88rem', fontWeight: active === item.key ? 700 : 400,
                textAlign: 'left', transition: 'all 0.15s',
              }}>
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && stats?.pendingSellers > 0 && (
                <span style={{
                  background: 'var(--secondary)', color: 'white', borderRadius: '50%',
                  width: 20, height: 20, fontSize: '0.7rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                }}>{stats.pendingSellers}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.08)',
              border: 'none', color: 'rgba(255,255,255,0.75)', borderRadius: 8,
              cursor: 'pointer', fontSize: '0.88rem',
            }}>
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg)', minWidth: 0 }}>

        {/* ── OVERVIEW ── */}
        {active === 'overview' && (
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem', color: 'white' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--gray)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Welcome back, {user?.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard icon={<FiUsers size={22} />} label="Total Users" value={stats?.totalUsers ?? '—'} color="#0f3460" />
              <StatCard icon={<FiPackage size={22} />} label="Products" value={stats?.totalProducts ?? '—'} color="#e94560" />
              <StatCard icon={<FiShoppingBag size={22} />} label="Orders" value={stats?.totalOrders ?? '—'} color="#28a745" />
              <StatCard icon={<FiDollarSign size={22} />} label="Revenue" value={stats ? `$${stats.totalRevenue.toFixed(2)}` : '—'} color="#ffc107" />
              <StatCard icon={<FiAlertCircle size={22} />} label="Pending Sellers" value={stats?.pendingSellers ?? '—'} color="#e94560"
                sub={stats?.pendingSellers > 0 ? 'Needs review' : 'All clear'} />
            </div>

            {stats?.pendingSellers > 0 && (
              <div style={{
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12,
                padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem',
              }}>
                <FiAlertCircle size={20} color="#fbbf24" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem' }}>{stats.pendingSellers} seller application{stats.pendingSellers > 1 ? 's' : ''} waiting for review</p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(251,191,36,0.7)', marginTop: '0.1rem' }}>Go to Seller Requests to approve or reject</p>
                </div>
                <button onClick={() => setActive('seller_requests')}
                  style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '0.45rem 0.9rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit' }}>
                  Review Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SELLER REQUESTS ── */}
        {active === 'seller_requests' && (
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem' }}>Seller License Requests</h1>
            <p style={{ color: 'var(--gray)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>Review and approve seller applications</p>

            {loading ? <div className="loading-container"><div className="spinner" /></div>
              : sellerRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ color: 'white' }}>No pending requests</h3>
                  <p style={{ color: 'var(--gray)' }}>All seller applications have been reviewed.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {sellerRequests.map((seller) => (
                    <div key={seller._id} className="card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                            <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#0f3460', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                              {seller.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: '1rem' }}>{seller.name}</p>
                              <p style={{ color: 'var(--gray)', fontSize: '0.82rem' }}>{seller.email}</p>
                            </div>
                            <span style={{ background: '#fff3cd', color: '#856404', padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>Pending</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem', marginBottom: '0.8rem' }}>
                            {[
                              { label: 'Business Name', value: seller.sellerInfo?.businessName },
                              { label: 'Business Type', value: seller.sellerInfo?.businessType?.replace(/_/g, ' ') },
                              { label: 'Phone', value: seller.sellerInfo?.phone },
                              { label: 'CNIC', value: seller.sellerInfo?.cnic },
                              { label: 'License No.', value: seller.sellerInfo?.licenseNumber },
                              { label: 'Address', value: seller.sellerInfo?.businessAddress },
                            ].filter(f => f.value).map((f) => (
                              <div key={f.label} style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '0.4rem 0.7rem' }}>
                                <p style={{ fontSize: '0.65rem', color: 'var(--gray)', marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{f.label}</p>
                                <p style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize', color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.value}</p>
                              </div>
                            ))}
                          </div>
                          {seller.sellerInfo?.description && (
                            <div style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '0.6rem 0.8rem', marginBottom: '0.5rem' }}>
                              <p style={{ fontSize: '0.65rem', color: 'var(--gray)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Description</p>
                              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>{seller.sellerInfo.description}</p>
                            </div>
                          )}
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                            Applied: {new Date(seller.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: 130 }}>
                          <button onClick={() => handleApprove(seller._id)}
                            style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: 8, padding: '0.65rem 1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontSize: '0.88rem' }}>
                            <FiCheck size={15} /> Approve
                          </button>
                          <button onClick={() => setRejectModal(seller._id)}
                            style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 8, padding: '0.65rem 1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', fontSize: '0.88rem' }}>
                            <FiX size={15} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── SELLERS ── */}
        {active === 'sellers' && (
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem' }}>Sellers</h1>
            <p style={{ color: 'var(--gray)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>All registered sellers and their status</p>
            {loading ? <div className="loading-container"><div className="spinner" /></div> : (
              <Table headers={['Seller', 'Business', 'Status', 'Joined', 'Actions']} rows={
                users.map((u, i) => (
                  <TR key={u._id} i={i}>
                    <TD>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.78rem' }}>{u.email}</div>
                    </TD>
                    <TD>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.sellerInfo?.businessName || '—'}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.78rem', textTransform: 'capitalize' }}>{u.sellerInfo?.businessType?.replace(/_/g, ' ') || ''}</div>
                    </TD>
                    <TD>
                      <span style={{
                        padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                        background: u.sellerStatus === 'approved' ? '#d4edda' : u.sellerStatus === 'rejected' ? '#f8d7da' : '#fff3cd',
                        color: u.sellerStatus === 'approved' ? '#155724' : u.sellerStatus === 'rejected' ? '#721c24' : '#856404',
                        textTransform: 'capitalize',
                      }}>{u.sellerStatus || 'pending'}</span>
                    </TD>
                    <TD style={{ color: 'var(--gray)' }}>{new Date(u.createdAt).toLocaleDateString()}</TD>
                    <TD>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>
                        <FiTrash2 size={13} />
                      </button>
                    </TD>
                  </TR>
                ))
              } />
            )}
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {active === 'customers' && (
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem' }}>Customers</h1>
            <p style={{ color: 'var(--gray)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>All registered customers</p>
            {loading ? <div className="loading-container"><div className="spinner" /></div> : (
              <Table headers={['Name', 'Email', 'Joined', 'Actions']} rows={
                users.map((u, i) => (
                  <TR key={u._id} i={i}>
                    <TD style={{ fontWeight: 600 }}>{u.name}</TD>
                    <TD style={{ color: 'var(--gray)' }}>{u.email}</TD>
                    <TD style={{ color: 'var(--gray)' }}>{new Date(u.createdAt).toLocaleDateString()}</TD>
                    <TD>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>
                        <FiTrash2 size={13} />
                      </button>
                    </TD>
                  </TR>
                ))
              } />
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {active === 'orders' && (
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem' }}>All Orders</h1>
            <p style={{ color: 'var(--gray)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>Manage and update order statuses</p>
            {loading ? <div className="loading-container"><div className="spinner" /></div> : (
              <Table headers={['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date']} rows={
                orders.map((o, i) => (
                  <TR key={o._id} i={i}>
                    <TD style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{o._id.slice(-8).toUpperCase()}</TD>
                    <TD>
                      <div style={{ fontWeight: 600 }}>{o.user?.name}</div>
                      <div style={{ color: 'var(--gray)', fontSize: '0.78rem' }}>{o.user?.email}</div>
                    </TD>
                    <TD style={{ color: 'var(--gray)' }}>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</TD>
                    <TD style={{ fontWeight: 700, color: 'var(--secondary)' }}>${o.totalPrice.toFixed(2)}</TD>
                    <TD>
                      <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        style={{ border: '1px solid var(--border-2)', borderRadius: 7, padding: '0.3rem 0.5rem', fontSize: '0.78rem', background: 'var(--bg-3)', color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </TD>
                    <TD style={{ color: 'var(--gray)' }}>{new Date(o.createdAt).toLocaleDateString()}</TD>
                  </TR>
                ))
              } />
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {active === 'products' && (
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem' }}>All Products</h1>
            <p style={{ color: 'var(--gray)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>View and delete any product on the platform</p>
            {allProducts.length === 0 ? <div className="loading-container"><div className="spinner" /></div> : (
              <Table headers={['Product', 'Category', 'Price', 'Stock', 'Seller', 'Actions']} rows={
                allProducts.map((p, i) => (
                  <TR key={p._id} i={i}>
                    <TD>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <img src={p.image?.url} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 7, background: '#f0f0f0' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div>
                          <div style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>{p.brand}</div>
                        </div>
                      </div>
                    </TD>
                    <TD style={{ textTransform: 'capitalize', color: 'var(--gray)' }}>{p.category}</TD>
                    <TD style={{ fontWeight: 700, color: 'var(--secondary)' }}>${p.price.toFixed(2)}</TD>
                    <TD style={{ color: p.stock > 0 ? '#28a745' : '#dc3545', fontWeight: 600 }}>{p.stock}</TD>
                    <TD style={{ color: 'var(--gray)', fontSize: '0.82rem' }}>{p.seller?.name || '—'}</TD>
                    <TD>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p._id)}>
                        <FiTrash2 size={13} />
                      </button>
                    </TD>
                  </TR>
                ))
              } />
            )}
          </div>
        )}

      </main>

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 18, width: '100%', maxWidth: 440, padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>Reject Seller Application</h3>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              This reason will be shown to the seller via email and on their screen.
            </p>
            <div className="form-group">
              <label>Rejection Reason</label>
              <textarea className="form-control" rows={4}
                placeholder="e.g. Invalid license number, incomplete business information..."
                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
