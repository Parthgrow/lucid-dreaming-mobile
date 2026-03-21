import '../global.css';

import { Redirect, Slot, useSegments } from 'expo-router';
import React from 'react';

import { AuthProvider } from '@/context/auth';
import { useAuth } from '@/hooks/use-auth';

const AuthGate = () => {
  const { token, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) return null;

  const inAuthGroup = segments[0] === '(auth)';

  if (!token && !inAuthGroup) return <Redirect href="/(auth)/login" />;
  if (token && inAuthGroup) return <Redirect href="/(app)" />;

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
