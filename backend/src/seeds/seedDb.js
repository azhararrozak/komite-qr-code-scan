require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const db = require("../models");
const Role = db.role;
const User = db.user;
const Student = db.student;

// (No top-level awaits) Deletion of existing data will be performed after connecting
// to MongoDB inside run()

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/komite";

async function ensureRoles() {
  const roles = ["user", "admin"];
  for (const name of roles) {
    const exists = await Role.findOne({ name });
    if (!exists) {
      await new Role({ name }).save();
      console.log(`Created role: ${name}`);
    }
  }
}

async function ensureUsers() {
  // Admin user
  const adminUsername = "admin";
  const adminEmail = "admin@gmail.com";
  const adminPassword = "12345678"; // change after seeding in production

  let admin = await User.findOne({ username: adminUsername });
  const adminRole = await Role.findOne({ name: "admin" });

  if (!admin) {
    admin = new User({
      username: adminUsername,
      email: adminEmail,
      password: bcrypt.hashSync(adminPassword, 8),
    });
    if (adminRole) admin.roles = [adminRole._id];
    await admin.save();
    console.log(`Created admin user: ${adminUsername} / ${adminPassword}`);
  } else {
    // ensure role assigned
    if (adminRole && (!admin.roles || admin.roles.length === 0)) {
      admin.roles = [adminRole._id];
      await admin.save();
      console.log("Assigned admin role to existing admin user");
    } else {
      console.log("Admin user already exists");
    }
  }

  // Regular user
  const userUsername = "Azhar";
  const userEmail = "azhar@ebelajar.id";
  const userPassword = "12345678";

  let user = await User.findOne({ username: userUsername });
  const userRole = await Role.findOne({ name: "user" });

  if (!user) {
    user = new User({
      username: userUsername,
      email: userEmail,
      password: bcrypt.hashSync(userPassword, 8),
      classAssigned: "VII-I",
    });
    if (userRole) user.roles = [userRole._id];
    await user.save();
    console.log(`Created regular user: ${userUsername} / ${userPassword}`);
  } else {
    if (userRole && (!user.roles || user.roles.length === 0)) {
      user.roles = [userRole._id];
      await user.save();
      console.log("Assigned user role to existing user");
    } else {
      console.log("Regular user already exists");
    }
  }
}

async function ensureStudents() {
  const sampleStudents = [
    { nis: "14454", name: "ADE GIAT MULYANA", class: "VII-I", gender: true },
    { nis: "14455", name: "AKBAR SHOLEH", class: "VII-I", gender: true },
    { nis: "14456", name: "ANTON ARIF WIJAYA", class: "VII-I", gender: true },
  ];

  for (const s of sampleStudents) {
    const exists = await Student.findOne({ nis: s.nis });
    if (!exists) {
      const st = new Student(s);
      await st.save();
      console.log(`Created student: ${s.nis} - ${s.name}`);
    } else {
      console.log(`Student exists: ${s.nis} - ${s.name}`);
    }
  }
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding");

    // Clean up existing seeded data (idempotent)
    try {
      await Student.deleteMany({});
      await User.deleteMany({});
      console.log("Cleared existing Student and User collections");
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr.message || cleanupErr);
    }

    await ensureRoles();
    await ensureUsers();
    await ensureStudents();

    console.log("Seeding completed");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Allow running this file directly: `node src/seeds/seedDb.js` from backend root
if (require.main === module) {
  run();
}
