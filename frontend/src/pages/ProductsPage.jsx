import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice';
import { FiSearch, FiFilter, FiX, FiShoppingCart, FiStar, FiArrowRight } from 'react-icons/fi';
import useReveal from '../hooks/useReveal';

const CATEGORIES = ['sneakers','boots','sandals','formal','sports','casual','kids'];
const SORTS = [
  { label: 'Newest First', value: '' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

const Stars = ({ rating }) => (
  <span>
    {[1,2,3,4,5].map((s) => (
      <span key={s} style={{ color: s <= Math.round(rating) ? '#c9a96e' : 'rgba(201,169,110,0.2)', fontSize: '0.85rem' }}>★</span>
    ))}
  </span>
);

const ProductCard = ({ product }) => (
  <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={{
      background: '#0a0a0a', border: '1px solid rgba(201,169,110,0.15)',
      borderRadius: 0, overflow: 'hidden', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', cursor: 'pointer',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(201,169,110,0.45)';
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 20px 50px rgba(201,169,110,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(201,169,110,0.12)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}>
      {/* Image */}
      <div style={{ height: 280, overflow: 'hidden', background: '#111', position: 'relative' }}>
        <img src={product.image?.url} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
        {/* Stock badge */}
        {product.stock === 0 && (
          <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(239,68,68,0.9)', color: 'white', borderRadius: 50, padding: '0.25rem 0.8rem', fontSize: '0.72rem', fontWeight: 700, backdropFilter: 'blur(8px)' }}>Out of Stock</div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(201,169,110,0.9)', color: '#0a0a1f', borderRadius: 50, padding: '0.25rem 0.8rem', fontSize: '0.72rem', fontWeight: 800, backdropFilter: 'blur(8px)' }}>Only {product.stock} left</div>
        )}
        {/* Category pill */}
        <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(10,10,20,0.75)', border: '1px solid rgba(201,169,110,0.25)', color: '#c9a96e', borderRadius: 50, padding: '0.25rem 0.8rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', backdropFilter: 'blur(8px)' }}>
          {product.category}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.3rem 1.4rem', background: '#0a0a0a' }}>
        <p style={{ fontSize: '0.72rem', color: 'rgba(201,169,110,0.6)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          {product.brand}
        </p>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '0.6rem', fontFamily: "'Playfair Display',serif", lineHeight: 1.3 }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
          <Stars rating={product.averageRating} />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>({product.numReviews})</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 900, fontSize: '1.3rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: "'Playfair Display',serif" }}>
            ${product.price.toFixed(2)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', borderRadius: 50, padding: '0.4rem 0.9rem', color: '#0a0a1f', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.3px' }}>
            <FiShoppingCart size={13} /> Shop
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { products, pagination, loading } = useSelector((s) => s.products);
  const [searchParams] = useSearchParams();
  useReveal();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    const params = { page, limit: 9 };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    dispatch(fetchProducts(params));
  }, [dispatch, page, keyword, category, sort, minPrice, maxPrice]);

  useEffect(() => { load(); }, [load]);

  const clearFilters = () => { setKeyword(''); setCategory(''); setSort(''); setMinPrice(''); setMaxPrice(''); setPage(1); };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>

      {/* ── Hero bar ── */}
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(201,169,110,0.12)', padding: '3rem 0 2rem' }}>
        <div style={{ maxWidth: '100%', padding: '0 1rem' }}>
          <p style={{ color: '#c9a96e', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>Our Collection</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            Premium <span style={{ background: 'linear-gradient(135deg,#c9a96e,#f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Footwear</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            {pagination?.total || 0} products available{category && ` in "${category}"`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '100%', padding: '2rem 1rem' }}>

        {/* ── Search bar ── */}
        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} style={{ flex: 1, display: 'flex', gap: '0.8rem', minWidth: 260 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(201,169,110,0.5)', pointerEvents: 'none' }} size={16} />
              <input
                placeholder="Search shoes, brands..."
                value={keyword} onChange={(e) => setKeyword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', background: '#111', border: '1px solid rgba(201,169,110,0.18)', borderRadius: 0, color: 'white', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201,169,110,0.18)'}
              />
            </div>
            <button type="submit" style={{ padding: '0.75rem 1.6rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a1f', border: 'none', borderRadius: 50, fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', letterSpacing: '0.3px', boxShadow: '0 4px 16px rgba(201,169,110,0.3)', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,169,110,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,169,110,0.3)'; }}>
              Search
            </button>
          </form>
          <button onClick={() => setShowFilters(!showFilters)}
            style={{ padding: '0.75rem 1.2rem', background: 'rgba(201,169,110,0.08)', border: `1px solid ${showFilters ? 'rgba(201,169,110,0.5)' : 'rgba(201,169,110,0.18)'}`, color: '#c9a96e', borderRadius: 50, fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            <FiFilter size={15} /> Filters
          </button>
          {(category || minPrice || maxPrice || sort || keyword) && (
            <button onClick={clearFilters}
              style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 50, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'inherit' }}>
              <FiX size={14} /> Clear
            </button>
          )}
        </div>

        {/* ── Filters panel ── */}
        {showFilters && (
          <div style={{ background: '#111', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 0, padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            {[
              { label: 'Category', content: (
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  style={{ background: '#0a0a0a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 0, color: 'white', padding: '0.6rem 0.9rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', minWidth: 150 }}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              )},
              { label: 'Sort By', content: (
                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  style={{ background: '#0a0a0a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 0, color: 'white', padding: '0.6rem 0.9rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', minWidth: 160 }}>
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              )},
              { label: 'Min Price', content: <input type="number" placeholder="$0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ background: '#0a0a0a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 0, color: 'white', padding: '0.6rem 0.9rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', width: 100 }} /> },
              { label: 'Max Price', content: <input type="number" placeholder="$999" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ background: '#0a0a0a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 0, color: 'white', padding: '0.6rem 0.9rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', width: 100 }} /> },
            ].map((f) => (
              <div key={f.label}>
                <p style={{ color: 'rgba(201,169,110,0.6)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.4rem' }}>{f.label}</p>
                {f.content}
              </div>
            ))}
          </div>
        )}

        {/* ── Category pills ── */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['', ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => { setCategory(c); setPage(1); }}
              style={{ padding: '0.4rem 1.1rem', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit', transition: 'all 0.2s', letterSpacing: '0.3px',
                background: category === c ? 'linear-gradient(135deg,#c9a96e,#f0d080)' : 'rgba(201,169,110,0.06)',
                color: category === c ? '#0a0a1f' : 'rgba(201,169,110,0.6)',
                border: category === c ? 'none' : '1px solid rgba(201,169,110,0.15)',
                boxShadow: category === c ? '0 4px 14px rgba(201,169,110,0.3)' : 'none',
              }}>
              {c === '' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <div style={{ width: 44, height: 44, border: '3px solid rgba(201,169,110,0.15)', borderTop: '3px solid #c9a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: '#111', border: '1px solid rgba(201,169,110,0.1)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👟</div>
            <h3 style={{ color: 'white', fontFamily: "'Playfair Display',serif", marginBottom: '0.5rem' }}>No products found</h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', marginBottom: '2.5rem', background: 'rgba(201,169,110,0.1)' }}>
            {products.map((p) => <div key={p._id} style={{ background: '#0a0a0a' }}><ProductCard product={p} /></div>)}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination?.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', fontFamily: 'inherit', transition: 'all 0.2s',
                  background: p === page ? 'linear-gradient(135deg,#c9a96e,#f0d080)' : 'rgba(201,169,110,0.06)',
                  color: p === page ? '#0a0a1f' : 'rgba(201,169,110,0.6)',
                  border: p === page ? 'none' : '1px solid rgba(201,169,110,0.15)',
                  boxShadow: p === page ? '0 4px 14px rgba(201,169,110,0.3)' : 'none',
                  transform: p === page ? 'scale(1.1)' : 'scale(1)',
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer CTA ── */}
      <div style={{ borderTop: '1px solid rgba(201,169,110,0.1)', padding: '3rem 1.5rem', textAlign: 'center', background: '#0a0a0a' }}>
        <p style={{ color: '#c9a96e', fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.8rem' }}>Want to Sell?</p>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.6rem', color: 'white', marginBottom: '1rem' }}>Join Our Seller Community</h3>
        <Link to="/register/seller" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#c9a96e,#f0d080)', color: '#0a0a1f', padding: '0.8rem 2rem', borderRadius: 50, fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(201,169,110,0.3)', transition: 'all 0.3s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,169,110,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,169,110,0.3)'; }}>
          Apply as Seller <FiArrowRight size={15} />
        </Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ProductsPage;
