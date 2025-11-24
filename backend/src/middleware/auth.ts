import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

// Extend Request to include user object
export interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: number };

    req.user = { id: decoded.userId }; // <-- MAIN FIX

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
