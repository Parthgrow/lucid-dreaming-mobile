import bcrypt from 'bcryptjs';
import { db } from '../config/firebase';
import { AuthStrategy, AuthCredentials, AuthUser } from './base.strategy';

export const emailPasswordStrategy: AuthStrategy = {
  async signup({ email, password }: AuthCredentials): Promise<AuthUser> {
    const existing = await db.collection('users').where('email', '==', email).get();
    if (!existing.empty) throw new Error('User already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const ref = await db.collection('users').add({
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    return { uid: ref.id, email };
  },

  async login({ email, password }: AuthCredentials): Promise<AuthUser> {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) throw new Error('Invalid email or password');

    const doc = snapshot.docs[0];
    const user = doc.data();

    const isMatch = await bcrypt.compare(password, user['passwordHash']);
    if (!isMatch) throw new Error('Invalid email or password');

    return { uid: doc.id, email: user['email'] };
  },
};
