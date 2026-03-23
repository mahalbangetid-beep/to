export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  guestEmail: string;
  guestPhone: string;
  status: string;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  promoCodeId: string;
  notes: string;
  customerData: Record<string, unknown>;
  paidAt: string;
  completedAt: string;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  fieldValues: Record<string, string>;
}
