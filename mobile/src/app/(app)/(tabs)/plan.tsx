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

interface DreamPlan {
  id: string;
  title: string;
  sankalpa: string;
  description: string;
  goals: string[];
  isActive: boolean;
  createdAt: string;
}

export default function PlanScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<DreamPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/dream-plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
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
      fetchPlans();
    }, [fetchPlans])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const handleActivate = async (id: string) => {
    setActivating(id);
    try {
      await fetch(`${BASE_URL}/dream-plans/${id}/activate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(prev =>
        prev.map(p => ({ ...p, isActive: p.id === id }))
      );
    } finally {
      setActivating(null);
    }
  };

  const activePlan = plans.find(p => p.isActive);

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-[#888888] text-xs tracking-widest uppercase">Dream Plan</Text>
        <Text className="text-white text-xl font-bold">Your Intentions</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#00BCD4" />
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00BCD4" />
          }
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          ListHeaderComponent={
            <>
              {/* Active plan sankalpa banner */}
              <View className="bg-[#0D2B2E] border border-[#00BCD4] rounded-xl p-5 mt-4 mb-6">
                <Text className="text-[#00BCD4] text-xs tracking-widest uppercase mb-2">
                  Active Sankalpa
                </Text>
                {activePlan ? (
                  <>
                    <Text className="text-white text-lg font-semibold italic mb-1">
                      "{activePlan.sankalpa || activePlan.title}"
                    </Text>
                    <Text className="text-[#888888] text-xs">{activePlan.title}</Text>
                  </>
                ) : (
                  <Text className="text-[#555555] text-base">
                    No active plan — set one below
                  </Text>
                )}
              </View>

              {plans.length > 0 && (
                <Text className="text-[#888888] text-xs tracking-widest uppercase mb-3">
                  All Plans
                </Text>
              )}
            </>
          }
          ListEmptyComponent={
            <View className="items-center justify-center pt-16 px-6">
              <Text className="text-[#2A2A2A] text-6xl mb-4">◎</Text>
              <Text className="text-white text-lg font-semibold mb-2">No plans yet</Text>
              <Text className="text-[#888888] text-sm text-center">
                Tap + to create your first dream plan
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/plans/${item.id}`)}
              className="bg-[#111111] border rounded-xl p-4 mb-3 active:opacity-70"
              style={{ borderColor: item.isActive ? '#00BCD4' : '#2A2A2A' }}>
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className="text-white font-semibold text-base flex-1 mr-2"
                  numberOfLines={1}>
                  {item.title}
                </Text>
                {item.isActive && (
                  <View className="bg-[#00BCD4] px-2 py-0.5 rounded-full">
                    <Text className="text-black text-xs font-bold">ACTIVE</Text>
                  </View>
                )}
              </View>

              {item.sankalpa ? (
                <Text className="text-[#00BCD4] text-sm italic mb-2" numberOfLines={1}>
                  "{item.sankalpa}"
                </Text>
              ) : null}

              {item.description ? (
                <Text className="text-[#888888] text-sm mb-2" numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {item.goals.length > 0 && (
                <Text className="text-[#555555] text-xs">
                  {item.goals.length} goal{item.goals.length !== 1 ? 's' : ''}
                </Text>
              )}

              {!item.isActive && (
                <Pressable
                  onPress={() => handleActivate(item.id)}
                  disabled={activating === item.id}
                  className="mt-3 border border-[#2A2A2A] rounded-lg py-2 items-center active:opacity-60">
                  {activating === item.id ? (
                    <ActivityIndicator color="#00BCD4" size="small" />
                  ) : (
                    <Text className="text-[#888888] text-xs">Set as active</Text>
                  )}
                </Pressable>
              )}
            </Pressable>
          )}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/plans/new')}
        className="absolute bottom-8 right-6 bg-[#00BCD4] w-14 h-14 rounded-full items-center justify-center active:opacity-80"
        style={{ elevation: 4 }}>
        <Text className="text-black text-3xl font-light" style={{ lineHeight: 34, marginTop: -2 }}>
          +
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
