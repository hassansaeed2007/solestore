import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { FiPackage, FiEye, FiArrowRight } from 'react-icons/fi';
import BackButton from '../components/BackButton';

const STATUS = {
  pending:    { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', label: 'Pending' },
  processing: { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', label: 'Processing' },
  shipped:    { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa', label: 'Shipped' },
  delivered:  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', label: 'Delivered' },
  cancelled:  { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: 'Cancelled' },
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);
  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2.5rem 0' }}>
      <div className="container">
        <BackButton />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.3rem' }}>My Orders</h1>
        <p style={{ color: 'var(--gray)', marginBottom: '2rem', fontSize: '0.9rem' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <FiPackage size={52} style={{ color: 'var(--gray)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No orders yet</h3>
            <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>When you place an order, it will appear here.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping <FiArrowRight /></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => {
              const s = STATUS[order.status] || STATUS.pending;
              return (
                <div key={order._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.3rem', transition: 'border-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(124,111,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: 'white', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ background: s.bg, color: s.color, padding: '0.3rem 0.9rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>{s.label}</span>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg, #7c6fff, #ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        ${order.totalPrice.toFixed(2)}
                      </span>
                      <Link to={`/orders/${order._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.2)', color: '#a78bfa', padding: '0.4rem 0.9rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,111,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(124,111,255,0.1)'}>
                        <FiEye size={13} /> View
                      </Link>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {order.items.map((item) => (
                      <div key={item._id} style={{ position: 'relative' }}>
                        <img src={item.image} alt={item.name} style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 10, background: 'var(--bg-3)' }} />
                        {item.quantity > 1 && (
                          <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
