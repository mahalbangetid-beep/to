'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  name: string;
  price: number;
  originalPrice?: number;
  durationDays?: number;
  stock: number;
  isRecommended?: boolean;
}

interface Field {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  placeholder: string;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Variants
  const [variants, setVariants] = useState<Variant[]>([
    { name: '1 Bulan', price: 0, stock: -1 },
  ]);

  // Fields
  const [fields, setFields] = useState<Field[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/uploads/image`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
        );

        if (res.ok) {
          const json = await res.json();
          const url = json?.data?.url || json?.url;
          if (url) {
            setImages((prev) => [...prev, url]);
          }
        }
      }
    } catch {
      setError('Gagal upload gambar');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    api.get<any>('/admin/categories').then((res) => {
      const data = res?.categories || res?.data?.categories || res?.data || res || [];
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  const addVariant = () => {
    setVariants([...variants, { name: '', price: 0, stock: -1 }]);
  };

  const removeVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, key: keyof Variant, value: any) => {
    const next = [...variants];
    (next[idx] as any)[key] = value;
    setVariants(next);
  };

  const addField = () => {
    setFields([
      ...fields,
      { fieldName: '', fieldLabel: '', fieldType: 'text', isRequired: true, placeholder: '' },
    ]);
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, key: keyof Field, value: any) => {
    const next = [...fields];
    (next[idx] as any)[key] = value;
    setFields(next);
  };

  const handleSubmit = async () => {
    if (!name || !type || !basePrice) {
      setError('Nama, tipe, dan harga wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/admin/products', {
        name,
        categoryId: categoryId || undefined,
        type,
        basePrice,
        shortDesc: shortDesc || undefined,
        description: description || undefined,
        fulfillmentType,
        status,
        isFeatured,
        slaText: slaText || undefined,
        rules: rules || undefined,
        warrantyInfo: warrantyInfo || undefined,
        images,
        variants: variants.filter((v) => v.name && v.price > 0),
        fields: fields.filter((f) => f.fieldName && f.fieldLabel),
      });

      router.push('/admin/products');
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan produk');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center" style={{ gap: '12px', marginBottom: '24px' }}>
        <Link href="/admin/products" className="btn btn-ghost btn-sm">← Kembali</Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Tambah Produk Baru</h1>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {/* ─── Basic Info ─── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>📦 Informasi Dasar</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Nama Produk *</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ChatGPT Plus Premium" />
          </div>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">— Pilih Kategori —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tipe Produk *</label>
            <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
              {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Harga Dasar (Rp) *</label>
            <input type="number" className="form-input" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Fulfillment</label>
            <select className="form-input" value={fulfillmentType} onChange={(e) => setFulfillmentType(e.target.value)}>
              <option value="auto">Auto</option>
              <option value="semi_auto">Semi Auto</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">SLA</label>
            <input className="form-input" value={slaText} onChange={(e) => setSlaText(e.target.value)} placeholder="Instant / 5-10 menit" />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Deskripsi Singkat</label>
            <input className="form-input" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Akses ChatGPT premium dengan harga terjangkau" />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Deskripsi Lengkap</label>
            <textarea className="form-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detail produk..." />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Rules / Larangan</label>
            <textarea className="form-input" rows={3} value={rules} onChange={(e) => setRules(e.target.value)} placeholder="Jangan share akun, dll..." />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Info Garansi</label>
            <input className="form-input" value={warrantyInfo} onChange={(e) => setWarrantyInfo(e.target.value)} placeholder="Garansi replace jika error" />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>Produk Featured</span>
            </label>
          </div>
        </div>
      </div>

      {/* ─── Images ─── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>🖼️ Gambar Produk</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <img
                src={url.startsWith('http') ? url : `https://tokdig.com${url}`}
                alt={`Product ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => removeImage(i)}
                style={{
                  position: 'absolute', top: '4px', right: '4px',
                  background: 'rgba(239,68,68,0.9)', color: '#fff',
                  border: 'none', borderRadius: '50%', width: '24px', height: '24px',
                  cursor: 'pointer', fontSize: '12px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <label style={{
            width: '120px', height: '120px', borderRadius: '8px',
            border: '2px dashed var(--color-border)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: uploading ? 'wait' : 'pointer', gap: '4px',
            color: 'var(--color-text-muted)', fontSize: '13px',
          }}>
            {uploading ? <><span className="spinner" /> Uploading...</> : <><span style={{ fontSize: '24px' }}>+</span> Upload</>}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Maks 5MB per file. Format: JPG, PNG, WebP, GIF</p>
      </div>

      {/* ─── Variants ─── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>📊 Paket / Varian</h3>
          <button className="btn btn-ghost btn-sm" onClick={addVariant}>+ Tambah Varian</button>
        </div>
        {variants.map((v, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
            gap: '8px', marginBottom: '8px', alignItems: 'end',
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              {i === 0 && <label className="form-label">Nama</label>}
              <input className="form-input" value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} placeholder="1 Bulan" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              {i === 0 && <label className="form-label">Harga</label>}
              <input type="number" className="form-input" value={v.price} onChange={(e) => updateVariant(i, 'price', Number(e.target.value))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              {i === 0 && <label className="form-label">Durasi (hari)</label>}
              <input type="number" className="form-input" value={v.durationDays || ''} onChange={(e) => updateVariant(i, 'durationDays', Number(e.target.value) || undefined)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              {i === 0 && <label className="form-label">Stok</label>}
              <input type="number" className="form-input" value={v.stock} onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))} placeholder="-1 = unlimited" />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => removeVariant(i)} style={{ marginBottom: '2px' }}>🗑️</button>
          </div>
        ))}
        {variants.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Belum ada varian. Tambahkan varian untuk paket harga berbeda.</p>
        )}
      </div>

      {/* ─── Custom Fields ─── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>📝 Custom Fields (Checkout)</h3>
          <button className="btn btn-ghost btn-sm" onClick={addField}>+ Tambah Field</button>
        </div>
        {fields.map((f, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
            gap: '8px', marginBottom: '8px', alignItems: 'end',
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              {i === 0 && <label className="form-label">Field Name</label>}
              <input className="form-input" value={f.fieldName} onChange={(e) => updateField(i, 'fieldName', e.target.value)} placeholder="email" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              {i === 0 && <label className="form-label">Label</label>}
              <input className="form-input" value={f.fieldLabel} onChange={(e) => updateField(i, 'fieldLabel', e.target.value)} placeholder="Email untuk akun" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              {i === 0 && <label className="form-label">Tipe</label>}
              <select className="form-input" value={f.fieldType} onChange={(e) => updateField(i, 'fieldType', e.target.value)}>
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              {i === 0 && <label className="form-label">Placeholder</label>}
              <input className="form-input" value={f.placeholder} onChange={(e) => updateField(i, 'placeholder', e.target.value)} />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => removeField(i)} style={{ marginBottom: '2px' }}>🗑️</button>
          </div>
        ))}
        {fields.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Belum ada custom field. Tambahkan jika produk butuh input saat checkout (email, user ID, dll).</p>
        )}
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" /> Menyimpan...</> : '💾 Simpan Produk'}
        </button>
        <Link href="/admin/products" className="btn btn-ghost">Batal</Link>
      </div>
    </div>
  );
}
