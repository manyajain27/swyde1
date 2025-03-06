import { View, Text } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'
import { useUserStore } from '@/store/userStore';

const OnboardingIndex = () => {
  const {user, initialized} = useUserStore();

  if(user && initialized){
    return (
      <Redirect href={'/(tabs)/home'}/>
    )
  }

  return (
    <Redirect href={'/onboarding/GetStarted'}/>
  )
}

export default OnboardingIndex