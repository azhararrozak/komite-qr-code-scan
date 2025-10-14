import { create } from "zustand";
import { fetchPaymentInfo, createPayment } from "../services/paymentService";

const usePaymentStore = create((set) => ({
  paymentInfo: null,
  loading: false,
  error: null,
  fetchPaymentInfo: async (nis) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchPaymentInfo(nis);
      set({ paymentInfo: data, loading: false });
      return data;
    } catch (err) {
      const message = err?.message || err;
      set({ error: message, loading: false });
      throw err;
    }
  },
  createPayment: async (paymentData) => {
    set({ loading: true, error: null });
    try {
      const data = await createPayment(paymentData);
      set({ loading: false });
      return data;
    } catch (err) {
      const message = err?.message || err;
      set({ error: message, loading: false });
      throw err;
    }
  },
}));

export default usePaymentStore;
