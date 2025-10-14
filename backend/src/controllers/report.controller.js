const db = require("../models");
const Report = db.report;
const Student = db.student;

// Generate report recap payment berdasarkan kelas yang diampu wali kelas
exports.generateRecapByClass = async (req, res) => {
  const me = req.userId;

  // Siapkan filter kelas sesuai role
  let classQ = {};
  if (me.role === "user") {
    if (!me.classAssigned)
      return res.status(400).json({ error: "wali_has_no_class_assigned" });
    classQ = Array.isArray(me.classAssigned)
      ? { className: { $in: me.classAssigned } }
      : { className: me.classAssigned };
  }

  const keyword = (req.query.q || "").toString().trim();
  const statusFilter = (req.query.status || "").toString().toUpperCase(); // UNPAID|PARTIAL|PAID

  // Cari siswa kelas tersebut (opsional: search NIS / Nama)
  const findQ = { ...classQ };
  if (keyword) {
    findQ.$or = [
      { name: new RegExp(keyword, "i") },
      { nis: new RegExp(keyword, "i") },
    ];
  }

  const students = await Student.find(findQ).lean();
  if (!students.length) return res.json([]);

  const ids = students.map((s) => s._id);

  // Ambil sum pembayaran per siswa
  const paidAgg = await Payment.aggregate([
    { $match: { studentId: { $in: ids } } },
    { $group: { _id: "$studentId", paid: { $sum: "$amount" } } },
  ]);
  const paidMap = new Map();
  for (const r of paidAgg) paidMap.set(String(r._id), r.paid);

  // Bentuk list dengan ringkasan
  let list = students.map((s) => {
    const paid = paidMap.get(String(s._id)) || 0;
    const remaining = Math.max(s.targetAmount - paid, 0);
    const status =
      paid >= s.targetAmount && s.targetAmount > 0
        ? "Lunas"
        : paid > 0
        ? "Belum Lunas"
        : "Belum Dibayar";
    return {
      id: String(s._id),
      nis: s.nis,
      name: s.name,
      className: s.className,
      targetAmount: s.targetAmount,
      paidAmount: paid,
      remaining,
      status,
    };
  });

  // Filter status jika diminta
  if (statusFilter && ["UNPAID", "PARTIAL", "PAID"].includes(statusFilter)) {
    list = list.filter((it) => it.status === statusFilter);
  }

  // Urutkan default: sisa terbesar dulu (biar mudah follow-up)
  list.sort((a, b) => b.remaining - a.remaining);

  res.json(list);
};