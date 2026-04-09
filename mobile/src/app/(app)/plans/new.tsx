import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

export default function NewPlanScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [sankalpa, setSankalpa] = useState('');
  const [description, setDescription] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addGoal = () => {
    const trimmed = goalInput.trim();
    if (!trimmed) return;
    setGoals(prev => [...prev, trimmed]);
    setGoalInput('');
  };

  const removeGoal = (index: number) => {
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    // Flush any in-progress goal input
    const finalGoals = goalInput.trim()
      ? [...goals, goalInput.trim()]
      : goals;

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/dream-plans`, {
        method: 'POST',
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
      if (!res.ok) throw new Error(data.error ?? 'Failed to create plan');

      router.back();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled">

        <TextInput
          className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
          placeholder="Plan title (e.g. Fly over mountains)"
          placeholderTextColor="#555"
          value={title}
          onChangeText={setTitle}
        />

        {/* Sankalpa */}
        <View className="mb-1">
          <Text className="text-[#888888] text-xs tracking-widest uppercase mb-2">Sankalpa</Text>
          <TextInput
            className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 text-base"
            placeholder="A short intention (e.g. I fly freely and with joy)"
            placeholderTextColor="#555"
            value={sankalpa}
            onChangeText={setSankalpa}
          />
          <Text className="text-[#555555] text-xs mt-1 mb-4">
            Your sankalpa is a brief affirmation — the heart of your dream plan.
          </Text>
        </View>

        <TextInput
          className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
          placeholder="Describe your full plan..."
          placeholderTextColor="#555"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={{ minHeight: 100 }}
        />

        {/* Goals */}
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

        {/* Set active toggle */}
        <View className="bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-4 mb-6 flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-white text-base">Set as active plan</Text>
            <Text className="text-[#555555] text-xs mt-0.5">
              Your active sankalpa appears at the top of the Plan tab
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#2A2A2A', true: '#00BCD4' }}
            thumbColor={isActive ? '#fff' : '#888'}
          />
        </View>

        {error ? <Text className="text-[#EF4444] text-sm mb-4">{error}</Text> : null}

        <Pressable
          onPress={handleCreate}
          disabled={loading}
          className="bg-[#00BCD4] rounded-xl py-4 items-center">
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-black font-semibold text-base">Save Plan</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
