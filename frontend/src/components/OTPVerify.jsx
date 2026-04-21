import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resendOTP, clearError } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

/**
 * OTP input + verify screen
 * Props:
 *   email       - email OTP was sent to
 *   onVerify    - called with (otp) when user submits
 *   onBack      - called when user wants to go back
 *   loading     - loading state
 */
const OTPVerify = ({ email, onVerify, onBack, loading }) => {
  const dispatch = useDispatch();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) { toast.error('Enter the complete 6-digit code'); return; }
    onVerify(otp);
  };

  const handleResend = async () => {
    const result = await dispatch(resendOTP(email));  // email string directly — thunk expects string
    if (!result.error) {
      toast.success('New code sent!');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } else {
      toast.error(result.payload || 'Failed to resend');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
      <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Check your email</h3>
      <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
        We sent a 6-digit verification code to
      </p>
      <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '1.8rem', fontSize: '0.95rem' }}>
        {email}
      </p>

      <form onSubmit={handleSubmit}>
        {/* OTP boxes */}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '1.5rem' }}
          onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: 48, height: 56, textAlign: 'center', fontSize: '1.4rem',
                fontWeight: 800, border: `2px solid ${d ? 'var(--secondary)' : 'var(--border-2)'}`,
                borderRadius: 10, outline: 'none', fontFamily: 'inherit',
                background: d ? 'rgba(124,111,255,0.1)' : 'var(--bg-3)',
                color: 'white',
                transition: 'border-color 0.2s',
              }}
            />
          ))}
        </div>

        <button type="submit" disabled={loading}
          style={{
            width: '100%', padding: '0.8rem', background: 'var(--secondary)',
            color: 'white', border: 'none', borderRadius: 8,
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginBottom: '1rem',
          }}>
          {loading ? 'Verifying...' : 'Verify & Create Account'}
        </button>
      </form>

      {/* Resend */}
      <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
        Didn't receive the code?{' '}
        {countdown > 0 ? (
          <span style={{ color: 'var(--gray)' }}>Resend in {countdown}s</span>
        ) : (
          <button onClick={handleResend} style={{
            background: 'none', border: 'none', color: 'var(--secondary)',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
          }}>
            Resend code
          </button>
        )}
      </p>

      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: 'var(--gray)',
        cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.8rem',
        textDecoration: 'underline',
      }}>
        ← Change email
      </button>
    </div>
  );
};

export default OTPVerify;
