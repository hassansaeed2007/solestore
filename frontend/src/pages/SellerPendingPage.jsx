import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiClock, FiXCircle, FiCheckCircle, FiLogOut } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const SellerPendingPage = () => {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isRejected = user?.sellerStatus === 'rejected';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #fff3e0 100%)', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          {isRejected ? (
            <>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#fff5f5', border: '3px solid var(--danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <FiXCircle size={36} color="var(--danger)" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--danger)' }}>
                Application Rejected
              </h2>
              <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: '1rem' }}>
                Unfortunately, your seller application was not approved.
              </p>
              {user?.sellerRejectionReason && (
                <div style={{
                  background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8,
                  padding: '1rem', marginBottom: '1.5rem', textAlign: 'left',
                }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.3rem', color: 'var(--danger)' }}>Reason:</p>
                  <p style={{ color: '#c53030', fontSize: '0.9rem' }}>{user.sellerRejectionReason}</p>
                </div>
              )}
              <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                You can contact support or re-apply with updated information.
              </p>
            </>
          ) : (
            <>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#fffbeb', border: '3px solid var(--warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                animation: 'pulse 2s infinite',
              }}>
                <FiClock size={36} color="var(--warning)" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                Application Under Review
              </h2>
              <p style={{ color: 'var(--gray)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Your seller application has been submitted successfully. Our admin team is reviewing your details.
              </p>

              {/* Status steps */}
              <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                {[
                  { label: 'Application Submitted', done: true },
                  { label: 'Under Admin Review', done: true, active: true },
                  { label: 'Account Activated', done: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: s.done ? (s.active ? 'var(--warning)' : 'var(--success)') : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s.done && !s.active
                        ? <FiCheckCircle size={16} color="white" />
                        : s.active
                          ? <FiClock size={14} color="white" />
                          : <span style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>{i + 1}</span>
                      }
                    </div>
                    <span style={{
                      fontWeight: s.active ? 700 : 500,
                      color: s.active ? 'var(--primary)' : s.done ? 'var(--success)' : 'var(--gray)',
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                background: '#fffbeb', border: '1px solid #fef08a', borderRadius: 8,
                padding: '0.9rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#92400e',
              }}>
                ⏳ Typical review time is 24–48 hours. You'll be able to access your dashboard once approved.
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-outline">Browse Store</Link>
            <button onClick={handleLogout} className="btn btn-dark"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <p style={{ marginTop: '1rem', color: 'var(--gray)', fontSize: '0.85rem' }}>
          Logged in as <strong>{user?.name}</strong> ({user?.email})
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,193,7,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(255,193,7,0); }
        }
      `}</style>
    </div>
  );
};

export default SellerPendingPage;
