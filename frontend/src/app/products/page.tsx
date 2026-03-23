'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';
import { api } from '@/lib/api';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  badges: string[];
  totalSold: number;
  type: string;
  categoryId: string;
  shortDesc: string;
  images: string[];
  variants?: Array<{ price: number; originalPrice?: number }>;
  category?: { name: string; slug: string };
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);
      if (sortBy) params.set('sort', sortBy);

      const [prodRes, catRes] = await Promise.all([
        api.get<{ data: { products: ProductItem[] } }>(`/products?${params.toString()}`),
        api.get<{ data: { categories: CategoryItem[] } }>('/categories'),
      ]);

      setProducts((prodRes as any).data?.products || (prodRes as any).products || []);
      setCategories((catRes as any).data?.categories || (catRes as any).categories || []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { setActiveCategory(categoryParam); }, [categoryParam]);

  // Client-side sort (in case API doesn't sort)
  let sorted = [...products];
  switch (sortBy) {
    case 'price_asc':
      sorted.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
      break;
    case 'price_desc':
      sorted.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
      break;
    case 'popular':
      sorted.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
      break;
    default:
      break;
  }

  return (
    <main>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links">
            <Link href="/products">Produk</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Masuk</Link>
          </nav>
        </div>
      </header>

      <div className="container">
        <div className="detail-breadcrumb" style={{ paddingTop: '24px' }}>
          <Link href="/">Beranda</Link> / <span>Produk</span>
          {activeCategory && (
            <> / <span style={{ color: 'var(--color-text)' }}>
              {categories.find(c => c.slug === activeCategory)?.name || activeCategory}
            </span></>
          )}
        </div>

        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <div className="filter-group">
              <h4>Cari Produk</h4>
              <input
                type="text"
                className="form-input"
                placeholder="Ketik nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="product-search"
              />
            </div>

            <div className="filter-group">
              <h4>Kategori</h4>
              <div className="filter-list">
                <button
                  className={`filter-item ${!activeCategory ? 'active' : ''}`}
                  onClick={() => setActiveCategory('')}
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    className={`filter-item ${activeCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.slug)}
                  >
                    {cat.icon || '📁'} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="catalog-header">
              <span className="catalog-count">
                {sorted.length} produk ditemukan
              </span>
              <select
                className="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                id="sort-select"
              >
                <option value="newest">Terbaru</option>
                <option value="popular">Terpopuler</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
              </div>
            ) : sorted.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Produk tidak ditemukan</p>
                <p className="text-muted text-sm">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            ) : (
              <div className="product-grid">
                {sorted.map((product) => {
                  const lowestPrice = product.variants?.length
                    ? Math.min(...product.variants.map(v => Number(v.price)))
                    : Number(product.basePrice);
                  const originalPrice = product.variants?.length
                    ? product.variants.find(v => v.originalPrice)?.originalPrice
                    : undefined;

                  return (
                    <Link
                      href={`/products/${product.slug}`}
                      key={product.id}
                      className="product-card card card-hover"
                    >
                      {/* Product image */}
                      {product.images?.[0] ? (
                        <div style={{ height: '140px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '12px' }}>
                          <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div className="product-card-top">
                          <span className="product-type-badge">
                            {PRODUCT_TYPE_LABELS[product.type] || product.type}
                          </span>
                          {product.badges?.length > 0 && (
                            <div className="product-badges">
                              {product.badges.map((b, i) => <span key={i}>{b}</span>)}
                            </div>
                          )}
                        </div>
                      )}
                      <h3 className="product-card-name">{product.name}</h3>
                      {product.shortDesc && (
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                          {product.shortDesc.length > 60 ? product.shortDesc.slice(0, 60) + '...' : product.shortDesc}
                        </p>
                      )}
                      <div className="product-card-meta">
                        <span className="product-sold">
                          {(product.totalSold || 0).toLocaleString()} terjual
                        </span>
                        {product.category && (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {product.category.name}
                          </span>
                        )}
                      </div>
                      <div className="product-card-price">
                        <span className="price-current">{formatPrice(lowestPrice)}</span>
                        {originalPrice && (
                          <span className="price-original">{formatPrice(originalPrice)}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
