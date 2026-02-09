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
