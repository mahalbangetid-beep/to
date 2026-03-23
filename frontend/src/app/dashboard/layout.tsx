'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Overview' },
  { href: '/dashboard/orders', icon: '📦', label: 'Pesanan' },
  { href: '/dashboard/products', icon: '🎁', label: 'Produk Saya' },
  { href: '/dashboard/wishlist', icon: '❤️', label: 'Wishlist' },
  { href: '/dashboard/claims', icon: '🛡️', label: 'Klaim' },
  { href: '/dashboard/notifications', icon: '🔔', label: 'Notifikasi' },
  { href: '/dashboard/support', icon: '📩', label: 'Bantuan' },
  { href: '/dashboard/settings', icon: '⚙️', label: 'Pengaturan' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Top navbar */}
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="nav-logo">TokDig</Link>
          <nav className="nav-links">
            <Link href="/products">Produk</Link>
            <span className="text-muted text-sm">
              {user?.fullName || user?.email || 'User'}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Keluar</button>
          </nav>
        </div>
      </header>

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: '32px',
          padding: '24px 0 64px',
          minHeight: 'calc(100vh - 64px)',
        }}>
          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
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

          {/* Content */}
          <main>{children}</main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--color-bg-elevated)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 100,
        padding: '8px 0',
      }} className="mobile-bottom-nav">
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '11px',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  textDecoration: 'none',
                  padding: '4px 8px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
