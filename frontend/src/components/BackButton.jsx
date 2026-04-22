import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const BackButton = ({ style }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)',
        color: 'rgba(201,169,110,0.8)', padding: '0.45rem 1rem',
        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
        fontFamily: 'inherit', transition: 'all 0.2s', borderRadius: 0,
        marginBottom: '1.2rem',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.15)'; e.currentTarget.style.color = '#c9a96e'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.08)'; e.currentTarget.style.color = 'rgba(201,169,110,0.8)'; }}
    >
      <FiArrowLeft size={14} /> Back
    </button>
  );
};

export default BackButton;
