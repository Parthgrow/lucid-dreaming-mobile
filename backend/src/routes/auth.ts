import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { emailPasswordStrategy } from '../strategies/email-password.strategy';
import { AuthStrategy } from '../strategies/base.strategy';

const router = Router();
const strategy: AuthStrategy = emailPasswordStrategy;

const issueToken = (uid: string, email: string): string =>
  jwt.sign({ uid, email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

router.post('/signup', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await strategy.signup({ email, password });
    const token = issueToken(user.uid, user.email);
    res.status(201).json({ token, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await strategy.login({ email, password });
    const token = issueToken(user.uid, user.email);
    res.status(200).json({ token, user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

export default router;
