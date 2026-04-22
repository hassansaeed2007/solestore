import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { resetCart } from '../store/slices/cartSlice';

const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const requestLogout = () => setShowConfirm(true);
  const cancelLogout = () => setShowConfirm(false);
  const confirmLogout = () => {
    dispatch(logout());
    try { dispatch(resetCart()); } catch {}
    setShowConfirm(false);
    navigate('/');
  };

  return { showConfirm, requestLogout, cancelLogout, confirmLogout };
};

export default useLogout;
