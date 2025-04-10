import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

const RoomScreen = () => {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useUserStore();

  const [roomId, setRoomId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    let subscription;
    
    const fetchRoom = async () => {
      console.log("Fetching room with code:", code);
      
      const { data: room, error } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      console.log("Room result:", room, error);
      
      if (!room) {
        console.log("No room found");
        return;
      }

      setRoomId(room.id);
      
      // Fetch initial members
      fetchMembers(room.id);
      
      // Set up realtime subscription
      subscription = supabase
        .channel(`room:${room.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'room_members', 
            filter: `room_id=eq.${room.id}` 
          },
          (payload) => {
            console.log("Realtime event received:", payload);
            fetchMembers(room.id);
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status:", status);
        });
    };
    
    const fetchMembers = async (roomId) => {
      console.log("Fetching members for room:", roomId);
      
      const { data, error } = await supabase
        .from('room_members')
        .select(`
          user_id,
          user_profile:user_id (username)
        `)
        .eq('room_id', roomId);
      
      console.log("Members result:", data, error);
      
      if (data) {
        setMembers(data);
      }
    };

    fetchRoom();
    
    // Clean up subscription when component unmounts
    return () => {
      if (subscription) {
        console.log("Unsubscribing from realtime");
        subscription.unsubscribe();
      }
    };
  }, [code]);

  const exitRoom = async () => {
    if (roomId && user) {
      await supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Room: {code}</Text>
      <Text style={styles.memberCount}>Members ({members.length}):</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => (
          <Text style={styles.memberText}>{item.user_profile?.username || 'Anonymous'}</Text>
        )}
        ListEmptyComponent={<Text style={styles.memberText}>No one joined yet</Text>}
      />
      <TouchableOpacity style={styles.exitButton} onPress={exitRoom}>
        <Text style={styles.exitText}>Exit Room</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoomScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    paddingTop: 80,
  },
  heading: {
    fontSize: 20,
    color: '#F5F5DC',
    marginBottom: 16,
    fontFamily: 'MuseoSansRounded-700',
  },
  memberCount: {
    fontSize: 16,
    color: '#F5F5DC',
    marginBottom: 12,
    fontFamily: 'MuseoSansRounded-600',
  },
  memberText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'MuseoSansRounded-500',
  },
  exitButton: {
    backgroundColor: '#222',
    padding: 16,
    marginTop: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  exitText: {
    color: '#F5F5DC',
    fontSize: 16,
    fontFamily: 'MuseoSansRounded-600',
  },
});