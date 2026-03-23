export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'TokDig';
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '6281234567890';

export const PRODUCT_TYPES = {
  AI_PREMIUM: 'ai_premium',
  VPS: 'vps',
  DIGITAL_ACCOUNT: 'digital_account',
  JASA_WEB: 'jasa_web',
  GAME_ITEM: 'game_item',
  VOUCHER: 'voucher',
} as const;

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  ai_premium: 'AI Premium',
  vps: 'VPS',
  digital_account: 'Digital Account',
  jasa_web: 'Jasa Web',
  game_item: 'Item Game',
  voucher: 'Voucher Game',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu Pembayaran',
  paid: 'Dibayar',
  processing: 'Diproses',
  completed: 'Selesai',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
  expired: 'Expired',
};

export const BADGE_ICONS: Record<string, string> = {
  best_seller: '🔥',
  instant: '⚡',
  new: '🆕',
  limited: '⏳',
  corporate: '💼',
};
