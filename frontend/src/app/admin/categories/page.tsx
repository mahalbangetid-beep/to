'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await api.get<any>('/admin/categories');
      const data = res?.categories || res?.data?.categories || res?.data || res || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setName('');
    setIcon('');
    setDescription('');
    setSortOrder(0);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const body = { name, icon, description, sortOrder };
    try {
      if (editId) {
        await api.put(`/admin/categories/${editId}`, body);
      } else {
        await api.post('/admin/categories', body);
      }
      resetForm();
      fetchCategories();
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan kategori');
    }
  };

  const handleEdit = (c: Category) => {
    setEditId(c.id);
    setName(c.name);
    setIcon(c.icon || '');
    setDescription(c.description || '');
    setSortOrder(c.sortOrder || 0);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}><span className="spinner spinner-dark" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>📂 Kategori</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          {showForm ? 'Tutup' : '+ Buat Kategori'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            {editId ? 'Edit Kategori' : 'Buat Kategori Baru'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Nama *</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="AI Premium" />
            </div>
            <div className="form-group">
              <label className="form-label">Icon (emoji)</label>
              <input className="form-input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🤖" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Deskripsi</label>
              <input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Akses premium AI tools" />
            </div>
            <div className="form-group">
              <label className="form-label">Urutan</label>
              <input type="number" className="form-input" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
              {editId ? 'Update' : 'Simpan'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Icon</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nama</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Slug</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Urutan</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Belum ada kategori
                </td>
              </tr>
            )}
            {categories.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px', fontSize: '20px' }}>{c.icon || '📁'}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{c.slug}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{c.sortOrder}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span className={`badge ${c.isActive ? 'badge-primary' : ''}`}>
                    {c.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(c)}>✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
