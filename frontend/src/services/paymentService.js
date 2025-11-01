import api from "./api";

export async function fetchPaymentInfo(nis) {
  try {
    const res = await api.get(`/qr/resolve/${nis}`);
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err.message;
    // normalize error to be thrown by callers
    throw new Error(message);
  }
}

export function createPayment(paymentData) {
  return api
    .post("/payments", paymentData)
    .then((response) => response.data)
    .catch((err) => {
      const message = err?.response?.data?.message || err.message;
      throw new Error(message);
    });
}

export function updatePayment(paymentId, paymentData) {
  return api
    .put(`/payments/${paymentId}`, paymentData)
    .then((response) => response.data)
    .catch((err) => {
      const message = err?.response?.data?.message || err.message;
      throw new Error(message);
    });
}

export default { fetchPaymentInfo, createPayment, updatePayment };
