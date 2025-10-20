const db = require("../models");
const Student = db.student;
const Payment = db.payment;

exports.getStudentSummaryByClass = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$class",
          totalStudents: { $sum: 1 },
          totalTargetAmount: { $sum: "$targetAmount" },
          students: {
            $push: {
              _id: "$_id",
              nis: "$nis",
              name: "$name",
              targetAmount: "$targetAmount",
            },
          },
        },
      },
      {
        $lookup: {
          from: "payments",
          let: { studentIds: "$students._id" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$studentId", "$$studentIds"] },
              },
            },
            {
              $group: {
                _id: "$studentId",
                totalPaid: { $sum: "$amount" },
              },
            },
          ],
          as: "payments",
        },
      },
      {
        $addFields: {
          totalPaidAmount: {
            $sum: "$payments.totalPaid",
          },
          totalRemainingAmount: {
            $subtract: ["$totalTargetAmount", { $sum: "$payments.totalPaid" }],
          },
          studentsWithPayments: {
            $map: {
              input: "$students",
              as: "student",
              in: {
                $mergeObjects: [
                  "$$student",
                  {
                    paidAmount: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$payments",
                                    cond: {
                                      $eq: ["$$this._id", "$$student._id"],
                                    },
                                  },
                                },
                                in: "$$this.totalPaid",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          studentsWithStatus: {
            $map: {
              input: "$studentsWithPayments",
              as: "student",
              in: {
                $mergeObjects: [
                  "$$student",
                  {
                    class: "$_id",
                    remainingAmount: {
                      $subtract: [
                        "$$student.targetAmount",
                        "$$student.paidAmount",
                      ],
                    },
                    status: {
                      $cond: {
                        if: {
                          $gte: [
                            "$$student.paidAmount",
                            "$$student.targetAmount",
                          ],
                        },
                        then: "Lunas",
                        else: {
                          $cond: {
                            if: { $gt: ["$$student.paidAmount", 0] },
                            then: "Belum Lunas",
                            else: "Belum Dibayar",
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          paidStudents: {
            $size: {
              $filter: {
                input: "$studentsWithStatus",
                cond: { $eq: ["$$this.status", "Lunas"] },
              },
            },
          },
          partialPaidStudents: {
            $size: {
              $filter: {
                input: "$studentsWithStatus",
                cond: { $eq: ["$$this.status", "Belum Lunas"] },
              },
            },
          },
          unpaidStudents: {
            $size: {
              $filter: {
                input: "$studentsWithStatus",
                cond: { $eq: ["$$this.status", "Belum Dibayar"] },
              },
            },
          },
        },
      },
      {
        $project: {
          className: "$_id",
          totalStudents: 1,
          totalTargetAmount: 1,
          totalPaidAmount: 1,
          totalRemainingAmount: 1,
          paidStudents: 1,
          partialPaidStudents: 1,
          unpaidStudents: 1,
          students: "$studentsWithStatus",
          _id: 0,
        },
      },
      {
        $sort: { className: 1 },
      },
    ];

    const result = await Student.aggregate(pipeline);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error generating class summary",
      error: error.message,
    });
  }
};

exports.getStudentsByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const { status, search } = req.query;

    let matchQuery = { class: className };

    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { nis: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(matchQuery).lean();

    if (!students.length) {
      return res.json([]);
    }

    const studentIds = students.map((s) => s._id);

    const payments = await Payment.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $group: { _id: "$studentId", totalPaid: { $sum: "$amount" } } },
    ]);

    const paymentMap = new Map();
    payments.forEach((p) => paymentMap.set(String(p._id), p.totalPaid));

    let studentsWithPayments = students.map((student) => {
      const paidAmount = paymentMap.get(String(student._id)) || 0;
      const remainingAmount = Math.max(student.targetAmount - paidAmount, 0);
      const paymentStatus =
        paidAmount >= student.targetAmount
          ? "Lunas"
          : paidAmount > 0
          ? "Belum Lunas"
          : "Belum Dibayar";

      return {
        _id: student._id,
        nis: student.nis,
        name: student.name,
        class: student.class,
        gender: student.gender,
        targetAmount: student.targetAmount,
        paidAmount,
        remainingAmount,
        status: paymentStatus,
      };
    });

    if (status) {
      const statusMap = {
        lunas: "Lunas",
        belum_lunas: "Belum Lunas",
        belum_dibayar: "Belum Dibayar",
      };

      if (statusMap[status]) {
        studentsWithPayments = studentsWithPayments.filter(
          (s) => s.status === statusMap[status]
        );
      }
    }

    studentsWithPayments.sort((a, b) => b.remainingAmount - a.remainingAmount);

    res.json(studentsWithPayments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching students by class",
      error: error.message,
    });
  }
};

exports.getGlobalStatistics = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTargetAmount = await Student.aggregate([
      { $group: { _id: null, total: { $sum: "$targetAmount" } } },
    ]);

    const totalPaidAmount = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const classCount = await Student.aggregate([
      { $group: { _id: "$class" } },
      { $count: "totalClasses" },
    ]);

    const studentsByStatus = await Student.aggregate([
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "studentId",
          as: "payments",
        },
      },
      {
        $addFields: {
          totalPaid: { $sum: "$payments.amount" },
          status: {
            $cond: {
              if: { $gte: [{ $sum: "$payments.amount" }, "$targetAmount"] },
              then: "Lunas",
              else: {
                $cond: {
                  if: { $gt: [{ $sum: "$payments.amount" }, 0] },
                  then: "Belum Lunas",
                  else: "Belum Dibayar",
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = { Lunas: 0, "Belum Lunas": 0, "Belum Dibayar": 0 };
    studentsByStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    const result = {
      totalStudents,
      totalClasses: classCount[0]?.totalClasses || 0,
      totalTargetAmount: totalTargetAmount[0]?.total || 0,
      totalPaidAmount: totalPaidAmount[0]?.total || 0,
      totalRemainingAmount:
        (totalTargetAmount[0]?.total || 0) - (totalPaidAmount[0]?.total || 0),
      studentsStatus: {
        lunas: statusMap["Lunas"],
        belumLunas: statusMap["Belum Lunas"],
        belumDibayar: statusMap["Belum Dibayar"],
      },
      collectionPercentage:
        totalTargetAmount[0]?.total > 0
          ? (
              ((totalPaidAmount[0]?.total || 0) / totalTargetAmount[0].total) *
              100
            ).toFixed(2)
          : 0,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching global statistics",
      error: error.message,
    });
  }
};

// Get payment history for a specific student by NIS
exports.getStudentPaymentHistory = async (req, res) => {
  try {
    const { nis } = req.params;

    // Find student by NIS
    const student = await Student.findOne({ nis }).lean();

    if (!student) {
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    }

    // Get all payments for this student, sorted by date (newest first)
    const payments = await Payment.find({ studentId: student._id })
      .populate("collectedBy", "username name email")
      .sort({ paidAt: -1 })
      .lean();

    // Calculate totals
    const totalPaid = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const remainingAmount = Math.max(student.targetAmount - totalPaid, 0);
    const status =
      totalPaid >= student.targetAmount
        ? "Lunas"
        : totalPaid > 0
        ? "Belum Lunas"
        : "Belum Dibayar";

    // Format payment history with payment number
    const paymentHistory = payments.map((payment, index) => ({
      paymentNumber: payments.length - index, // Pembayaran ke-1, ke-2, dst
      amount: payment.amount,
      paidAt: payment.paidAt,
      method: payment.method || "cash",
      note: payment.note || "",
      collectedBy: payment.collectedBy
        ? {
            username: payment.collectedBy.username,
            name: payment.collectedBy.name,
            email: payment.collectedBy.email,
          }
        : null,
      _id: payment._id,
    }));

    const result = {
      student: {
        _id: student._id,
        nis: student.nis,
        name: student.name,
        class: student.class,
        gender: student.gender,
        targetAmount: student.targetAmount,
      },
      summary: {
        totalPaid,
        remainingAmount,
        status,
        totalPayments: payments.length,
        paymentPercentage:
          student.targetAmount > 0
            ? ((totalPaid / student.targetAmount) * 100).toFixed(2)
            : 0,
      },
      paymentHistory,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student payment history",
      error: error.message,
    });
  }
};

// Get payment history for all students in a specific class
exports.getClassPaymentHistory = async (req, res) => {
  try {
    const { className } = req.params;

    // Find all students in the class
    const students = await Student.find({ class: className }).lean();

    if (!students.length) {
      return res.json([]);
    }

    const studentIds = students.map((s) => s._id);

    // Get all payments for these students
    const payments = await Payment.find({ studentId: { $in: studentIds } })
      .populate("collectedBy", "username name email")
      .populate("studentId", "nis name class")
      .sort({ paidAt: -1 })
      .lean();

    // Group payments by student
    const studentPaymentMap = new Map();
    const studentTotalMap = new Map();

    payments.forEach((payment) => {
      const studentId = String(payment.studentId._id);

      if (!studentPaymentMap.has(studentId)) {
        studentPaymentMap.set(studentId, []);
        studentTotalMap.set(studentId, 0);
      }

      studentPaymentMap.get(studentId).push(payment);
      studentTotalMap.set(
        studentId,
        studentTotalMap.get(studentId) + payment.amount
      );
    });

    // Build result for each student
    const result = students.map((student) => {
      const studentId = String(student._id);
      const studentPayments = studentPaymentMap.get(studentId) || [];
      const totalPaid = studentTotalMap.get(studentId) || 0;
      const remainingAmount = Math.max(student.targetAmount - totalPaid, 0);
      const status =
        totalPaid >= student.targetAmount
          ? "Lunas"
          : totalPaid > 0
          ? "Belum Lunas"
          : "Belum Dibayar";

      // Format payment history with payment number
      const paymentHistory = studentPayments
        .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
        .map((payment, index) => ({
          paymentNumber: studentPayments.length - index,
          amount: payment.amount,
          paidAt: payment.paidAt,
          method: payment.method || "cash",
          note: payment.note || "",
          collectedBy: payment.collectedBy
            ? {
                username: payment.collectedBy.username,
                name: payment.collectedBy.name,
              }
            : null,
        }));

      return {
        student: {
          _id: student._id,
          nis: student.nis,
          name: student.name,
          class: student.class,
          targetAmount: student.targetAmount,
        },
        summary: {
          totalPaid,
          remainingAmount,
          status,
          totalPayments: studentPayments.length,
          paymentPercentage:
            student.targetAmount > 0
              ? ((totalPaid / student.targetAmount) * 100).toFixed(2)
              : 0,
        },
        paymentHistory,
      };
    });

    // Sort by name alphabetically
    result.sort((a, b) => a.student.name.localeCompare(b.student.name, "id"));

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching class payment history",
      error: error.message,
    });
  }
};
