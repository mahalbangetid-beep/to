'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  basePrice: number;
  totalSold: number;
  isFeatured: boolean;
  createdAt: string;
  category?: { name: string };
  variants?: Array<{ name: string; price: number; stock: number }>;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'badge-success' },
  draft: { label: 'Draft', cls: 'badge-neutral' },
  hidden: { label: 'Hidden', cls: 'badge-warning' },
  out_of_stock: { label: 'Habis', cls: 'badge-danger' },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get<any>(`/admin/products${params}`);
      const data = res?.data || res;
      setProducts(data?.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>🏷️ Kelola Produk</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '280px' }}
          />
          <Link href="/admin/products/new" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>+ Tambah</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} />
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>🏷️</p>
          <p className="text-muted text-sm">Belum ada produk</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Produk</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Kategori</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Harga</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Terjual</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const st = STATUS_LABEL[product.status] || STATUS_LABEL.draft;
                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>/{product.slug}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {product.category?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-secondary)' }}>
                      {formatPrice(product.basePrice)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                      {product.totalSold}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link href={`/admin/products/${product.id}`} className="btn btn-ghost btn-sm">✏️ Edit</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
