export interface CreatePaymentDto {
  enrollmentId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
}

export interface PaymentResponse {
  id: string;
  enrollmentId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  paidAt: Date | null;
  createdAt: Date;
}
