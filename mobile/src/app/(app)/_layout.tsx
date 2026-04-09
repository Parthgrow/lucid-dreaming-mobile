import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="dreams/new"
          options={{
            title: 'New Dream',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' },
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="dreams/[id]"
          options={{
            title: 'Dream',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
        <Stack.Screen
          name="plans/new"
          options={{
            title: 'New Plan',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' },
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="plans/[id]"
          options={{
            title: 'Plan',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
