import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../store/slices/orderSlice';
import { FiArrowLeft, FiMapPin, FiCreditCard } from 'react-icons/fi';
import BackButton from '../components/BackButton';

const STATUS = {
  pending:    { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
  processing: { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  shipped:    { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa' },
  delivered:  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
  cancelled:  { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
};

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((s) => s.orders);
  useEffect(() => { dispatch(fetchOrder(id)); }, [dispatch, id]);

  if (loading || !order) return <div className="loading-container"><div className="spinner" /></div>;

  const stepIndex = STEPS.indexOf(order.status);
  const s = STATUS[order.status] || STATUS.pending;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2.5rem 0' }}>
      <div className="container" style={{ maxWidth: 820 }}>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray)', marginBottom: '1.5rem', fontSize: '0.88rem', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray)'}>
          <FiArrowLeft size={15} /> Back to Orders
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>
              #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span style={{ background: s.bg, color: s.color, padding: '0.4rem 1.2rem', borderRadius: 50, fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.8rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, left: '8%', right: '8%', height: 2, background: 'var(--border)', zIndex: 0 }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #7c6fff, #a855f7)', width: `${(stepIndex / (STEPS.length - 1)) * 100}%`, transition: 'width 0.6s ease', borderRadius: 2 }} />
              </div>
              {STEPS.map((step, i) => (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: i <= stepIndex ? 'linear-gradient(135deg, #7c6fff, #a855f7)' : 'var(--bg-3)', border: `2px solid ${i <= stepIndex ? 'transparent' : 'var(--border)'}`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.6rem', boxShadow: i <= stepIndex ? '0 4px 12px rgba(124,111,255,0.4)' : 'none', transition: 'all 0.3s' }}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'capitalize', color: i <= stepIndex ? 'white' : 'var(--gray)', fontWeight: i === stepIndex ? 700 : 400, textAlign: 'center' }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <FiMapPin size={16} color="var(--secondary)" />
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>Shipping Address</h3>
            </div>
            <p style={{ color: 'var(--gray)', lineHeight: 1.9, fontSize: '0.88rem' }}>
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <FiCreditCard size={16} color="var(--secondary)" />
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>Payment</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray)' }}>
              Status:{' '}
              <span style={{ color: order.isPaid ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                {order.isPaid ? `✓ Paid on ${new Date(order.paidAt).toLocaleDateString()}` : '⏳ Pending'}
              </span>
            </p>
          </div>
        </div>

        {/* Items */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem', color: 'white' }}>Items Ordered</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.8rem', background: 'var(--bg-3)', borderRadius: 12 }}>
                <img src={item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10, background: 'var(--bg-2)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{item.name}</p>
                  {item.size && (
                    <span style={{ display: 'inline-block', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)', color: '#c9a96e', fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.5rem', marginTop: '0.2rem' }}>
                      Size: {item.size}
                    </span>
                  )}
                  <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginTop: '0.2rem' }}>Qty: {item.quantity}</p>
                </div>
                <span style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.2rem', paddingTop: '1.2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Order Total</p>
              <p style={{ fontWeight: 900, fontSize: '1.6rem', background: 'linear-gradient(135deg, #7c6fff, #ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ${order.totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
