import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

const HomeScreen = () => {
  return (
    <SafeAreaView>
      <StatusBar style='dark' translucent={true}/>
      <Text>HomeScreen</Text>
    </SafeAreaView>
  )
}

export default HomeScreen