import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { resetCart } from '../store/slices/cartSlice';
import { FiShoppingCart, FiMenu, FiX, FiLogOut, FiShield, FiGrid,
         FiHome, FiPackage, FiUser, FiShoppingBag } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [location]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    navigate('/');
    setOpen(false);
  };

  // Build menu items based on role
  const menuItems = () => {
    const items = [{ to: '/', label: 'Home', icon: <FiHome size={15} /> },
                   { to: '/products', label: 'Shop', icon: <FiShoppingBag size={15} /> }];

    if (!user) {
      items.push(
        { to: '/login', label: 'Customer Login', icon: <FiUser size={15} /> },
        { to: '/register/customer', label: 'Sign Up Free', icon: <FiUser size={15} />, highlight: true },
        { to: '/login/seller', label: 'Seller Login', icon: <FiGrid size={15} /> },
        { to: '/login/admin', label: 'Admin Login', icon: <FiShield size={15} />, dim: true },
      );
    }

    if (user?.role === 'customer') {
      items.push(
        { to: '/dashboard', label: 'My Account', icon: <FiUser size={15} /> },
        { to: '/orders', label: 'My Orders', icon: <FiPackage size={15} /> },
        { to: '/cart', label: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}`, icon: <FiShoppingCart size={15} /> },
      );
    }

    if (user?.role === 'seller' && user?.sellerStatus === 'approved') {
      items.push({ to: '/seller', label: 'Seller Dashboard', icon: <FiGrid size={15} /> });
    }

    if (user?.role === 'admin') {
      items.push({ to: '/admin', label: 'Admin Panel', icon: <FiShield size={15} /> });
    }

    return items;
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3643/3643879.png"
            alt="logo"
            style={{ width: 30, height: 30, objectFit: 'contain', filter: 'sepia(1) saturate(3) hue-rotate(5deg) brightness(0.85)' }}
          />
          <span className="brand-name">Sole<span className="brand-gold">Store</span></span>
        </Link>

        {/* Right side — cart (customer) + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} ref={menuRef}>

          {/* Cart icon always visible for customers */}
          {user?.role === 'customer' && (
            <Link to="/cart" className="cart-link">
              <FiShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          {/* Hamburger */}
          <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="nav-dropdown">
              {/* User info if logged in */}
              {user && (
                <div className="nav-user-info">
                  <div className="nav-user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="nav-user-name">{user.name}</p>
                    <p className="nav-user-role">{user.role}</p>
                  </div>
                </div>
              )}

              {/* Divider */}
              {user && <div className="nav-divider" />}

              {/* Menu items */}
              {menuItems().map((item) => (
                <Link key={item.to + item.label} to={item.to}
                  className={`nav-item ${item.highlight ? 'nav-item-gold' : ''} ${item.dim ? 'nav-item-dim' : ''}`}
                  onClick={() => setOpen(false)}>
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {/* Logout */}
              {user && (
                <>
                  <div className="nav-divider" />
                  <button className="nav-item nav-item-logout" onClick={handleLogout}>
                    <span className="nav-item-icon"><FiLogOut size={15} /></span>
                    Sign Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
