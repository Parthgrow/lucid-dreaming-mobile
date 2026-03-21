import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/use-auth';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 px-6 pt-10">

        <Text className="text-[#888888] text-xs tracking-widest uppercase mb-1">Logged in as</Text>
        <Text className="text-white text-xl font-bold mb-10">{user?.email}</Text>

        <Pressable
          onPress={logout}
          className="border border-[#2A2A2A] rounded-lg py-4 items-center">
          <Text className="text-[#EF4444] text-sm font-medium">Sign Out</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}
