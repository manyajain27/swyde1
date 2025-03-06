import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { router, Stack } from 'expo-router'
import { useUserStore } from '@/store/userStore';

const AuthLayout = () => {

  const {user, initialized} = useUserStore();

  useEffect(() => {
    if(user && initialized){
      router.replace('/(tabs)/home')
    }
  },[user, initialized])

  return (
    <Stack
    screenOptions={{
      headerShown: false,
    }}
    >
        <Stack.Screen name='SignIn'/>
        <Stack.Screen name='SignUp'/>
    </Stack>
  )
}

export default AuthLayout