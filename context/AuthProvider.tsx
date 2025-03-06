import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { initializeAuthListener, useUserStore } from '@/store/userStore';

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { loading, initialized } = useUserStore();

  useEffect(() => {
    // Initialize auth listener and store cleanup function
    const unsubscribe = initializeAuthListener();
    
    // Clean up the listener when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  if (loading && !initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5956E9" />
        <Text style={{ marginTop: 10, color: '#757575' }}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};