import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiShield, FiTruck, FiRefreshCw, FiHeadphones, FiZap } from 'react-icons/fi';
import useReveal from '../hooks/useReveal';

const CATEGORIES = [
  { label: 'Sneakers', value: 'sneakers', color: '#c9a96e', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85' },
  { label: 'Boots',    value: 'boots',    color: '#c9a96e', img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=85' },
  { label: 'Sandals',  value: 'sandals',  color: '#c9a96e', img: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=85' },
  { label: 'Formal',   value: 'formal',   color: '#c9a96e', img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=85' },
  { label: 'Sports',   value: 'sports',   color: '#c9a96e', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=85' },
  { label: 'Kids',     value: 'kids',     color: '#c9a96e', img: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=400&q=85' },
  { label: 'Casual',   value: 'casual',   color: '#c9a96e', img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=85' },
];

const FEATURES = [
  { icon: <FiTruck size={24} />,      title: 'Free Shipping',   desc: 'Free delivery on all orders above $50.',    color: '#7c6fff' },
  { icon: <FiRefreshCw size={24} />,  title: 'Easy Returns',    desc: '30-day hassle-free return policy.',          color: '#10b981' },
  { icon: <FiShield size={24} />,     title: 'Secure Payments', desc: 'SSL encrypted & Stripe secured payments.',   color: '#f59e0b' },
  { icon: <FiHeadphones size={24} />, title: '24/7 Support',    desc: 'Always here to help you anytime.',           color: '#ef4444' },
];

const TESTIMONIALS = [
  { name: 'Sarah Johnson', role: 'Fashion Blogger',    rating: 5, text: 'Absolutely love SoleStore! Quality is incredible and delivery was super fast.', avatar: 'S' },
  { name: 'Ahmed Khan',    role: 'Verified Buyer',     rating: 5, text: 'Best online shoe store I have used. Huge variety, great prices, seamless checkout.', avatar: 'A' },
  { name: 'Maria Garcia',  role: 'Sneaker Enthusiast', rating: 5, text: 'Found my dream sneakers here. Seller was responsive and shipping was lightning fast.', avatar: 'M' },
  { name: 'James Wilson',  role: 'Regular Customer',   rating: 4, text: 'Great platform with amazing selection. Search and filter features are excellent.', avatar: 'J' },
];

const STATS = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '10K+', label: 'Products Listed' },
  { value: '500+', label: 'Verified Sellers' },
  { value: '4.9★', label: 'Average Rating' },
];

const Stars = ({ n }) => Array.from({ length: n }).map((_, i) => <span key={i} style={{ color: '#f59e0b' }}>★</span>);

const HomePage = () => {
  useReveal();

  return (
    <div style={{ overflowX: 'hidden', background: 'var(--bg)' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden', color: 'white' }}>
        {/* Full background image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://ladirstore.com/cdn/shop/articles/BANNER_for_top_5_formal_shoes.webp?v=1735982297&width=1100"
            alt="Hero Banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
          {/* Dark overlay so text is readable */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,10,31,0.92) 0%, rgba(10,10,31,0.7) 55%, rgba(10,10,31,0.2) 100%)' }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '6rem 1.5rem' }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.35)', borderRadius: 50, padding: '0.4rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: '#c9a96e', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600 }}>
              <FiZap size={12} /> New Collection 2026
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.2rem', fontFamily: "'Playfair Display',serif" }}>
              Step Into Your<br />
              <span style={{ background: 'linear-gradient(135deg,#c9a96e 0%,#f0d080 50%,#c9a96e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Perfect Pair</span>
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, marginBottom: '2rem', maxWidth: 460, fontWeight: 300, letterSpacing: '0.3px' }}>
              Discover thousands of premium shoes from top brands worldwide. Find your style, find your fit.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a1f', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.5px', boxShadow: '0 8px 24px rgba(201,169,110,0.4)', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(201,169,110,0.6)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,169,110,0.4)'; }}>
                Shop Now <FiArrowRight size={15} />
              </Link>
              <Link to="/register/seller" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: '#c9a96e', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', border: '1.5px solid rgba(201,169,110,0.45)', letterSpacing: '0.5px', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.08)'; e.currentTarget.style.borderColor = '#c9a96e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.45)'; }}>
                Sell With Us
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
              {STATS.map((s) => (
                <div key={s.label}>
                  <p style={{ fontWeight: 900, fontSize: '1.6rem', color: '#c9a96e', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Browse Collection</p>
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '1rem' }}>
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.value} to={`/products?category=${cat.value}`} className={`reveal delay-${Math.min(i+1,5)}`} style={{ textDecoration: 'none' }}>
                <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', transition: 'all 0.3s', cursor: 'pointer', background: 'var(--bg-card)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${cat.color}30`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ height: 110, overflow: 'hidden', background: 'var(--bg-3)' }}>
                    <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
                  </div>
                  <div style={{ padding: '0.7rem', textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, color: 'white', fontSize: '0.82rem' }}>{cat.label}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL WIDTH BANNER ── */}
      <section style={{ position: 'relative', overflow: 'hidden', height: 750 }}>
        <img src="https://i.ebayimg.com/images/g/aTwAAOSwRzBnYnaL/s-l1600.webp" alt="Shoe Collection Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(10,10,31,0.85) 0%,rgba(10,10,31,0.4) 50%,transparent 100%)' }} />
        <div className="container" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: 480 }}>
            <p style={{ color: '#c9a96e', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Exclusive Collection</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '1rem' }}>
              Premium Shoes<br />
              <span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>For Every Occasion</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', marginBottom: '1.8rem', lineHeight: 1.8, fontWeight: 300 }}>
              From casual walks to formal events — find the perfect pair that defines your style.
            </p>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a1f', padding: '0.85rem 2rem', borderRadius: 50, fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none', letterSpacing: '0.5px', boxShadow: '0 8px 24px rgba(201,169,110,0.4)', transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(201,169,110,0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,169,110,0.4)'; }}>
              Explore Collection <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Why Choose Us</p>
            <h2 className="section-title">Shopping Made Better</h2>
          </div>
          <div className="grid-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`reveal delay-${i+1}`}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.8rem', textAlign: 'center', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = f.color + '60'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${f.color}18`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>{f.icon}</div>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem', color: 'white' }}>{f.title}</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '0.85rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'linear-gradient(135deg,#0a0a1f 0%,#1a0a3e 100%)', padding: '4rem 1.5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '2rem', textAlign: 'center' }}>
            {STATS.map((s, i) => (
              <div key={s.label} className={`reveal delay-${i+1}`}>
                <p style={{ fontWeight: 900, fontSize: '2.2rem', background: 'linear-gradient(135deg,#7c6fff,#ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', marginTop: '0.3rem' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer Love</p>
            <h2 className="section-title">What People Say</h2>
          </div>
          <div className="grid-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`reveal delay-${i+1}`}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ color: '#f59e0b', fontSize: '0.95rem' }}><Stars n={t.rating} /></div>
                  <p style={{ color: 'var(--gray)', fontSize: '0.88rem', lineHeight: 1.8, flex: 1, fontStyle: 'italic' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6fff,#ff6b8a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>{t.avatar}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{t.name}</p>
                      <p style={{ color: 'var(--gray)', fontSize: '0.72rem' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg,#0a0a1f 0%,#1a1200 50%,#0a0a1f 100%)', padding: '5rem 1.5rem', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,169,110,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="reveal">
            <p style={{ color: '#c9a96e', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>Join Our Platform</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>Ready to Start Selling?</h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem', fontWeight: 300, lineHeight: 1.8 }}>
              Join 500+ verified sellers on SoleStore and reach thousands of shoe lovers every day.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register/seller" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a1f', padding: '0.9rem 2.2rem', borderRadius: 50, fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', letterSpacing: '0.5px', boxShadow: '0 8px 24px rgba(201,169,110,0.35)', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(201,169,110,0.55)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,169,110,0.35)'; }}>
                Apply as Seller <FiArrowRight size={15} />
              </Link>
              <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: '#c9a96e', padding: '0.9rem 2.2rem', borderRadius: 50, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', border: '1.5px solid rgba(201,169,110,0.4)', transition: 'all 0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,169,110,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0a0a1f', color: 'rgba(255,255,255,0.55)', padding: '3rem 1.5rem 2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', marginBottom: '0.8rem' }}>
                👟 <span style={{ background: 'linear-gradient(135deg,#7c6fff,#ff6b8a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SoleStore</span>
              </p>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>Your premium destination for shoes. Quality, style, and comfort.</p>
            </div>
            {[
              { title: 'Shop', links: ['Sneakers','Boots','Sandals','Formal','Sports'] },
              { title: 'Account', links: ['Login','Register','My Orders','Cart'] },
              { title: 'Sellers', links: ['Become a Seller','Seller Login','How it Works'] },
            ].map((col) => (
              <div key={col.title}>
                <p style={{ fontWeight: 700, color: 'white', marginBottom: '0.8rem', fontSize: '0.88rem' }}>{col.title}</p>
                {col.links.map((l) => (
                  <p key={l} style={{ fontSize: '0.82rem', marginBottom: '0.4rem', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#a78bfa'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.55)'}>{l}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.78rem' }}>© 2025 SoleStore. All rights reserved.</p>
            <p style={{ fontSize: '0.78rem' }}>Made with ❤️ for shoe lovers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
