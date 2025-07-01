import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import asyncHandler from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ username, email, password: hashedPassword });

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  res.status(200).json({
    message: 'Login successful',
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  });
});
