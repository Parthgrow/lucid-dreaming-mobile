import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/use-auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

interface Stats {
  totalDreams: number;
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string;
  dailyCounts: Record<string, number>;
  weeklyAnalysis: { week: string; count: number; lucidCount: number };
}

function buildGraphDays(dailyCounts: Record<string, number>): { date: string; count: number }[][] {
  const today = new Date();
  // Start 83 days ago so we have exactly 84 days (12 weeks)
  const start = new Date(today);
  start.setDate(today.getDate() - 83);

  const allDays: { date: string; count: number }[] = [];
  for (let i = 0; i < 84; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    allDays.push({ date: dateStr, count: dailyCounts[dateStr] ?? 0 });
  }

  const weeks: { date: string; count: number }[][] = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(allDays.slice(w * 7, (w + 1) * 7));
  }
  return weeks;
}

function cellColor(count: number): string {
  if (count === 0) return '#1A1A1A';
  if (count === 1) return 'rgba(0,188,212,0.4)';
  return '#00BCD4';
}

export default function StatsScreen() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const fetch_ = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${BASE_URL}/dreams/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (active) setStats(data);
        } finally {
          if (active) setLoading(false);
        }
      };
      fetch_();
      return () => { active = false; };
    }, [token])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#00BCD4" />
      </SafeAreaView>
    );
  }

  const weeks = buildGraphDays(stats?.dailyCounts ?? {});

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {/* Header */}
        <Text className="text-[#888888] text-xs tracking-widest uppercase mt-6 mb-4">Statistics</Text>

        {/* Streak Card */}
        <View className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 mb-4">
          <Text className="text-[#888888] text-xs tracking-widest uppercase mb-3">Streak</Text>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-[#00BCD4] text-4xl font-bold">{stats?.currentStreak ?? 0}</Text>
              <Text className="text-[#888888] text-xs mt-1">Current</Text>
            </View>
            <View className="w-px bg-[#2A2A2A] mx-4" />
            <View className="flex-1">
              <Text className="text-white text-4xl font-bold">{stats?.longestStreak ?? 0}</Text>
              <Text className="text-[#888888] text-xs mt-1">Longest</Text>
            </View>
            <View className="w-px bg-[#2A2A2A] mx-4" />
            <View className="flex-1">
              <Text className="text-white text-4xl font-bold">{stats?.totalDreams ?? 0}</Text>
              <Text className="text-[#888888] text-xs mt-1">Total</Text>
            </View>
          </View>
        </View>

        {/* Git Graph */}
        <View className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5 mb-4">
          <Text className="text-[#888888] text-xs tracking-widest uppercase mb-4">Last 12 Weeks</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {weeks.map((week, wi) => (
              <View key={wi} style={{ flexDirection: 'column', gap: 4 }}>
                {week.map((day, di) => (
                  <View
                    key={di}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      backgroundColor: cellColor(day.count),
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
          <View className="flex-row justify-between mt-3">
            <Text className="text-[#888888] text-xs">12 weeks ago</Text>
            <Text className="text-[#888888] text-xs">Today</Text>
          </View>
        </View>

        {/* Weekly Analysis */}
        <View className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-5">
          <Text className="text-[#888888] text-xs tracking-widest uppercase mb-3">This Week</Text>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold">
                {stats?.weeklyAnalysis?.count ?? 0}
              </Text>
              <Text className="text-[#888888] text-xs mt-1">Dreams</Text>
            </View>
            <View className="w-px bg-[#2A2A2A] mx-4" />
            <View className="flex-1">
              <Text className="text-[#00BCD4] text-3xl font-bold">
                {stats?.weeklyAnalysis?.lucidCount ?? 0}
              </Text>
              <Text className="text-[#888888] text-xs mt-1">Lucid</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
