import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token missing' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string };
    (req as AdminRequest).admin = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
}
