// backend/src/controllers/taskController.ts
import { Response } from "express";
import { prisma } from "../prismaClient";
import { Prisma, TaskStatus, TaskPriority } from "@prisma/client";
import { validationResult } from "express-validator";
import { AuthenticatedRequest } from "../middleware/auth";

// Helper – normalize status coming from frontend
const normalizeStatus = (status?: string) => {
  if (!status) return TaskStatus.todo;
  const map: Record<string, TaskStatus> = {
    "todo": TaskStatus.todo,
    "in-progress": TaskStatus.in_progress,
    "in_progress": TaskStatus.in_progress,
    "completed": TaskStatus.completed,
  };
  return map[status] ?? TaskStatus.todo;
};

// Helper – normalize priority
const normalizePriority = (priority?: string) => {
  if (!priority) return TaskPriority.medium;

  const key = priority.toLowerCase();

  const map: Record<string, TaskPriority> = {
    "low": TaskPriority.low,
    "medium": TaskPriority.medium,
    "high": TaskPriority.high,
  };

  return map[key] ?? TaskPriority.medium;
};


// -------------------------
// GET ALL TASKS
// -------------------------
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const statusQuery = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    // Build where clause
    const where: Prisma.TaskWhereInput = { userId };
    if (statusQuery) where.status = normalizeStatus(statusQuery);
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getTasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
};

// -------------------------
// GET TASK BY ID
// -------------------------
export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!id) return res.status(400).json({ message: "Invalid task id" });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    res.json(task);
  } catch (error) {
    console.error("getTaskById error:", error);
    res.status(500).json({ message: "Failed to fetch task", error });
  }
};

// -------------------------
// CREATE TASK
// -------------------------
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = validationResult(req);
    if (!validation.isEmpty())
      return res.status(400).json({ errors: validation.array() });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { title, description, status, priority, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: normalizeStatus(status),
        priority: normalizePriority(priority),
        dueDate: dueDate ? new Date(dueDate) : null,
        user: { connect: { id: userId } },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({ message: "Failed to create task", error });
  }
};

// -------------------------
// UPDATE TASK
// -------------------------
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = validationResult(req);
    if (!validation.isEmpty())
      return res.status(400).json({ errors: validation.array() });

    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!id) return res.status(400).json({ message: "Invalid task id" });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    const { title, description, status, priority, dueDate } = req.body;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ? normalizeStatus(status) : task.status,
        priority: priority ? normalizePriority(priority) : task.priority,
        dueDate: dueDate ? new Date(dueDate) : task.dueDate,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("updateTask error:", error);
    res.status(500).json({ message: "Failed to update task", error });
  }
};

// -------------------------
// DELETE TASK
// -------------------------
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!id) return res.status(400).json({ message: "Invalid task id" });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("deleteTask error:", error);
    res.status(500).json({ message: "Failed to delete task", error });
  }
};

// -------------------------
// TOGGLE TASK STATUS
// -------------------------
export const toggleTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!id) return res.status(400).json({ message: "Invalid task id" });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    const newStatus =
      task.status === TaskStatus.completed ? TaskStatus.todo : TaskStatus.completed;

    const updated = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });

    res.json(updated);
  } catch (error) {
    console.error("toggleTask error:", error);
    res.status(500).json({ message: "Failed to toggle task", error });
  }
};
