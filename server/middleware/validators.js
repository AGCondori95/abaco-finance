import {body} from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({min: 2, max: 50})
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe proporcionar un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({min: 6})
    .withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("role")
    .optional()
    .isIn(["admin", "employee"])
    .withMessage("Rol inválido"),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe proporcionar un email válido")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("La contraseña actual es requerida"),

  body("newPassword")
    .notEmpty()
    .withMessage("La nueva contraseña es requerida")
    .isLength({min: 6})
    .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
];

export const budgetValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre del presupuesto es requerido")
    .isLength({min: 3, max: 100})
    .withMessage("El nombre debe tener entre 3 y 100 caracteres"),

  body("category")
    .notEmpty()
    .withMessage("La categoría es requerida")
    .isIn([
      "alimentacion",
      "transporte",
      "vivienda",
      "salud",
      "educacion",
      "entretenimiento",
      "servicios",
      "otros",
    ])
    .withMessage("Categoría inválida"),

  body("amount")
    .notEmpty()
    .withMessage("El monto es requerido")
    .isFloat({min: 0})
    .withMessage("El monto debe ser un número positivo"),

  body("period")
    .optional()
    .isIn(["mensual", "trimestral", "anual"])
    .withMessage("Período inválido"),

  body("startDate")
    .notEmpty()
    .withMessage("La fecha de inicio es requerida")
    .isISO8601()
    .withMessage("Fecha de inicio inválida"),

  body("endDate")
    .notEmpty()
    .withMessage("La fecha de finalización es requerida")
    .isISO8601()
    .withMessage("Fecha de finalización inválida"),
];
