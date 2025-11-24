import express from "express";
const router = express.Router();

import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "../controllers/taskController";

import { authenticate } from "../middleware/auth"; 
import { taskValidation } from "../validators/taskValidation";

// Get all tasks
router.get("/", authenticate, getTasks);

// Get task by ID
router.get("/:id", authenticate, getTaskById);

// Create a new task
router.post("/", authenticate, taskValidation, createTask);

// Update a task
router.patch("/:id", authenticate, taskValidation, updateTask);

// Delete a task
router.delete("/:id", authenticate, deleteTask);

// Toggle task status
router.patch("/:id/toggle", authenticate, toggleTask);

export default router;
