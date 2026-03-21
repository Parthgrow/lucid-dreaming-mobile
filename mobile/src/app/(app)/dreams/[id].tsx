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

interface Dream {
  id: string;
  title: string;
  description: string;
  date: string;
  isLucid: boolean;
  tags: string[];
}

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isLucid, setIsLucid] = useState(false);
  const [tags, setTags] = useState('');

  useEffect(() => {
    const fetchDream = async () => {
      try {
        const res = await fetch(`${BASE_URL}/dreams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load dream');
        setDream(data);
        setTitle(data.title);
        setDescription(data.description);
        setDate(data.date);
        setIsLucid(data.isLucid);
        setTags((data.tags ?? []).join(', '));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDream();
  }, [id, token]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/dreams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date,
          isLucid,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update dream');
      setDream({ ...dream!, ...data });
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Dream', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await fetch(`${BASE_URL}/dreams/${id}`, {
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

  if (error && !dream) {
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
          title: dream?.title ?? 'Dream',
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
                  <Pressable onPress={() => { setEditing(false); setError(''); }}>
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
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          {editing ? (
            <>
              <TextInput
                className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
                value={title}
                onChangeText={setTitle}
                placeholder="Dream title"
                placeholderTextColor="#555"
              />
              <TextInput
                className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your dream..."
                placeholderTextColor="#555"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
              />
              <TextInput
                className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#555"
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
                className="bg-[#111111] border border-[#2A2A2A] text-white rounded-xl px-4 py-4 mb-4 text-base"
                value={tags}
                onChangeText={setTags}
                placeholder="Tags (comma separated)"
                placeholderTextColor="#555"
                autoCapitalize="none"
              />
              {error ? <Text className="text-[#EF4444] text-sm">{error}</Text> : null}
            </>
          ) : (
            <>
              {/* Title */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white text-2xl font-bold flex-1 mr-3">{dream?.title}</Text>
                {dream?.isLucid && (
                  <View className="bg-[#00BCD4] px-3 py-1 rounded-full">
                    <Text className="text-black text-xs font-bold">LUCID</Text>
                  </View>
                )}
              </View>

              {/* Date */}
              <Text className="text-[#888888] text-sm mb-6">{dream?.date}</Text>

              {/* Description */}
              {dream?.description ? (
                <View className="mb-6">
                  <Text className="text-[#888888] text-xs tracking-widest uppercase mb-2">Description</Text>
                  <Text className="text-white text-base leading-6">{dream.description}</Text>
                </View>
              ) : null}

              {/* Tags */}
              {dream?.tags && dream.tags.length > 0 ? (
                <View>
                  <Text className="text-[#888888] text-xs tracking-widest uppercase mb-2">Tags</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {dream.tags.map((tag, i) => (
                      <View key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1 rounded-full">
                        <Text className="text-[#888888] text-xs">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
