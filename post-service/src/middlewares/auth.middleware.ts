// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// interface AuthRequest extends Request {
//   userId?: string;
// }

// export const authenticate = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const authHeader = req.headers.authorization;

//   console.log('🟡 Incoming Authorization header:', authHeader);

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     console.log('❌ Token missing or malformed');
//     res.status(401).json({ message: 'Unauthorized' });
//     return;
//   }

//   const token = authHeader.split(' ')[1];
//   console.log('🔐 Extracted Token:', token);

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };

//     console.log('✅ Decoded Token Payload:', decoded);

//     req.userId = decoded._id; // ✅ Corrected to _id
//     next();
//   } catch (err) {
//     if (err instanceof Error) {
//       console.log('❌ Token verification failed:', err.message);
//     } else {
//       console.log('❌ Unknown error during token verification:', err);
//     }

//     res.status(401).json({ message: 'Invalid token' });
//     return;
//   }
// };


import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  userId?: string;
  decodedToken?: any; // ⬅️ Add this line to hold decoded info
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized - No token provided' });
    return; // ✅ just use return here
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };

    req.userId = decoded._id;
    (req as any).decodedToken = decoded;

    next(); // ✅ move forward
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
    return; // ✅ again, just end the function
  }
};
