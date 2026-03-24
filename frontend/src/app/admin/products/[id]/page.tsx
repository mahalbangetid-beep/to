'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';

interface Category {
  id: string;
  name: string;
}

interface Variant {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  durationDays?: number;
  stock: number;
  isRecommended?: boolean;
}

export default function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Product fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('ai_premium');
  const [basePrice, setBasePrice] = useState(0);
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState('semi_auto');
  const [status, setStatus] = useState('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [slaText, setSlaText] = useState('');
  const [rules, setRules] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get<{ data: { categories: Category[] } }>('/admin/categories'),
          api.get<{ data: any }>(`/admin/products/${id}`),
        ]);
        setCategories(catRes.data.categories || []);

        const p = (prodRes as any).data || prodRes;
        setName(p.name || '');
        setCategoryId(p.categoryId || '');
        setType(p.type || 'ai_premium');
        setBasePrice(p.basePrice || 0);
        setShortDesc(p.shortDescription || '');
        setDescription(p.description || '');
        setFulfillmentType(p.fulfillmentType || 'semi_auto');
        setStatus(p.status || 'active');
        setIsFeatured(p.isFeatured || false);
        setSlaText(p.slaText || '');
        setRules(p.rules || '');
        setWarrantyInfo(p.warrantyInfo || '');
        setImages(p.images || []);
        setVariants(p.variants || []);
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat produk');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmit = async () => {
    if (!name) { setError('Nama produk wajib diisi'); return; }
    setSaving(true);
    setError('');

    try {
      await api.put(`/admin/products/${id}`, {
        name,
        categoryId: categoryId || undefined,
        type,
        basePrice,
        shortDescription: shortDesc || undefined,
        description: description || undefined,
        fulfillmentType,
        status,
        isFeatured,
        slaText: slaText || undefined,
        rules: rules || undefined,
        warrantyInfo: warrantyInfo || undefined,
        images,
        variants: variants.length > 0 ? variants : undefined,
      });
      router.push('/admin/products');
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan produk');
    }
    setSaving(false);
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', price: 0, stock: 0 }]);
  };

  const updateVariant = (i: number, field: string, value: any) => {
    const updated = [...variants];
    (updated[i] as any)[field] = value;
    setVariants(updated);
  };

  const removeVariant = (i: number) => {
    setVariants(variants.filter((_, idx) => idx !== i));
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px' }}><div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>;
  }

  return (
    <div>
      <div className="flex items-center" style={{ gap: '12px', marginBottom: '24px' }}>
        <Link href="/admin/products" className="btn btn-ghost btn-sm">← Kembali</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>✏️ Edit Produk</h1>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Main form */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Info Dasar</h3>

            <div className="form-group">
              <label className="form-label">Nama Produk *</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tipe</label>
                <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                  {Object.entries(PRODUCT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Harga Dasar</label>
                <input className="form-input" type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Fulfillment</label>
                <select className="form-input" value={fulfillmentType} onChange={(e) => setFulfillmentType(e.target.value)}>
                  <option value="instant">Instant</option>
                  <option value="semi_auto">Semi Auto</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deskripsi Singkat</label>
              <input className="form-input" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Deskripsi Lengkap</label>
              <textarea className="form-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Variants */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>📦 Varian / Paket</h3>
              <button className="btn btn-ghost btn-sm" onClick={addVariant}>+ Tambah</button>
            </div>
            {variants.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Tidak ada varian</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {variants.map((v, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Nama</label>
                      <input className="form-input" value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Harga</label>
                      <input className="form-input" type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', Number(e.target.value))} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Stok</label>
                      <input className="form-input" type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))} />
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeVariant(i)} style={{ marginBottom: '4px' }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>🖼️ Gambar Produk</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img
                    src={url.startsWith('http') ? url : `https://tokdig.com${url}`}
                    alt={`Product ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    style={{
                      position: 'absolute', top: '2px', right: '2px',
                      background: 'rgba(239,68,68,0.9)', color: '#fff',
                      border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                      cursor: 'pointer', fontSize: '11px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label style={{
                width: '100px', height: '100px', borderRadius: '8px',
                border: '2px dashed var(--color-border)', display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: uploading ? 'wait' : 'pointer', gap: '4px',
                color: 'var(--color-text-muted)', fontSize: '12px',
              }}>
                {uploading ? <><span className="spinner" /> ...</> : <><span style={{ fontSize: '20px' }}>+</span> Upload</>}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files?.length) return;
                    setUploading(true);
                    try {
                      for (let j = 0; j < files.length; j++) {
                        const formData = new FormData();
                        formData.append('file', files[j]);
                        const token = localStorage.getItem('token');
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/uploads/image`,
                          { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData },
                        );
                        if (res.ok) {
                          const json = await res.json();
                          const imgUrl = json?.data?.url || json?.url;
                          if (imgUrl) setImages((prev) => [...prev, imgUrl]);
                        }
                      }
                    } catch { setError('Gagal upload gambar'); }
                    finally { setUploading(false); e.target.value = ''; }
                  }}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Maks 5MB per file. JPG, PNG, WebP, GIF</p>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Pengaturan</h3>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="hidden">Hidden</option>
                <option value="out_of_stock">Habis</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">SLA</label>
              <input className="form-input" placeholder="1-5 menit" value={slaText} onChange={(e) => setSlaText(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Garansi</label>
              <input className="form-input" placeholder="Garansi 7 hari" value={warrantyInfo} onChange={(e) => setWarrantyInfo(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Aturan</label>
              <textarea className="form-input" rows={3} value={rules} onChange={(e) => setRules(e.target.value)} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              ⭐ Produk Unggulan
            </label>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleSubmit}
            disabled={saving || !name}
          >
            {saving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
