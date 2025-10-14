import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import usePaymentStore from "../../stores/usePaymentStore";
import useAuthStore from "../../stores/useAuthStore";

const TambahData = () => {
  //ambil nis dari params
  const { nis } = useParams();

  const fetchPaymentInfo = usePaymentStore((state) => state.fetchPaymentInfo);
  const createPayment = usePaymentStore((state) => state.createPayment);
  const user = useAuthStore((state) => state.user);

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPaymentInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPaymentInfo(nis);
        setPaymentInfo(data);
      } catch (err) {
        setError(err.message || "Failed to fetch payment info");
      } finally {
        setLoading(false);
      }
    };

    loadPaymentInfo();
  }, [nis, fetchPaymentInfo]);

  //handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = e.target.PaymentAmount.value;
    const paidAt = e.target.PaymentDate.value;
    const note = e.target.note.value;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const paymentData = {
      studentId: paymentInfo.studentId,
      collectedBy: user.id,
      amount: parseFloat(amount),
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      method: "cash",
      note: note || "",
    };

    createPayment(paymentData)
      .then(() => {
        alert("Payment added successfully");
        //reset form
        e.target.reset();
        //refresh payment info
        return fetchPaymentInfo(nis);
      })
      .then((data) => {
        setPaymentInfo(data);
      })
      .catch((err) => {
        alert(err.message || "Failed to add payment");
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!paymentInfo) {
    return <div>No payment info found for NIS: {nis}</div>;
  }

  return (
    <div>
      <div>
        <h2>Payment Info for NIS: {paymentInfo.nis}</h2>
        <p>Name: {paymentInfo.name}</p>
        <p>Kelas: {paymentInfo.class}</p>
        <p>Jenis Kelamin: {paymentInfo.gender ? "Laki-laki" : "Perempuan"}</p>
        <p>Pembayaran Uang Komite: {paymentInfo.targetAmount}</p>
        <p>Total Jumlah Bayar: {paymentInfo.paidAmount}</p>
        <p>Sisa Pembayaran: {paymentInfo.remaining}</p>
        <p>Status: {paymentInfo.status}</p>
      </div>
      {/* Tambah form pembayaran di sini */}
      <div className="border m-4 p-4 rounded-lg shadow-lg">
        <h3 className="text-center font-bold">Tambah Pembayaran</h3>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Username">
                    Username
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="Username"
                    type="text"
                    placeholder="Username"
                    value={paymentInfo.name}
                    disabled
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="NIS">
                    NIS
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="NIS"
                    type="text"
                    placeholder="NIS"
                    value={paymentInfo.nis}
                    disabled
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="PaymentAmount">
                    Payment Amount
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="PaymentAmount"
                    type="number"
                    placeholder="Enter payment amount"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="note">
                    Note
                </label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="note"
                    placeholder="Enter any notes"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="PaymentDate">
                    Payment Date
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="PaymentDate"
                    type="date"
                />
            </div>
            <div className="flex items-center justify-between">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    Submit Payment
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TambahData;
