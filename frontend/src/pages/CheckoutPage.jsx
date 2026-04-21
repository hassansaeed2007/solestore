import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { fetchCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FiPackage, FiCreditCard, FiLock, FiArrowRight } from 'react-icons/fi';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CARD_STYLE = {
  style: {
    base: { fontSize: '15px', color: '#ffffff', fontFamily: 'Inter, sans-serif', '::placeholder': { color: 'rgba(255,255,255,0.3)' } },
    invalid: { color: '#f87171' },
  },
  hidePostalCode: true,
};

const PaymentForm = ({ cart, address, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { data } = await api.post('/payment/create-intent');
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) { toast.error(result.error.message); setLoading(false); return; }
      const orderRes = await api.post('/payment/confirm', { paymentIntentId: result.paymentIntent.id, shippingAddress: address });
      toast.success('Payment successful! Order placed.');
      onSuccess(orderRes.data.order._id);
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    setLoading(false);
  };

  return (
    <form onSubmit={handlePay}>
      <div style={{ background: 'var(--bg-3)', border: '1.5px solid var(--border-2)', borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1rem' }}>
        <CardElement options={CARD_STYLE} />
      </div>
      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#34d399' }}>
        <FiLock size={13} /> Secured by Stripe — we never store your card details
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.8rem 0', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>Total</span>
        <span style={{ fontWeight: 900, fontSize: '1.3rem', background: 'linear-gradient(135deg, #7c6fff, #ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>${cart?.totalPrice?.toFixed(2)}</span>
      </div>
      <button type="submit" disabled={!stripe || loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', borderRadius: 12, fontSize: '0.95rem' }}>
        <FiCreditCard size={17} /> {loading ? 'Processing...' : `Pay $${cart?.totalPrice?.toFixed(2)}`}
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--gray)', marginTop: '0.7rem' }}>
        Test: 4242 4242 4242 4242 · Any future date · Any CVC
      </p>
    </form>
  );
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((s) => s.cart);
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: 'US' });
  const [step, setStep] = useState(1);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const items = cart?.items || [];
  const set = (f) => (e) => setAddress({ ...address, [f]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2.5rem 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Checkout</h1>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {['Shipping', 'Payment'].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: i === 0 ? 'pointer' : 'default' }} onClick={() => i === 0 && setStep(1)}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > i ? 'linear-gradient(135deg, #7c6fff, #a855f7)' : step === i + 1 ? 'var(--bg-3)' : 'var(--bg-3)', border: step === i + 1 ? '2px solid var(--secondary)' : '2px solid var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? 'white' : 'var(--gray)', fontSize: '0.9rem' }}>{s}</span>
              </div>
              {i === 0 && <div style={{ width: 40, height: 2, background: step > 1 ? 'var(--secondary)' : 'var(--border)', borderRadius: 2 }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem' }}>
            {step === 1 && (
              <>
                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '1.1rem' }}>
                  <FiPackage size={18} color="var(--secondary)" /> Shipping Address
                </h2>
                <div className="form-group">
                  <label>Street Address</label>
                  <input className="form-control" placeholder="123 Main Street" value={address.street} onChange={set('street')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label>City</label><input className="form-control" placeholder="New York" value={address.city} onChange={set('city')} /></div>
                  <div className="form-group"><label>State</label><input className="form-control" placeholder="NY" value={address.state} onChange={set('state')} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label>ZIP Code</label><input className="form-control" placeholder="10001" value={address.zipCode} onChange={set('zipCode')} /></div>
                  <div className="form-group"><label>Country</label><input className="form-control" placeholder="US" value={address.country} onChange={set('country')} /></div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', borderRadius: 12 }}
                  onClick={() => { if (['street','city','state','zipCode','country'].some(f => !address[f]?.trim())) { toast.error('Fill all address fields'); return; } setStep(2); }}>
                  Continue to Payment <FiArrowRight />
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '1.1rem' }}>
                  <FiCreditCard size={18} color="var(--secondary)" /> Payment Details
                </h2>
                <Elements stripe={stripePromise}>
                  <PaymentForm cart={cart} address={address} onSuccess={(id) => navigate(`/orders/${id}`)} />
                </Elements>
              </>
            )}
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 88 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'white', fontSize: '1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
              {items.map((item) => (
                <div key={item._id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <img src={item.product?.image?.url} alt={item.product?.name} style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 8, background: 'var(--bg-3)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', flexShrink: 0 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                <span style={{ color: 'white' }}>Total</span>
                <span style={{ background: 'linear-gradient(135deg, #7c6fff, #ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>${cart?.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
