'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNav = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/orders', icon: '📦', label: 'Pesanan' },
  { href: '/admin/fulfillments', icon: '🚀', label: 'Fulfillment' },
  { href: '/admin/products', icon: '🏷️', label: 'Produk' },
  { href: '/admin/categories', icon: '📂', label: 'Kategori' },
  { href: '/admin/promo', icon: '🎫', label: 'Promo' },
  { href: '/admin/reviews', icon: '⭐', label: 'Review' },
  { href: '/admin/tickets', icon: '📩', label: 'Tiket' },
  { href: '/admin/claims', icon: '🛡️', label: 'Klaim' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/audit', icon: '📋', label: 'Audit Log' },
  { href: '/admin/settings', icon: '⚙️', label: 'Pengaturan' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <header className="navbar" style={{ borderBottom: '2px solid var(--color-primary)' }}>
        <div className="container navbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" className="nav-logo">TokDig</Link>
            <span className="badge badge-primary" style={{ fontSize: '10px' }}>ADMIN</span>
          </div>
          <nav className="nav-links">
            <Link href="/">Ke Toko</Link>
          </nav>
        </div>
      </header>

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: '32px',
          padding: '24px 0 64px',
          minHeight: 'calc(100vh - 68px)',
        }}>
          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {adminNav.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`filter-item ${isActive ? 'active' : ''}`}
                  style={{ fontSize: '14px' }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
