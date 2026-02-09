import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Por favor ingrese un nombre para el presupuesto"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    category: {
      type: String,
      required: [true, "Por favor seleccione una categoría"],
      enum: [
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
      min: [0, "El monto no puede ser negativo"],
    },
    period: {
      type: String,
      enum: ["mensual", "trimestral", "anual"],
      default: "mensual",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual for remaining budget
budgetSchema.virtual("remaining").get(function () {
  return this.amount - this.spent;
});

// Virtual for percentage used
budgetSchema.virtual("percentageUsed").get(function () {
  return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
});

// Ensure virtuals are included in JSON
budgetSchema.set("toJSON", {virtuals: true});
budgetSchema.set("toObject", {virtuals: true});

// Index for better query performance
budgetSchema.index({user: 1, category: 1});
budgetSchema.index({startDate: 1, endDate: 1});

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
