import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },
    type: {
      type: String,
      required: [true, "Por favor especifique el tipo de transacción"],
      enum: ["ingreso", "gasto"],
    },
    category: {
      type: String,
      required: [true, "Por favor seleccione una categoría"],
      enum: [
        "salario",
        "freelance",
        "inversiones",
        "alimentacion",
        "transporte",
        "vivienda",
        "salud",
        "educacion",
        "entretenimiento",
        "servicios",
        "otros",
      ],
    },
    amount: {
      type: Number,
      required: [true, "Por favor ingrese un monto"],
      min: [0.01, "El monto debe ser mayor a 0"],
    },
    description: {
      type: String,
      required: [true, "Por favor ingrese una descripción"],
      trim: true,
      maxlength: [200, "La descripción no puede exceder 200 caracteres"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: [
        "efectivo",
        "tarjeta_debito",
        "tarjeta_credito",
        "transferencia",
        "otro",
      ],
      default: "efectivo",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Las notas no pueden exceder 500 caracteres"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["semanal", "quincenal", "mensual", "anual", null],
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
transactionSchema.index({user: 1, date: -1});
transactionSchema.index({user: 1, type: 1, category: 1});
transactionSchema.index({budget: 1});

// Update budget spent amount after transaction save
transactionSchema.post("save", async function () {
  if (this.budget && this.type === "gasto") {
    const Budget = mongoose.model("Budget");
    await Budget.findByIdAndUpdate(this.budget, {
      $inc: {spent: this.amount},
    });
  }
});

// Update budget spent amount after transaction deletion
transactionSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.budget && doc.type === "gasto") {
    const Budget = mongoose.model("Budget");
    await Budget.findByIdAndUpdate(doc.budget, {
      $inc: {spent: -doc.amount},
    });
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
