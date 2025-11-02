const db = require("../models");
const bcrypt = require("bcryptjs");
const User = db.user;
const Role = db.role;

exports.createUserWaliKelas = async (req, res) => {
  try {
    const { username, email, password, classAssigned } = req.body;

    const user = new User({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
      classAssigned,
    });

    const role = await Role.findOne({ name: "user" });
    user.roles = [role._id];

    await user.save();

    res.status(201).json({ message: "Wali Kelas user created successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editUserWaliKelas = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password, classAssigned } = req.body;
    
    const updateData = {
      username,
      email,
      classAssigned,
    };

    if (password) {
      updateData.password = bcrypt.hashSync(password, 8);
    }
    
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Wali Kelas user updated successfully!", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUserWaliKelas = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Wali Kelas user deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllWaliKelas = async (req, res) => {
  try {
    // Find the user role first
    const userRole = await Role.findOne({ name: "user" });

    if (!userRole) {
      return res.status(404).json({ message: "User role not found" });
    }

    // Find all users with the user role
    const users = await User.find({ roles: { $in: [userRole._id] } })
      .select("-password")
      .populate("roles", "name");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAdminUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    });

    const role = await Role.findOne({ name: "admin" });
    user.roles = [role._id];

    await user.save();

    res.status(201).json({ message: "Admin user created successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAdminUsers = async (req, res) => {
  try {
    // Find the admin role first
    const adminRole = await Role.findOne({ name: "admin" });

    if (!adminRole) {
      return res.status(404).json({ message: "Admin role not found" });
    }

    // Find all users with the admin role
    const users = await User.find({ roles: { $in: [adminRole._id] } })
      .select("-password")
      .populate("roles", "name");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAdminUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Admin user deleted successfully!" });
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};


