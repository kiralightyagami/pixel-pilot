import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.CLERK_JWT_PUBLIC_KEY!, {
      algorithms: ["HS256"],
    });
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const userId = (decoded as any).sub;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};