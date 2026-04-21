import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendSellerOTP, verifySellerOTP, clearError, resetOTP } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiGrid, FiUser, FiBriefcase, FiFileText, FiMail, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import OTPVerify from '../components/OTPVerify';

const STEPS = ['Personal Info', 'Business Details', 'License & Submit', 'Verify Email'];

const SellerRegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, otpSent, otpEmail } = useSelector((s) => s.auth);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    businessName: '', businessAddress: '', phone: '', businessType: '', website: '',
    cnic: '', licenseNumber: '', description: '',
  });

  useEffect(() => { if (user?.role === 'seller') navigate('/seller'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);
  useEffect(() => () => dispatch(resetOTP()), [dispatch]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 0 && form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setStep((s) => s + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { confirm, ...data } = form;
    dispatch(sendSellerOTP(data));
  };

  const handleVerify = (otp) => {
    dispatch(verifySellerOTP({ email: otpEmail, otp }));
  };

  const stepIcons = [<FiUser size={16} />, <FiBriefcase size={16} />, <FiFileText size={16} />, <FiMail size={16} />];
  const activeStep = otpSent ? 3 : step;

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      overflow: 'hidden',
    }}>
      {/* Background video */}
      <video
        autoPlay muted loop playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      >
        <source src="/shoes-bg.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)', zIndex: 1 }} />
      <div style={{ width: '100%', maxWidth: 580, position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', borderRadius: 12, padding: '0.6rem', color: '#0a0a0a', display: 'flex' }}>
            <FiGrid size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'white' }}>Seller Application</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>Apply for a seller account on SoleStore</p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', marginBottom: '2rem', gap: '0.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: i <= activeStep ? '#0f3460' : 'var(--border)',
                color: i <= activeStep ? 'white' : 'var(--gray)',
                fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s',
              }}>
                {i < activeStep ? '✓' : stepIcons[i]}
              </div>
              <span style={{
                fontSize: '0.72rem', textAlign: 'center',
                color: i <= activeStep ? '#0f3460' : 'var(--gray)',
                fontWeight: i === activeStep ? 700 : 400,
              }}>{s}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '2rem', background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(201,169,110,0.2)', backdropFilter: 'blur(10px)' }}>
          {/* OTP screen */}
          {otpSent ? (
            <OTPVerify
              email={otpEmail}
              onVerify={handleVerify}
              onBack={() => dispatch(resetOTP())}
              loading={loading}
            />
          ) : (
            <>
              {/* Step 1 — Personal Info */}
              {step === 0 && (
                <form onSubmit={nextStep}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', color: '#0f3460' }}>Personal Information</h3>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input className="form-control" placeholder="Your full name" value={form.name} onChange={set('name')} required />
                  </div>
                  <div className="form-group">
                    <label>Gmail Address</label>
                    <input className="form-control" type="email" placeholder="seller@gmail.com" value={form.email} onChange={set('email')} required />
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginTop: '0.3rem' }}>
                      Verification code will be sent here
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Password</label>
                      <input className="form-control" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input className="form-control" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" style={{ background: '#0f3460', color: 'white', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      Next <FiChevronRight />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2 — Business Details */}
              {step === 1 && (
                <form onSubmit={nextStep}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', color: '#0f3460' }}>Business Details</h3>
                  <div className="form-group">
                    <label>Business / Shop Name</label>
                    <input className="form-control" placeholder="e.g. Ahmed Shoes Store" value={form.businessName} onChange={set('businessName')} required />
                  </div>
                  <div className="form-group">
                    <label>Business Address</label>
                    <input className="form-control" placeholder="Full address of your shop/business" value={form.businessAddress} onChange={set('businessAddress')} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input className="form-control" placeholder="+92 300 0000000" value={form.phone} onChange={set('phone')} required />
                    </div>
                    <div className="form-group">
                      <label>Business Type</label>
                      <select className="form-control" value={form.businessType} onChange={set('businessType')} required>
                        <option value="">Select type</option>
                        <option value="sole_trader">Sole Trader</option>
                        <option value="partnership">Partnership</option>
                        <option value="pvt_ltd">Private Limited</option>
                        <option value="retailer">Retailer</option>
                        <option value="wholesaler">Wholesaler</option>
                        <option value="manufacturer">Manufacturer</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Website (optional)</label>
                    <input className="form-control" placeholder="https://yourshop.com" value={form.website} onChange={set('website')} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button type="button" onClick={() => setStep(0)} style={{ background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray)' }}>
                      <FiChevronLeft /> Back
                    </button>
                    <button type="submit" style={{ background: '#0f3460', color: 'white', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      Next <FiChevronRight />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3 — License & Submit */}
              {step === 2 && (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0f3460' }}>License & Verification</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                    This information will be reviewed by our admin team before your account is activated.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>CNIC / National ID</label>
                      <input className="form-control" placeholder="00000-0000000-0" value={form.cnic} onChange={set('cnic')} required />
                    </div>
                    <div className="form-group">
                      <label>Business License Number</label>
                      <input className="form-control" placeholder="License / Registration No." value={form.licenseNumber} onChange={set('licenseNumber')} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Business Description</label>
                    <textarea className="form-control" rows={4} placeholder="Describe your business, what you sell, your experience..."
                      value={form.description} onChange={set('description')} style={{ resize: 'vertical' }} />
                  </div>
                  <div style={{ background: '#e8f4fd', border: '1px solid #bee3f8', borderRadius: 8, padding: '0.9rem 1rem', marginBottom: '1.2rem', fontSize: '0.85rem', color: '#2b6cb0' }}>
                    ℹ️ After submitting, a verification code will be sent to <strong>{form.email}</strong>. Verify your email to complete registration.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray)' }}>
                      <FiChevronLeft /> Back
                    </button>
                    <button type="submit" disabled={loading} style={{ background: '#0f3460', color: 'white', border: 'none', borderRadius: 8, padding: '0.7rem 1.8rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                      {loading ? 'Sending code...' : '📧 Send Verification Code'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {!otpSent && (
          <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.9rem', color: 'var(--gray)' }}>
            Already have an account?{' '}
            <Link to="/login/seller" style={{ color: '#0f3460', fontWeight: 600 }}>Seller login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default SellerRegisterPage;
