import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/hooks/use-auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

interface DreamPlan {
  id: string;
  title: string;
  sankalpa: string;
  description: string;
  goals: string[];
  isActive: boolean;
}

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [plan, setPlan] = useState<DreamPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');

  // Edit state
  const [title, setTitle] = useState('');
  const [sankalpa, setSankalpa] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch(`${BASE_URL}/dream-plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load plan');
        setPlan(data);
        setTitle(data.title);
        setSankalpa(data.sankalpa ?? '');
        setDescription(data.description ?? '');
        setGoals(data.goals ?? []);
        setIsActive(data.isActive ?? false);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPlan();
  }, [id, token]);

  const addGoal = () => {
    const trimmed = goalInput.trim();
    if (!trimmed) return;
    setGoals(prev => [...prev, trimmed]);
    setGoalInput('');
  };

  const removeGoal = (index: number) => {
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const finalGoals = goalInput.trim() ? [...goals, goalInput.trim()] : goals;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/dream-plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          sankalpa: sankalpa.trim(),
          description: description.trim(),
          goals: finalGoals,
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update plan');
      setPlan({ ...plan!, ...data });
      setGoals(finalGoals);
      setGoalInput('');
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      await fetch(`${BASE_URL}/dream-plans/${id}/activate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlan(prev => prev ? { ...prev, isActive: true } : prev);
      setIsActive(true);
    } finally {
      setActivating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Plan', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await fetch(`${BASE_URL}/dream-plans/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            router.back();
          } catch {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#00BCD4" />
      </View>
    );
  }

  if (error && !plan) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-[#EF4444] text-base">{error}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: plan?.title ?? 'Plan',
          headerRight: () => (
            <View className="flex-row gap-4 mr-2">
              {!editing ? (
                <>
                  <Pressable onPress={() => setEditing(true)}>
                    <Text className="text-[#00BCD4] text-base">Edit</Text>
                  </Pressable>
                  <Pressable onPress={handleDelete} disabled={deleting}>
                    {deleting ? (
                      <ActivityIndicator color="#EF4444" size="small" />
                    ) : (
                      <Text className="text-[#EF4444] text-base">Delete</Text>
                    )}
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    onPress={() => {
                      setEditing(false);
                      setError('');
                      // reset to saved values
                      setTitle(plan!.title);
                      setSankalpa(plan!.sankalpa ?? '');
                      setDescription(plan!.description ?? '');
                      setGoals(plan!.goals ?? []);
                      setGoalInput('');
                      setIsActive(plan!.isActive);
                    }}>
                    <Text className="text-[#888888] text-base">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleSave} disabled={saving}>
                    {saving ? (
                      <ActivityIndicator color="#00BCD4" size="small" />
                    ) : (
                      <Text className="text-[#00BCD4] text-base font-semibold">Save</Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-black"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled">
          {editing ? (
            <>
              <TextInput
                className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
                value={title}
                onChangeText={setTitle}
                placeholder="Plan title"
                placeholderTextColor="#555"
              />

              <View className="mb-4">
                <Text className="text-[#888888] text-xs tracking-widest uppercase mb-2">Sankalpa</Text>
                <TextInput
                  className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 text-base"
                  value={sankalpa}
                  onChangeText={setSankalpa}
                  placeholder="A short intention..."
                  placeholderTextColor="#555"
                />
              </View>

              <TextInput
                className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your full plan..."
                placeholderTextColor="#555"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />

              {/* Goals editor */}
              <View className="mb-4">
                <Text className="text-[#888888] text-xs tracking-widest uppercase mb-2">Goals</Text>
                {goals.map((goal, i) => (
                  <View
                    key={i}
                    className="flex-row items-center bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 mb-2">
                    <Text className="text-[#00BCD4] mr-3">◆</Text>
                    <Text className="text-white text-sm flex-1">{goal}</Text>
                    <Pressable onPress={() => removeGoal(i)} className="ml-2 active:opacity-60">
                      <Text className="text-[#EF4444] text-base">✕</Text>
                    </Pressable>
                  </View>
                ))}
                <View className="flex-row gap-2">
                  <TextInput
                    className="flex-1 bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm"
                    placeholder="Add a goal..."
                    placeholderTextColor="#555"
                    value={goalInput}
                    onChangeText={setGoalInput}
                    onSubmitEditing={addGoal}
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                  <Pressable
                    onPress={addGoal}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 items-center justify-center active:opacity-60">
                    <Text className="text-[#00BCD4] text-xl font-light">+</Text>
                  </Pressable>
                </View>
              </View>

              <View className="bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-4 mb-4 flex-row items-center justify-between">
                <Text className="text-white text-base">Active plan</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: '#2A2A2A', true: '#00BCD4' }}
                  thumbColor={isActive ? '#fff' : '#888'}
                />
              </View>

              {error ? <Text className="text-[#EF4444] text-sm">{error}</Text> : null}
            </>
          ) : (
            <>
              {/* Title + active badge */}
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-white text-2xl font-bold flex-1 mr-3">{plan?.title}</Text>
                {plan?.isActive && (
                  <View className="bg-[#00BCD4] px-3 py-1 rounded-full">
                    <Text className="text-black text-xs font-bold">ACTIVE</Text>
                  </View>
                )}
              </View>

              {/* Sankalpa */}
              {plan?.sankalpa ? (
                <View className="bg-[#0D2B2E] border border-[#00BCD4] rounded-xl p-4 mt-4 mb-6">
                  <Text className="text-[#00BCD4] text-xs tracking-widest uppercase mb-1">
                    Sankalpa
                  </Text>
                  <Text className="text-white text-base italic">"{plan.sankalpa}"</Text>
                </View>
              ) : (
                <View className="mb-4" />
              )}

              {/* Description */}
              {plan?.description ? (
                <View className="mb-6">
                  <Text className="text-[#888888] text-xs tracking-widest uppercase mb-2">
                    Plan
                  </Text>
                  <Text className="text-white text-base leading-6">{plan.description}</Text>
                </View>
              ) : null}

              {/* Goals */}
              {plan?.goals && plan.goals.length > 0 ? (
                <View className="mb-6">
                  <Text className="text-[#888888] text-xs tracking-widest uppercase mb-3">
                    Goals
                  </Text>
                  {plan.goals.map((goal, i) => (
                    <View key={i} className="flex-row items-start mb-3">
                      <Text className="text-[#00BCD4] mr-3 mt-0.5">◆</Text>
                      <Text className="text-white text-base flex-1 leading-6">{goal}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Activate button (if not already active) */}
              {!plan?.isActive && (
                <Pressable
                  onPress={handleActivate}
                  disabled={activating}
                  className="border border-[#00BCD4] rounded-xl py-4 items-center mt-2 active:opacity-70">
                  {activating ? (
                    <ActivityIndicator color="#00BCD4" />
                  ) : (
                    <Text className="text-[#00BCD4] font-semibold text-base">
                      Set as Active Plan
                    </Text>
                  )}
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
