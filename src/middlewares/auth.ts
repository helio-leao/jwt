import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import TokenPayload from "../types/TokenPayload";

const { ACCESS_TOKEN_SECRET } = process.env;

export function authToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const { user } = jwt.verify(token, ACCESS_TOKEN_SECRET!) as TokenPayload;
    req.user = user;
    next();
  } catch (error) {
    res.sendStatus(401);
  }
}

export function authRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      res.sendStatus(403);
      return;
    }
    next();
  };
}
