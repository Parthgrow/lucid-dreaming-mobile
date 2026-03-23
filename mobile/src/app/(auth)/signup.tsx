import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/use-auth';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await signup(email.trim(), password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        className="flex-1 justify-center px-6"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <Text className="text-white text-3xl font-bold mb-2">Create account</Text>
        <Text className="text-[#888888] text-sm mb-10 tracking-widest uppercase">Start your journey</Text>

        <TextInput
          className="bg-[#111111] border border-[#2A2A2A] text-white rounded-lg px-4 py-4 mb-4"
          placeholder="Email"
          placeholderTextColor="#888888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          className="bg-[#111111] border border-[#2A2A2A] text-white rounded-lg px-4 py-4 mb-4"
          placeholder="Password"
          placeholderTextColor="#888888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? (
          <Text className="text-[#EF4444] text-sm mb-4">{error}</Text>
        ) : null}

        <Pressable
          onPress={handleSignup}
          disabled={loading}
          className="bg-[#00BCD4] rounded-lg py-4 items-center mb-6">
          {loading
            ? <ActivityIndicator color="#000000" />
            : <Text className="text-black font-semibold text-base">Create Account</Text>}
        </Pressable>

        <View className="flex-row justify-center">
          <Text className="text-[#888888] text-sm">Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text className="text-[#00BCD4] text-sm">Sign in</Text>
          </Link>
        </View>

        <Text className="text-[#2A2A2A] text-xs text-center mt-8">
          {process.env.EXPO_PUBLIC_API_URL ?? 'no url set'}
        </Text>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
