import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'


const ExploreScreen = () => {
  return (
    <SafeAreaView className='flex-1 items-center bg-[#171717]'>
      <StatusBar style='light'/>
      <Text className='text-white'>Explore</Text>
    </SafeAreaView>
  )
}

export default ExploreScreen;