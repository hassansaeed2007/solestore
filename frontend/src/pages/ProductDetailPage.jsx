import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, addReview, clearProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiStar, FiMessageCircle, FiX, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';

const Stars = ({ rating, interactive = false, onRate }) => (
  <span>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s}
        onClick={() => interactive && onRate && onRate(s)}
        style={{
          color: s <= Math.round(rating) ? '#f59e0b' : 'rgba(255,255,255,0.15)',
          fontSize: interactive ? '1.6rem' : '1rem',
          cursor: interactive ? 'pointer' : 'default',
        }}>★</span>
    ))}
  </span>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);

  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    return () => dispatch(clearProduct());
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'customer') { toast.error('Only customers can add to cart'); return; }
    const result = await dispatch(addToCart({ productId: id, quantity: qty }));
    if (!result.error) toast.success('Added to cart!');
    else toast.error(result.payload || 'Failed to add to cart');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSendingMsg(true);
    try {
      await api.post(`/seller/${product.seller._id}/message`, {
        text: msgText, productId: product._id, productName: product.name,
      });
      toast.success('Message sent to seller!');
      setMsgModal(false);
      setMsgText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
    setSendingMsg(false);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmittingReview(true);
    const result = await dispatch(addReview({ id, data: review }));
    setSubmittingReview(false);
    if (!result.error) {
      toast.success('Review submitted!');
      setReview({ rating: 5, comment: '' });
      dispatch(fetchProduct(id));
    } else {
      toast.error(result.payload || 'Failed to submit review');
    }
  };

  if (loading || !product) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2.5rem 0' }}>
      <div className="container">

        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray)', marginBottom: '1.5rem', fontSize: '0.88rem', textDecoration: 'none' }}>
          <FiArrowLeft size={15} /> Back to Products
        </Link>

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>

          {/* Image */}
          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: 480 }}>
            <img src={product.image?.url} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Info */}
          <div>
            <p style={{ color: 'var(--secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.6rem', fontWeight: 700 }}>
              {product.category} · {product.brand}
            </p>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <Stars rating={product.averageRating} />
              <span style={{ color: 'var(--gray)', fontSize: '0.88rem' }}>
                {product.averageRating.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>

            <div style={{ fontSize: '2.2rem', fontWeight: 900, background: 'linear-gradient(135deg, #7c6fff, #ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '1.2rem' }}>
              ${product.price.toFixed(2)}
            </div>

            <p style={{ color: 'var(--gray)', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.92rem' }}>
              {product.description}
            </p>

            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Sold by: <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{product.seller?.name}</span>
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ color: product.stock > 0 ? '#34d399' : '#f87171', fontWeight: 700, fontSize: '0.9rem' }}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-3)', borderRadius: 50, padding: '0.3rem 0.8rem' }}>
                  <label style={{ color: 'var(--gray)', fontSize: '0.82rem' }}>Qty:</label>
                  <select value={qty} onChange={(e) => setQty(Number(e.target.value))}
                    style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 700, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n} style={{ background: 'var(--bg-3)' }}>{n}</option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={handleAddToCart}
                  style={{ flex: 1, justifyContent: 'center', borderRadius: 12 }}>
                  <FiShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            )}

            {user?.role === 'customer' && (
              <button onClick={() => setMsgModal(true)}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(124,111,255,0.08)', border: '1.5px solid rgba(124,111,255,0.25)', color: '#a78bfa', borderRadius: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                <FiMessageCircle size={17} /> Message Seller
              </button>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '1.2rem' }}>
              Reviews ({product.numReviews})
            </h2>
            {product.reviews?.length === 0 ? (
              <p style={{ color: 'var(--gray)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
                No reviews yet. Be the first!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {product.reviews.map((r) => (
                  <div key={r._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'white', fontSize: '0.9rem' }}>{r.name}</strong>
                      <Stars rating={r.rating} />
                    </div>
                    <p style={{ color: 'var(--gray)', fontSize: '0.88rem', lineHeight: 1.6 }}>{r.comment}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user?.role === 'customer' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '1.2rem' }}>Write a Review</h2>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
                <form onSubmit={handleReview}>
                  <div className="form-group">
                    <label>Your Rating</label>
                    <Stars rating={review.rating} interactive onRate={(r) => setReview({ ...review, rating: r })} />
                  </div>
                  <div className="form-group">
                    <label>Comment</label>
                    <textarea className="form-control" rows={4} placeholder="Share your experience..."
                      value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      required style={{ resize: 'vertical' }} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={submittingReview} style={{ borderRadius: 10 }}>
                    <FiStar size={15} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {msgModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 20, width: '100%', maxWidth: 460, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, color: 'white' }}>Message Seller</h3>
              <button onClick={() => setMsgModal(false)} style={{ background: 'var(--bg-3)', border: 'none', color: 'var(--gray)', cursor: 'pointer', padding: '0.4rem', borderRadius: 8, display: 'flex' }}>
                <FiX size={18} />
              </button>
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              About: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{product.name}</strong>
              {' · '}Seller: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{product.seller?.name}</strong>
            </p>
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label>Your Message</label>
                <textarea className="form-control" rows={4} placeholder="Ask about size, availability, delivery..."
                  value={msgText} onChange={(e) => setMsgText(e.target.value)}
                  required style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setMsgModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={sendingMsg} style={{ borderRadius: 10 }}>
                  <FiMessageCircle size={14} /> {sendingMsg ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
