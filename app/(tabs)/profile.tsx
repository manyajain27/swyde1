import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { s, vs, ms } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import LoadingOverlay from '@/components/Loading';

const ProfileScreen = () => {
  const { user, signOut } = useUserStore();
  const [isLoading, setIsLoading] = useState(false); // State to manage loading overlay visibility

  const handleSignOut = async () => {
    setIsLoading(true);
    setTimeout(async() => {
      try {
        await signOut();
      } catch (error) {
        Alert.alert('Sign Out', 'Failed to sign out');
      } finally {
          setIsLoading(false);
      }
    },3000)
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar  style='light'/>
      {/* Loading Overlay */}
      <LoadingOverlay visible={isLoading} mainText="Sad to see you go ☹️" subText='Signing you out..' />

      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={40} color="#FFF" />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user?.user_metadata.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
        <Ionicons name="log-out-outline" size={20} color="tomato" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
  },
  header: {
    paddingHorizontal: s(24),
    paddingVertical: vs(16),
  },
  title: {
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#F5F5DC',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(24),
    paddingVertical: vs(16),
  },
  avatarPlaceholder: {
    width: ms(60),
    height: ms(60),
    borderRadius: ms(30),
    backgroundColor: 'tomato',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: s(16),
  },
  userName: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#F5F5DC',
  },
  userEmail: {
    fontSize: ms(14),
    color: '#999',
    marginTop: vs(4),
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: s(24),
    marginTop: vs(40),
    paddingVertical: vs(12),
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: 'tomato',
  },
  signOutText: {
    fontSize: ms(16),
    fontWeight: '500',
    color: 'tomato',
    marginRight: s(8),
  },
});

export default ProfileScreen;