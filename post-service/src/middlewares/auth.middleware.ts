import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  console.log('🟡 Incoming Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Token missing or malformed');
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  console.log('🔐 Extracted Token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };

    console.log('✅ Decoded Token Payload:', decoded);

    req.userId = decoded._id; // ✅ Corrected to _id
    next();
  } catch (err) {
    if (err instanceof Error) {
      console.log('❌ Token verification failed:', err.message);
    } else {
      console.log('❌ Unknown error during token verification:', err);
    }

    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};
