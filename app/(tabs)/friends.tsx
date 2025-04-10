import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

const FriendsScreen = () => {
  const { user } = useUserStore();
  const [roomCode, setRoomCode] = useState('');

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createRoom = async () => {
    if (!user) return;

    const code = generateRoomCode();

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        code,
        host_id: user.id,
      })
      .select()
      .single();

    if (roomError || !room) {
      console.error('Room creation error:', roomError);
      Alert.alert("Error", "Couldn't create room");
      return;
    }

    // Add self to room_members
    const { error: memberError } = await supabase.from('room_members').insert({
      room_id: room.id,
      user_id: user.id,
    });

    if (memberError) {
      console.error('Adding self to room_members failed:', memberError);
    }

    router.push(`/room/${code}`);
  };

  const joinRoom = async () => {
    if (!user) return;

    const code = roomCode.trim().toUpperCase();
    console.log('Fetching room with code:', code);

    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !room) {
      console.error('Error fetching room:', error);
      Alert.alert('Room not found or inactive');
      return;
    }

    const { error: joinError } = await supabase
      .from('room_members')
      .upsert({
        room_id: room.id,
        user_id: user.id,
      });

    if (joinError) {
      console.error('Joining room_members error:', joinError);
      Alert.alert('Failed to join room');
      return;
    }

    router.push(`/room/${code}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join or Create Room</Text>

      <TextInput
        placeholder="Enter Room Code"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={roomCode}
        autoCapitalize="characters"
        onChangeText={setRoomCode}
      />

      <TouchableOpacity style={styles.button} onPress={joinRoom}>
        <Text style={styles.buttonText}>Join Room</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#444' }]} onPress={createRoom}>
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
});
