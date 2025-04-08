import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const FriendsScreen = () => {
  const [roomCode, setRoomCode] = useState('');
  const setLoading = useUserStore(state => state.setLoading);
  const user = useUserStore(state => state.user);
  const router = useRouter();

  const createRoom = async () => {
    const code = generateRoomCode();
    setLoading(true);

    const { data, error } = await supabase
      .from('swipe_rooms')
      .insert({ code, user1_id: user?.id })
      .select()
      .single();

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.push({
      pathname: '/room/[code]',
      params: {code},
    })
  };

  const joinRoom = async () => {
    if (!roomCode) return Alert.alert('Error', 'Enter a room code');

    setLoading(true);

    const { data: room, error } = await supabase
      .from('swipe_rooms')
      .update({ user2_id: user?.id, status: 'ready' })
      .eq('code', roomCode.toUpperCase())
      .eq('status', 'waiting')
      .is('user2_id', null)
      .select()
      .single();

    setLoading(false);

    if (error || !room) {
      Alert.alert('Invalid Code', 'Room not found or already full.');
      return;
    }

    router.push({
      pathname: '/room/[code]',
      params: { roomCode },
    })
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swyde with a Friend</Text>

      <TouchableOpacity style={styles.button} onPress={createRoom}>
        <Text style={styles.buttonText}>Create Room</Text>
      </TouchableOpacity>

      <Text style={styles.or}>OR</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Room Code"
        value={roomCode}
        onChangeText={setRoomCode}
        autoCapitalize="characters"
        maxLength={6}
      />

      <TouchableOpacity style={styles.button} onPress={joinRoom}>
        <Text style={styles.buttonText}>Join Room</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FriendsScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: '24@s',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: '20@ms',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '30@vs',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: '8@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '10@vs',
    marginBottom: '20@vs',
    fontSize: '16@ms',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: '12@vs',
    borderRadius: '8@ms',
    alignItems: 'center',
    marginBottom: '10@vs',
  },
  buttonText: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: '600',
  },
  or: {
    textAlign: 'center',
    marginVertical: '10@vs',
    fontSize: '14@ms',
    color: '#888',
  },
});
