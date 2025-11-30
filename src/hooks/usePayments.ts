// hooks/usePayments.ts
import { useState } from 'react';
import { PaymentService } from "@/services/apiService";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  bookingId?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  createdAt: string;
}

export const usePayments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Create a new payment with Razorpay
  const createPayment = async (paymentData: {
    propertyId: string;
    bookingId?: string;
    amount: number;
  }) => {
    if (!user) {
      toast.error('You must be logged in to create a payment');
      return null;
    }

    try {
      setLoading(true);

      // 1. Create Order
      const order = await PaymentService.createOrder(paymentData.amount);

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Ensure this is set in .env
          amount: order.amount,
          currency: order.currency,
          name: "RentEazy",
          description: "Rent Payment",
          order_id: order.id,
          handler: async function (response: any) {
            try {
              // 2. Verify Payment
              await PaymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // 3. Save Payment to DB
              const paymentDoc = {
                tenant_id: user.uid,
                property_id: paymentData.propertyId,
                booking_id: paymentData.bookingId || '',
                amount: paymentData.amount,
                status: 'completed',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                date: new Date().toISOString(),
              };

              const newPayment = await PaymentService.create(paymentDoc);
              toast.success('Payment successful!');
              resolve(newPayment);
            } catch (err) {
              console.error("Payment verification failed", err);
              toast.error("Payment verification failed");
              reject(err);
            }
          },
          prefill: {
            name: user.displayName || "User",
            email: user.email,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response: any) {
          toast.error(response.error.description);
          reject(response.error);
        });
        rzp1.open();
      });

    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast.error(error.message || 'Failed to initiate payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update payment status (fallback/manual)
  const updatePaymentStatus = async (
    paymentId: string,
    status: 'completed' | 'failed',
    razorpay_payment_id?: string
  ) => {
    try {
      await PaymentService.update(paymentId, {
        status,
        razorpay_payment_id: razorpay_payment_id || '',
        updatedAt: new Date().toISOString(),
      });

      toast.success(status === 'completed' ? 'Payment completed!' : 'Payment failed');
      return true;
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment status');
      return false;
    }
  };

  // Get all payments for current user
  const getUserPayments = async () => {
    if (!user) return [];

    try {
      setLoading(true);
      const payments = await PaymentService.getByTenantId(user.uid);
      return payments as Payment[];
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get payments for a specific property (for owners)
  const getPropertyPayments = async (propertyId: string) => {
    try {
      setLoading(true);
      const payments = await PaymentService.getByPropertyId(propertyId);
      return payments as Payment[];
    } catch (error: any) {
      console.error('Error fetching property payments:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createPayment,
    updatePaymentStatus,
    getUserPayments,
    getPropertyPayments,
  };
};