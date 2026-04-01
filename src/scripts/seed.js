require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user.model");
const Record = require("../models/record.model");
const { ROLES } = require("../constants/roles");

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([User.deleteMany({}), Record.deleteMany({})]);

    const [admin, analyst, viewer] = await User.create([
      {
        fullName: "Admin User",
        email: "admin@financeapp.com",
        password: "Admin@123",
        role: ROLES.ADMIN,
        isActive: true
      },
      {
        fullName: "Analyst User",
        email: "analyst@financeapp.com",
        password: "Analyst@123",
        role: ROLES.ANALYST,
        isActive: true
      },
      {
        fullName: "Viewer User",
        email: "viewer@financeapp.com",
        password: "Viewer@123",
        role: ROLES.VIEWER,
        isActive: true
      }
    ]);

    await Record.insertMany([
      {
        amount: 4200,
        type: "income",
        category: "Salary",
        date: new Date("2026-03-01"),
        notes: "Monthly salary",
        createdBy: admin._id
      },
      {
        amount: 780,
        type: "expense",
        category: "Rent",
        date: new Date("2026-03-03"),
        notes: "Apartment rent",
        createdBy: admin._id
      },
      {
        amount: 300,
        type: "expense",
        category: "Food",
        date: new Date("2026-03-08"),
        notes: "Groceries",
        createdBy: analyst._id
      },
      {
        amount: 1100,
        type: "income",
        category: "Freelance",
        date: new Date("2026-03-12"),
        notes: "Project payment",
        createdBy: analyst._id
      },
      {
        amount: 250,
        type: "expense",
        category: "Transport",
        date: new Date("2026-03-20"),
        notes: "Monthly commuting",
        createdBy: admin._id
      }
    ]);

    // eslint-disable-next-line no-console
    console.log("Seed completed.");
    // eslint-disable-next-line no-console
    console.log("Admin login: admin@financeapp.com / Admin@123");
    // eslint-disable-next-line no-console
    console.log("Analyst login: analyst@financeapp.com / Analyst@123");
    // eslint-disable-next-line no-console
    console.log("Viewer login: viewer@financeapp.com / Viewer@123");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seed();
