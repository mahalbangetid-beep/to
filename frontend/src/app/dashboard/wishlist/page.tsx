'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    imageUrl: string | null;
    shortDesc: string | null;
  } | null;
}

export default function DashboardWishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get<{ data: { items: WishlistItem[] } }>('/wishlist');
      setItems((res as any).data?.items || (res as any).items || []);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems(items.filter((i) => i.productId !== productId));
    } catch { /* skip */ }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px' }}><div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>❤️ Wishlist</h1>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>❤️</p>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Wishlist kosong</p>
          <p className="text-muted text-sm mb-3">Simpan produk favoritmu untuk nanti</p>
          <Link href="/products" className="btn btn-primary">Jelajahi Produk</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ position: 'relative' }}>
              {/* Remove button */}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleRemove(item.productId)}
                style={{ position: 'absolute', top: '12px', right: '12px' }}
                title="Hapus dari wishlist"
              >
                ❌
              </button>

              {/* Product image placeholder */}
              <div style={{
                height: '120px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)',
                marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px',
              }}>
                {item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                ) : '🏷️'}
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                {item.product?.name || 'Produk tidak tersedia'}
              </h3>
              {item.product?.shortDesc && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: '1.4' }}>
                  {item.product.shortDesc.length > 80 ? item.product.shortDesc.slice(0, 80) + '...' : item.product.shortDesc}
                </p>
              )}

              <div className="flex justify-between items-center" style={{ marginTop: '8px' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                  {item.product ? formatPrice(item.product.basePrice) : '—'}
                </span>
                {item.product && (
                  <Link href={`/products/${item.product.slug}`} className="btn btn-primary btn-sm">
                    Lihat
                  </Link>
                )}
              </div>

              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                Ditambahkan {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
