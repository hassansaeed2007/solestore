import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import BackButton from '../components/BackButton';
import { toast } from 'react-toastify';

const D = { bg: 'var(--bg)', card: 'var(--bg-card)', border: 'var(--border)', gray: 'var(--gray)' };

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector((s) => s.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleQty = (productId, newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartItem({ productId, quantity: newQty }));
  };

  const handleRemove = async (productId) => {
    const r = await dispatch(removeFromCart(productId));
    if (!r.error) toast.success('Item removed');
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  const items = cart?.items || [];

  if (items.length === 0) return (
    <div style={{ minHeight: '100vh', background: D.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem', filter: 'grayscale(0.3)' }}>🛒</div>
        <h2 style={{ color: 'white', fontWeight: 800, marginBottom: '0.5rem' }}>Your cart is empty</h2>
        <p style={{ color: D.gray, marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: D.bg, padding: '2.5rem 0' }}>
      <div className="container">
        <BackButton />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.3rem' }}>Shopping Cart</h1>
        <p style={{ color: D.gray, marginBottom: '2rem', fontSize: '0.9rem' }}>{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <div key={item._id} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: '1.2rem', display: 'flex', gap: '1.2rem', alignItems: 'center', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(124,111,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = D.border}>
                <img src={item.product?.image?.url} alt={item.product?.name}
                  style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 12, background: 'var(--bg-3)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/products/${item.product?._id}`} style={{ fontWeight: 700, fontSize: '1rem', color: 'white', display: 'block', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product?.name}
                  </Link>
                  {item.size && (
                    <span style={{ display: 'inline-block', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)', color: '#c9a96e', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', marginBottom: '0.3rem' }}>
                      Size: {item.size}
                    </span>
                  )}
                  <p style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '1rem' }}>${item.price.toFixed(2)} each</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-3)', borderRadius: 50, padding: '0.3rem 0.5rem' }}>
                  <button onClick={() => handleQty(item.product?._id, item.quantity - 1)}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--bg-hover)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiMinus size={12} />
                  </button>
                  <span style={{ fontWeight: 800, minWidth: 24, textAlign: 'center', color: 'white', fontSize: '0.95rem' }}>{item.quantity}</span>
                  <button onClick={() => handleQty(item.product?._id, item.quantity + 1)}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--bg-hover)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiPlus size={12} />
                  </button>
                </div>
                <div style={{ minWidth: 80, textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button onClick={() => handleRemove(item.product?._id)}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, display: 'flex', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}>
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 88 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1.1rem', color: 'white' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.2rem' }}>
              {items.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: D.gray }}>{item.product?.name} × {item.quantity}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${D.border}`, paddingTop: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
                <span style={{ color: 'white' }}>Total</span>
                <span style={{ background: 'linear-gradient(135deg, #7c6fff, #ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>${cart?.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', borderRadius: 12, fontSize: '0.95rem' }}
              onClick={() => navigate('/checkout')}>
              <FiShoppingBag /> Checkout <FiArrowRight size={15} />
            </button>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: '0.8rem', fontSize: '0.85rem', color: D.gray }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
