'use client';

export function Skeleton({
  width,
  height,
  borderRadius = 'var(--radius-sm)',
  style,
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius,
        background: 'linear-gradient(90deg, var(--color-bg-elevated) 25%, rgba(255,255,255,0.05) 50%, var(--color-bg-elevated) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <Skeleton height="14px" width="60px" style={{ marginBottom: '12px' }} />
      <Skeleton height="18px" width="85%" style={{ marginBottom: '8px' }} />
      <Skeleton height="14px" width="50%" style={{ marginBottom: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton height="20px" width="90px" />
        <Skeleton height="14px" width="50px" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} style={{ padding: '12px 16px' }}>
                <Skeleton height="14px" width="70%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid var(--color-border)' }}>
              {Array.from({ length: cols }).map((_, ci) => (
                <td key={ci} style={{ padding: '12px 16px' }}>
                  <Skeleton height="14px" width={`${50 + Math.random() * 40}%`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton height="28px" width="200px" style={{ marginBottom: '24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <Skeleton height="32px" width="60px" style={{ marginBottom: '8px' }} />
            <Skeleton height="14px" width="80px" />
          </div>
        ))}
      </div>
      <Skeleton height="18px" width="140px" style={{ marginBottom: '16px' }} />
      {[1, 2, 3].map((i) => (
        <div key={i} className="card" style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton height="16px" width="40%" />
            <Skeleton height="16px" width="80px" />
          </div>
        </div>
      ))}
    </div>
  );
}
