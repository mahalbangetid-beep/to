export interface Payment {
  id: string;
  orderId: string;
  externalId: string;
  method: string;
  status: string;
  amount: number;
  paymentUrl: string;
  expiredAt: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}
