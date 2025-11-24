import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, refresh, logout } from '../controllers/userController';
import { authenticate } from "../middleware/auth";


const router = express.Router();

// ----------------------
// Validation middlewares
// ----------------------
const registerValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ----------------------
// User routes
// ----------------------
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh); // endpoint to refresh access token
router.post('/logout', logout);   // endpoint to logout user
router.get('/profile', authenticate, getProfile);

export default router;
