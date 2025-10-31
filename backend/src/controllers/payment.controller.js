const db = require("../models");
const Payment = db.payment;
const Student = db.student;

// Create and Save a new Payment
exports.createPayment = async (req, res) => {
  // Validate request
  if (!req.body.studentId || !req.body.collectedBy || !req.body.amount) {
    return res
      .status(400)
      .send({ message: "studentId, collectedBy and amount are required!" });
  }

  //buatkan batasan maximal amount adalah ambil dari student targetAmount
  const student = await Student.findById(req.body.studentId);
  if (!student) {
    return res.status(400).send({ message: "Invalid studentId" });
  }
  if (req.body.amount <= 0) {
    return res
      .status(400)
      .send({ message: "Amount must be greater than zero" });
  }
  //buatkan batasan maximal amount adalah ambil dari student targetAmount
  if (student.targetAmount > 0) {
    const agg = await Payment.aggregate([
      { $match: { studentId: student._id } },
      {
        $group: {
          _id: "$studentId",
          paidAmount: { $sum: "$amount" },
        },
      },
    ]);
    const paidAmount = agg[0]?.paidAmount || 0;
    const remaining = Math.max(student.targetAmount - paidAmount, 0);
    if (req.body.amount > remaining) {
      return res
        .status(400)
        .send({ message: `Amount exceeds remaining balance of ${remaining}` });
    }
  }

  // Create a Payment
  const payment = new Payment({
    studentId: req.body.studentId,
    collectedBy: req.body.collectedBy,
    amount: req.body.amount,
    method: req.body.method || "cash",
    note: req.body.note || "",
    paidAt: req.body.paidAt || Date.now(),
  });

  // Save Payment in the database
  try {
    const data = await payment.save();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Payment.",
    });
  }
};

// Retrieve all Payments from the database.
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("studentId", "name nis")
      .populate("collectedBy", "username email")
      .sort({ paidAt: -1 });
    res.send(payments);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving payments.",
    });
  }
};

//edit payment
exports.editPayment = async (req, res) => {
  const paymentId = req.params.id;

  try {
    const existingPayment = await Payment.findById(paymentId);
    if (!existingPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // If amount is being changed, validate against remaining balance
    if (req.body.amount && req.body.amount !== existingPayment.amount) {
      const student = await Student.findById(existingPayment.studentId);
      if (!student) {
        return res.status(400).send({ message: "Invalid studentId" });
      }

      if (req.body.amount <= 0) {
        return res
          .status(400)
          .send({ message: "Amount must be greater than zero" });
      }

      // Calculate total paid excluding the current payment being edited
      const agg = await Payment.aggregate([
        {
          $match: { studentId: student._id, _id: { $ne: existingPayment._id } },
        },
        {
          $group: {
            _id: "$studentId",
            paidAmount: { $sum: "$amount" },
          },
        },
      ]);
      const paidAmount = agg[0]?.paidAmount || 0;
      const remaining = Math.max(student.targetAmount - paidAmount, 0);

      if (req.body.amount > remaining) {
        return res.status(400).send({
          message: `Amount exceeds remaining balance of ${remaining}`,
        });
      }
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      req.body,
      { new: true }
    );

    res
      .status(200)
      .json({
        message: "Payment updated successfully!",
        payment: updatedPayment,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a Payment
exports.deletePayment = async (req, res) => {
  const paymentId = req.params.id;

  try {
    const deletedPayment = await Payment.findByIdAndDelete(paymentId);

    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
