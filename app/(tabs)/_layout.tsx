import { View, Text, Platform } from 'react-native'
import React, { useEffect } from 'react'
import { router, Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useUserStore } from '@/store/userStore'
import * as NavigationBar from 'expo-navigation-bar';

const TabsLayout = () => {

  const {user, initialized} = useUserStore();

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#000');
  },[])

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/(auth)/SignIn');
    }
  }, [user, initialized]);

  return (
    
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#F5F5DC', 
      tabBarInactiveTintColor: '#F5F5DC',
      tabBarStyle: {
        backgroundColor: '#000',
        borderTopWidth: 0,
        height: Platform.OS === 'ios' ? 83 : 66
      },
      tabBarLabelStyle: {
        fontFamily: 'MuseoSansRounded-semibold',
        fontSize: 12
      },
      
  }}>
        <Tabs.Screen name="home"
          options={{
            headerShown: false,
            title: "Home",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
            )
          }} />
        <Tabs.Screen name="explore"
        options={{
          headerShown: false,
          title: "Explore",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "compass" : "compass-outline"} size={size} color={color} />
          )
        }}
        />
        <Tabs.Screen name="friends"
        options={{
          headerShown: false,
          title: "Friends",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          )
        }}
        />
        <Tabs.Screen name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          )
        }}
        />

    </Tabs>
  );
}

export default TabsLayout