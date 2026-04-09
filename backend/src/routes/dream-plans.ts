import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

interface DreamPlan {
  uid: string;
  title: string;
  sankalpa: string;
  description: string;
  goals: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all plans
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const snapshot = await db.collection('dreamPlans').where('uid', '==', uid).get();
  const plans = snapshot.docs
    .map(doc => ({ id: doc.id, ...(doc.data() as DreamPlan) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(plans);
});

// Create
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { title, sankalpa, description, goals, isActive } = req.body;
  const uid = req.user!.uid;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const now = new Date().toISOString();

  if (isActive) {
    const existing = await db
      .collection('dreamPlans')
      .where('uid', '==', uid)
      .where('isActive', '==', true)
      .get();
    const batch = db.batch();
    existing.docs.forEach(doc => batch.update(doc.ref, { isActive: false }));
    await batch.commit();
  }

  const plan: DreamPlan = {
    uid,
    title,
    sankalpa: sankalpa ?? '',
    description: description ?? '',
    goals: goals ?? [],
    isActive: isActive ?? false,
    createdAt: now,
    updatedAt: now,
  };

  const ref = await db.collection('dreamPlans').add(plan);
  res.status(201).json({ id: ref.id, ...plan });
});

// Get one — must be before /:id/activate to avoid conflicts
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const doc = await db.collection('dreamPlans').doc(req.params.id as string).get();

  if (!doc.exists || doc.data()?.uid !== uid) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }

  res.json({ id: doc.id, ...doc.data() });
});

// Update
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const { title, sankalpa, description, goals, isActive } = req.body;

  const doc = await db.collection('dreamPlans').doc(req.params.id as string).get();
  if (!doc.exists || doc.data()?.uid !== uid) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }

  if (isActive === true) {
    const existing = await db
      .collection('dreamPlans')
      .where('uid', '==', uid)
      .where('isActive', '==', true)
      .get();
    const batch = db.batch();
    existing.docs.forEach(d => {
      if (d.id !== (req.params.id as string)) batch.update(d.ref, { isActive: false });
    });
    await batch.commit();
  }

  const updates: Partial<DreamPlan> & { updatedAt: string } = {
    ...(title !== undefined && { title }),
    ...(sankalpa !== undefined && { sankalpa }),
    ...(description !== undefined && { description }),
    ...(goals !== undefined && { goals }),
    ...(isActive !== undefined && { isActive }),
    updatedAt: new Date().toISOString(),
  };

  await db.collection('dreamPlans').doc(req.params.id as string).update(updates);
  res.json({ id: req.params.id as string, ...doc.data(), ...updates });
});

// Activate — set one plan active, deactivate all others
router.put('/:id/activate', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const doc = await db.collection('dreamPlans').doc(req.params.id as string).get();

  if (!doc.exists || doc.data()?.uid !== uid) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }

  const allPlans = await db.collection('dreamPlans').where('uid', '==', uid).get();
  const now = new Date().toISOString();
  const batch = db.batch();
  allPlans.docs.forEach(d => {
    batch.update(d.ref, { isActive: d.id === (req.params.id as string), updatedAt: now });
  });
  await batch.commit();

  res.json({ id: req.params.id as string, ...doc.data(), isActive: true });
});

// Delete
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const doc = await db.collection('dreamPlans').doc(req.params.id as string).get();

  if (!doc.exists || doc.data()?.uid !== uid) {
    res.status(404).json({ error: 'Plan not found' });
    return;
  }

  await db.collection('dreamPlans').doc(req.params.id as string).delete();
  res.status(204).send();
});

export default router;
