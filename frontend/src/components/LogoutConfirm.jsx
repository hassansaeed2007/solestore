import React from 'react';
import { FiLogOut, FiX } from 'react-icons/fi';

const LogoutConfirm = ({ onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '1rem',
    animation: 'fadeIn 0.2s ease',
  }}>
    <div style={{
      background: 'linear-gradient(145deg, #141414, #0f0f0f)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      width: '100%', maxWidth: 500,
      padding: '2.5rem 2rem 2rem',
      textAlign: 'center',
      boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    }}>

      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, rgba(239,68,68,0.25), rgba(239,68,68,0.08))',
        border: '1.5px solid rgba(239,68,68,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem',
        boxShadow: '0 0 30px rgba(239,68,68,0.15)',
      }}>
        <FiLogOut size={26} color="#f87171" />
      </div>

      {/* Title */}
      <h3 style={{
        color: 'white', fontWeight: 700, fontSize: '1.25rem',
        marginBottom: '0.6rem', letterSpacing: '-0.3px',
        fontFamily: "'Playfair Display', serif",
      }}>
        Sign Out?
      </h3>

      {/* Subtitle */}
      <p style={{
        color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem',
        marginBottom: '2rem', lineHeight: 1.7, maxWidth: 280, margin: '0 auto 2rem',
      }}>
        Are you sure you want to sign out of your account?
      </p>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '0.6rem 0.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer', fontFamily: 'inherit',
          fontWeight: 600, fontSize: '0.9rem',
          transition: 'all 0.2s', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          whiteSpace: 'nowrap',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}>
          <FiX size={15} /> Cancel
        </button>

        <button onClick={onConfirm} style={{
          flex: 1, padding: '0.6rem',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          border: 'none', borderRadius: 12,
          color: 'white', cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 700,
          fontSize: '0.9rem', whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(239,68,68,0.35)',
          transition: 'all 0.2s', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(239,68,68,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(239,68,68,0.35)';
          }}>
          <FiLogOut size={15} /> Yes, Sign Out
        </button>
      </div>
    </div>

    <style>{`
      @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
    `}</style>
  </div>
);

export default LogoutConfirm;
