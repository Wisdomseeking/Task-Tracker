import { Request, Response, NextFunction } from 'express';

export const taskValidation = (req: Request, res: Response, next: NextFunction) => {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: 'Title is required and must be a string' });
    }

    if (description && typeof description !== 'string') {
        return res.status(400).json({ message: 'Description must be a string' });
    }

    next();
};
