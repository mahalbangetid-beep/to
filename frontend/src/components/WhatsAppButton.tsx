'use client';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/6281234567890?text=Halo%20TokDig,%20saya%20butuh%20bantuan"
      target="_blank"
      rel="noopener noreferrer"
      id="wa-float-btn"
      aria-label="Chat WhatsApp"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#25D366',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
        zIndex: 999,
        transition: 'transform 0.2s, box-shadow 0.2s',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.transform = 'scale(1.1)';
        (e.target as HTMLElement).style.boxShadow = '0 6px 24px rgba(37, 211, 102, 0.5)';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.transform = 'scale(1)';
        (e.target as HTMLElement).style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.4)';
      }}
    >
      💬
    </a>
  );
}
