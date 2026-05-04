import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/use-auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

export default function MeditationScreen() {
  const { token } = useAuth();
  const [meditationMinutes, setMeditationMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${BASE_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (active) setMeditationMinutes(data.meditationMinutes ?? 0);
        } finally {
          if (active) setLoading(false);
        }
      };
      load();
      return () => { active = false; };
    }, [token])
  );

  const logMeditation = async () => {
    setLogging(true);
    try {
      const res = await fetch(`${BASE_URL}/user/meditate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMeditationMinutes(data.meditationMinutes ?? 0);
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#00BCD4" />
      </SafeAreaView>
    );
  }

  const hours = Math.floor(meditationMinutes / 60);
  const minutes = meditationMinutes % 60;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 px-6">
        <Text className="text-[#888888] text-xs tracking-widest uppercase mt-6 mb-8">Meditation</Text>

        {/* Total time card */}
        <View className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 mb-4">
          <Text className="text-[#888888] text-xs tracking-widest uppercase mb-4">Total Time</Text>
          <View className="flex-row items-end">
            {hours > 0 && (
              <>
                <Text className="text-[#00BCD4] text-6xl font-bold">{hours}</Text>
                <Text className="text-[#888888] text-lg mb-2 ml-1 mr-4">hr</Text>
              </>
            )}
            <Text className="text-[#00BCD4] text-6xl font-bold">{minutes}</Text>
            <Text className="text-[#888888] text-lg mb-2 ml-1">min</Text>
          </View>
          <Text className="text-[#555555] text-xs mt-2">{meditationMinutes} minutes total</Text>
        </View>

        {/* Log button */}
        <TouchableOpacity
          onPress={logMeditation}
          disabled={logging}
          className="rounded-xl p-5 items-center"
          style={{ backgroundColor: logging ? '#1A1A1A' : '#00BCD4' }}
        >
          <Text
            className="text-base font-semibold"
            style={{ color: logging ? '#555555' : '#000000' }}
          >
            {logging ? 'Saving...' : '+ 5 min'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
