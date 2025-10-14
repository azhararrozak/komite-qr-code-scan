const db = require("../models");
const Payment = db.payment;
const Student = db.student;

// Get Resolved Payment Info for a Student
exports.getPaymentInfo = async (req, res) => {
  const nis = req.params.nis;

  try {
    // Find the student by NIS
    const student = await Student.findOne({ nis: nis });
    if (!student) {
      return res
        .status(404)
        .send({ message: "Student not found with NIS " + nis });
    }

    // Aggregate payments by studentId (ObjectId). The Payment model stores `studentId`.
    // Previously this matched on `studentNis` and `status`, but those fields
    // don't exist in the schema so the aggregation returned no results.
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
    const status =
      paidAmount >= student.targetAmount && student.targetAmount > 0
        ? "Lunas"
        : paidAmount > 0
        ? "Belum Lunas"
        : "Belum Bayar";
    res.send({
      studentId: student._id,
      nis: student.nis,
      name: student.name,
      class: student.class,
      gender: student.gender,
      targetAmount: student.targetAmount,
      paidAmount: paidAmount,
      remaining: remaining,
      status: status,
    });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error retrieving payment info for NIS=" + nis });
  }
};
