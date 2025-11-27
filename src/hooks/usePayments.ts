// hooks/usePayments.ts
import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from "@/firebase/config";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  createdAt: Timestamp;
}

export const usePayments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Create a new payment
  const createPayment = async (paymentData: {
    propertyId: string;
    bookingId?: string;
    amount: number;
    razorpay_order_id?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to create a payment');
      return null;
    }

    try {
      setLoading(true);
      const paymentDoc = {
        tenantId: user.uid,
        propertyId: paymentData.propertyId,
        bookingId: paymentData.bookingId || '',
        amount: paymentData.amount,
        status: 'pending' as const,
        date: new Date().toISOString(),
        razorpay_order_id: paymentData.razorpay_order_id || '',
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'payments'), paymentDoc);
      toast.success('Payment initiated successfully');
      return { id: docRef.id, ...paymentDoc };
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error(error.message || 'Failed to create payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update payment status after Razorpay confirmation
  const updatePaymentStatus = async (
    paymentId: string,
    status: 'completed' | 'failed',
    razorpay_payment_id?: string
  ) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const paymentRef = doc(db, 'payments', paymentId);
      
      await updateDoc(paymentRef, {
        status,
        razorpay_payment_id: razorpay_payment_id || '',
        updatedAt: Timestamp.now(),
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
      const q = query(
        collection(db, 'payments'),
        where('tenantId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
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
      const q = query(
        collection(db, 'payments'),
        where('propertyId', '==', propertyId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[];
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