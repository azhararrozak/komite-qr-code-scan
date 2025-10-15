const db = require("../models");
const User = db.user;

//getAlluser with role user
export const getAllWaliKelas = async (req, res) => {
  try {
    const users = await User.find({ roles: { $in: ["ROLE_USER"] } }).select(
      "-password"
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

