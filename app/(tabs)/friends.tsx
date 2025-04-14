import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

const FriendsScreen = () => {
  const { user } = useUserStore();
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createRoom = async () => {
    if (!user) {
      Alert.alert("Error", "You need to be logged in");
      return;
    }

    setIsLoading(true);
    
    try {
      const code = generateRoomCode();
      
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: user.id
        })
        .select()
        .single();
        
      if (roomError || !room) {
        console.error("Error creating room:", roomError);
        Alert.alert("Error", "Failed to create room. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Join the room as the creator
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: user.id
        });
        
      if (memberError) {
        console.error("Error joining room:", memberError);
        Alert.alert("Error", "Failed to join the room you created. Please try again.");
        setIsLoading(false);
        return;
      }
      
      router.push(`/room/${code}`);
    } catch (error) {
      console.error("Exception in room creation:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!user) {
      Alert.alert("Error", "You need to be logged in");
      return;
    }
    
    if (!roomCode.trim()) {
      Alert.alert("Error", "Please enter a room code");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const code = roomCode.trim().toUpperCase();
      
      // Find the room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', code)
        .eq('is_active', true)
        .single();
        
      if (roomError || !room) {
        console.error("Error finding room:", roomError);
        Alert.alert("Error", "Room not found or no longer active");
        setIsLoading(false);
        return;
      }
      
      // Join the room
      const { error: memberError } = await supabase
        .from('room_members')
        .upsert({
          room_id: room.id,
          user_id: user.id,
          is_ready: false
        });
        
      if (memberError) {
        console.error("Error joining room:", memberError);
        Alert.alert("Error", "Failed to join the room. Please try again.");
        setIsLoading(false);
        return;
      }
      
      router.push(`/room/${code}`);
    } catch (error) {
      console.error("Exception in room joining:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join or Create Room</Text>
      
      <TextInput
        placeholder="Enter Room Code"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={roomCode}
        onChangeText={setRoomCode}
        autoCapitalize="characters"
        editable={!isLoading}
      />
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.disabledButton]} 
        onPress={joinRoom}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Join Room</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#444' }, isLoading && styles.disabledButton]} 
        onPress={createRoom}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Create Room</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#F5F5DC',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'MuseoSansRounded-700',
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 10,
    color: '#fff',
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'MuseoSansRounded-500',
  },
  button: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5F5DC',
    fontSize: 16,
    fontFamily: 'MuseoSansRounded-600',
  },
  disabledButton: {
    opacity: 0.5,
  }
});