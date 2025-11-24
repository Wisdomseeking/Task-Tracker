import { Request, Response } from "express";
import { prisma } from "../prismaClient";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { AuthenticatedRequest } from "../middleware/auth";

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_SECONDS = 60 * 60 * 24 * 7; // 7 days

// In-memory refresh token store
const refreshTokenStore: Record<string, { userId: number; expiresAt: number }> = {};

// ----------------------
// Helper Functions
// ----------------------
function signAccessToken(userId: number) {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function signRefreshToken(userId: number) {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = Date.now() + REFRESH_TOKEN_EXPIRES_SECONDS * 1000;
  refreshTokenStore[token] = { userId, expiresAt };
  return token;
}

// ----------------------
// REGISTER USER
// ----------------------
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { name: username, email, password: hashedPassword },
    });

    // Tokens
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    // Store refresh cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXPIRES_SECONDS * 1000,
      path: "/auth/refresh",
    });

    return res.status(201).json({ accessToken, user: { id: user.id, username: user.name, email: user.email } });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

// ----------------------
// LOGIN USER
// ----------------------
export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXPIRES_SECONDS * 1000,
      path: "/auth/refresh",
    });

    return res.json({ accessToken, user: { id: user.id, username: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ----------------------
// REFRESH ACCESS TOKEN
// ----------------------
export const refresh = (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const record = refreshTokenStore[token];
    if (!record) return res.status(401).json({ message: "Invalid refresh token" });

    if (record.expiresAt < Date.now()) {
      delete refreshTokenStore[token];
      return res.status(401).json({ message: "Refresh token expired" });
    }

    const accessToken = signAccessToken(record.userId);
    return res.json({ accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Refresh failed" });
  }
};

// ----------------------
// LOGOUT
// ----------------------
export const logout = (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token && refreshTokenStore[token]) delete refreshTokenStore[token];

    res.clearCookie("refreshToken", { path: "/auth/refresh" });
    return res.json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

// ----------------------
// GET PROFILE
// ----------------------
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      id: user.id,
      username: user.name,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: "Error fetching profile" });
  }
};
