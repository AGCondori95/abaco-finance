import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verificar si el usuario está autenticado
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Usuario desactivado",
        });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "No autorizado, token inválido",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No autorizado, no se proporcionó token",
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol '${req.user.role}' no tiene permiso para acceder a este recurso`,
      });
    }
    next();
  };
};
