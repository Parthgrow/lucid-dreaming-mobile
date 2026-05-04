import { Router, Response } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  try {
    const doc = await db.collection('users').doc(uid).get();
    const data = doc.data() ?? {};
    res.json({ meditationMinutes: data['meditationMinutes'] ?? 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/meditate', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  try {
    await db.collection('users').doc(uid).update({
      meditationMinutes: admin.firestore.FieldValue.increment(5),
    });
    const doc = await db.collection('users').doc(uid).get();
    const data = doc.data() ?? {};
    res.json({ meditationMinutes: data['meditationMinutes'] ?? 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
