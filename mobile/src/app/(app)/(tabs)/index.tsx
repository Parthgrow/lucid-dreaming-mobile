import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/use-auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

interface Dream {
  id: string;
  title: string;
  description: string;
  date: string;
  isLucid: boolean;
  tags: string[];
  createdAt: string;
}

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HomeScreen() {
  const { token, logout, user } = useAuth();
  const router = useRouter();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDreams = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/dreams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDreams(Array.isArray(data) ? data : []);
    } catch {
      // silently fail — empty state shown
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDreams();
    }, [fetchDreams])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDreams();
  };

  // Group dreams by date
  const grouped = dreams.reduce<{ date: string; items: Dream[] }[]>((acc, dream) => {
    const existing = acc.find(g => g.date === dream.date);
    if (existing) {
      existing.items.push(dream);
    } else {
      acc.push({ date: dream.date, items: [dream] });
    }
    return acc;
  }, []);

  grouped.sort((a, b) => b.date.localeCompare(a.date));

  type ListItem =
    | { type: 'header'; date: string; key: string }
    | { type: 'dream'; dream: Dream; key: string };

  const flatItems: ListItem[] = grouped.flatMap(g => [
    { type: 'header', date: g.date, key: `h-${g.date}` },
    ...g.items.map(d => ({ type: 'dream' as const, dream: d, key: d.id })),
  ]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-[#888888] text-xs tracking-widest uppercase">Dream Journal</Text>
          <Text className="text-white text-xl font-bold">{user?.email?.split('@')[0]}</Text>
        </View>
        <Pressable onPress={logout}>
          <Text className="text-[#EF4444] text-sm">Sign out</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#00BCD4" />
        </View>
      ) : dreams.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[#2A2A2A] text-6xl mb-4">◎</Text>
          <Text className="text-white text-lg font-semibold mb-2">No dreams yet</Text>
          <Text className="text-[#888888] text-sm text-center">
            Tap + to log your first dream entry
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatItems}
          keyExtractor={item => item.key}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00BCD4" />}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <Text className="text-[#888888] text-xs tracking-widest uppercase mt-6 mb-2">
                  {formatDateLabel(item.date)}
                </Text>
              );
            }
            const { dream } = item;
            return (
              <Pressable
                onPress={() => router.push(`/dreams/${dream.id}`)}
                className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 mb-3 active:opacity-70">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-white font-semibold text-base flex-1 mr-2" numberOfLines={1}>
                    {dream.title}
                  </Text>
                  {dream.isLucid && (
                    <View className="bg-[#00BCD4] px-2 py-0.5 rounded-full">
                      <Text className="text-black text-xs font-bold">LUCID</Text>
                    </View>
                  )}
                </View>
                {dream.description ? (
                  <Text className="text-[#888888] text-sm" numberOfLines={2}>
                    {dream.description}
                  </Text>
                ) : null}
              </Pressable>
            );
          }}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/dreams/new')}
        className="absolute bottom-8 right-6 bg-[#00BCD4] w-14 h-14 rounded-full items-center justify-center active:opacity-80"
        style={{ elevation: 4 }}>
        <Text className="text-black text-3xl font-light" style={{ lineHeight: 34, marginTop: -2 }}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
