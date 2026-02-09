import dotenv from "dotenv";
import connectDB from "./config/database.js";
import User from "./models/User.js";
import Budget from "./models/Budget.js";
import Transaction from "./models/Transaction.js";

dotenv.config();

const testModels = async () => {
  try {
    await connectDB();

    // Test User Model
    console.log("🧪 Testing User Model...");
    const testUser = new User({
      name: "Test Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    await testUser.validate();
    console.log("✅ User model validation passed");

    // Test Budget Model
    console.log("🧪 Testing Budget Model...");
    const testBudget = new Budget({
      user: testUser._id,
      name: "Presupuesto Mensual Enero",
      category: "alimentacion",
      amount: 50000,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-31"),
    });

    await testBudget.validate();
    console.log("✅ Budget model validation passed");
    console.log(`   Remaining: ${testBudget.remaining}`);
    console.log(`   Percentage Used: ${testBudget.percentageUsed}%`);

    // Test Transaction Model
    console.log("🧪 Testing Transaction Model...");
    const testTransaction = new Transaction({
      user: testUser._id,
      budget: testBudget._id,
      type: "gasto",
      category: "alimentacion",
      amount: 5000,
      description: "Compra en supermercado",
      paymentMethod: "tarjeta_debito",
    });

    await testTransaction.validate();
    console.log("✅ Transaction model validation passed");

    console.log("\n✅ All models validated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Model validation error:", error);
    process.exit(1);
  }
};

testModels();
