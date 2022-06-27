import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    await authService.register({
      email,
      password,
    });

    res.status(201).json({ message: 'registered' });
  } catch (error) {
    next(error);
  }
};

const logIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const {
      cookie,
      user: { _id: userId },
      expirationDate,
    } = await authService.login({ email, password });

    res.setHeader('Set-Cookie', [cookie]);
    res.status(200).json({ userId, expirationDate });
  } catch (error) {
    next(error);
  }
};

export { register, logIn };
