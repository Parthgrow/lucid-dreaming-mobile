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

export default function NewDreamScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(today);
  const [isLucid, setIsLucid] = useState(false);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setError('Date must be in YYYY-MM-DD format');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date,
          isLucid,
          tags: tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create dream');

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
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <TextInput
          className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
          placeholder="Dream title"
          placeholderTextColor="#555"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
          placeholder="Describe your dream..."
          placeholderTextColor="#555"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{ minHeight: 120 }}
        />

        <TextInput
          className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor="#555"
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
        />

        <View className="bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-4 mb-4 flex-row items-center justify-between">
          <Text className="text-white text-base">Lucid dream?</Text>
          <Switch
            value={isLucid}
            onValueChange={setIsLucid}
            trackColor={{ false: '#2A2A2A', true: '#00BCD4' }}
            thumbColor={isLucid ? '#fff' : '#888'}
          />
        </View>

        <TextInput
          className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-6 text-base"
          placeholder="Tags (comma separated)"
          placeholderTextColor="#555"
          value={tags}
          onChangeText={setTags}
          autoCapitalize="none"
        />

        {error ? (
          <Text className="text-[#EF4444] text-sm mb-4">{error}</Text>
        ) : null}

        <Pressable
          onPress={handleCreate}
          disabled={loading}
          className="bg-[#00BCD4] rounded-xl py-4 items-center">
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-black font-semibold text-base">Save Dream</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
