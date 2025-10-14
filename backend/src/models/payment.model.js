const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        collectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        method: {
            type: String,
            default: "cash",
        },
        note: {
            type: String,
        },
        paidAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

PaymentSchema.index({ studentId: 1, paidAt: -1 });
PaymentSchema.index({ collectedBy: 1, paidAt: -1 });

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;