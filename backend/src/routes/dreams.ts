import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

interface Dream {
  uid: string;
  title: string;
  description: string;
  date: string;
  isLucid: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000
  );
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  const weekNo = Math.ceil((dayOfYear + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function computeStreak(dailyCounts: Record<string, number>): {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string;
} {
  const activeDates = Object.entries(dailyCounts)
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort();

  if (activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastEntryDate: '' };
  }

  const lastEntryDate = activeDates[activeDates.length - 1];

  let currentStreak = 1;
  for (let i = activeDates.length - 2; i >= 0; i--) {
    if (daysBetween(activeDates[i], activeDates[i + 1]) === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < activeDates.length; i++) {
    if (daysBetween(activeDates[i - 1], activeDates[i]) === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (lastEntryDate !== today && lastEntryDate !== yesterday) {
    currentStreak = 0;
  }

  return { currentStreak, longestStreak, lastEntryDate };
}

async function recomputeStats(uid: string): Promise<void> {
  const snapshot = await db.collection('dreams').where('uid', '==', uid).get();
  const dreams = snapshot.docs.map(d => d.data() as Dream);

  const dailyCounts: Record<string, number> = {};
  for (const dream of dreams) {
    dailyCounts[dream.date] = (dailyCounts[dream.date] ?? 0) + 1;
  }

  const { currentStreak, longestStreak, lastEntryDate } = computeStreak(dailyCounts);

  const currentWeek = getWeekKey(new Date().toISOString().split('T')[0]);
  const weekDreams = dreams.filter(d => getWeekKey(d.date) === currentWeek);

  await db.collection('userStats').doc(uid).set({
    totalDreams: dreams.length,
    dailyCounts,
    currentStreak,
    longestStreak,
    lastEntryDate,
    weeklyAnalysis: {
      week: currentWeek,
      count: weekDreams.length,
      lucidCount: weekDreams.filter(d => d.isLucid).length,
    },
  });
}

// Stats — must be before /:id to avoid route conflict
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const doc = await db.collection('userStats').doc(uid).get();

  if (!doc.exists) {
    res.json({
      totalDreams: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: '',
      dailyCounts: {},
      weeklyAnalysis: { week: '', count: 0, lucidCount: 0 },
    });
    return;
  }

  res.json(doc.data());
});

// Create
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { title, description, date, isLucid, tags } = req.body;
  const uid = req.user!.uid;

  if (!title || !date) {
    res.status(400).json({ error: 'Title and date are required' });
    return;
  }

  const now = new Date().toISOString();
  const dream: Dream = {
    uid,
    title,
    description: description ?? '',
    date,
    isLucid: isLucid ?? false,
    tags: tags ?? [],
    createdAt: now,
    updatedAt: now,
  };

  const ref = await db.collection('dreams').add(dream);
  await recomputeStats(uid);

  res.status(201).json({ id: ref.id, ...dream });
});

// Get all (sorted in memory to avoid composite index requirement)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const { date } = req.query;

  const snapshot = await db.collection('dreams').where('uid', '==', uid).get();
  let dreams = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Dream) }));

  if (date) {
    dreams = dreams.filter(d => d.date === (date as string));
  }

  dreams.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(dreams);
});

// Get one
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const doc = await db.collection('dreams').doc(req.params.id as string).get();

  if (!doc.exists || doc.data()?.uid !== uid) {
    res.status(404).json({ error: 'Dream not found' });
    return;
  }

  res.json({ id: doc.id, ...doc.data() });
});

// Update
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const { title, description, date, isLucid, tags } = req.body;

  const doc = await db.collection('dreams').doc(req.params.id as string).get();
  if (!doc.exists || doc.data()?.uid !== uid) {
    res.status(404).json({ error: 'Dream not found' });
    return;
  }

  const updates: Partial<Dream> & { updatedAt: string } = {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(date !== undefined && { date }),
    ...(isLucid !== undefined && { isLucid }),
    ...(tags !== undefined && { tags }),
    updatedAt: new Date().toISOString(),
  };

  await db.collection('dreams').doc(req.params.id as string).update(updates);
  await recomputeStats(uid);

  res.json({ id: req.params.id as string, ...doc.data(), ...updates });
});

// Delete
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const doc = await db.collection('dreams').doc(req.params.id as string).get();

  if (!doc.exists || doc.data()?.uid !== uid) {
    res.status(404).json({ error: 'Dream not found' });
    return;
  }

  await db.collection('dreams').doc(req.params.id as string).delete();
  await recomputeStats(uid);

  res.status(204).send();
});

export default router;
