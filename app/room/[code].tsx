import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

interface Member {
  id: string;
  user_id: string;
  is_ready: boolean;
  name: string;
  is_active: boolean;
  left_at?: string;
  user?: {
    name: string;
  };
}

interface Room {
  id: string;
  code: string;
  host_id: string;
  is_active: boolean;
  members: Member[];
  host_name: string;
  host?: {
    name: string;
  };
}

interface UserProfile {
  name: string;
}

interface SupabasePayload {
  new: any;
  old?: any;
}

const RoomScreen = () => {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useUserStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const channelRef = useRef<any>(null);

  const fetchUser = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profile')
      .select('name')
      .eq('id', userId)
      .single();
    return error ? null : data;
  }, []);

  const loadRoom = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          host:user_profile(name),
          members:room_members(
            *,
            user:user_profile(name)
          )
        `)
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        Alert.alert("Error", "Room not found or no longer active");
        router.back();
        return;
      }

      const processedRoom: Room = {
        ...data,
        host_name: data.host?.name || 'Host',
        members: data.members.map((member: Member) => ({
          ...member,
          name: member.user?.name || 'User'
        }))
      };

      setRoom(processedRoom);
    } catch (error) {
      console.error('Room load error:', error);
      Alert.alert("Error", "Failed to load room data");
      router.back();
    }
  }, [code]);

  const setupRealtime = useCallback((roomId: string) => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    
    const channel = supabase.channel(`room_${roomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: user?.id || 'anonymous' },
      }
    });
    
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'room_members',
      filter: `room_id=eq.${roomId}`
    }, async (payload: SupabasePayload) => {
      const userData = await fetchUser(payload.new.user_id);
      
      setRoom((current) => {
        if (!current) return null;
        
        const existingMember = current.members.find(m => m.id === payload.new.id);
        if (!existingMember && payload.new.user_id !== user?.id) {
          Alert.alert("New Member", `${userData?.name || 'User'} joined the room`);
          
          const newMember: Member = {
            ...payload.new,
            name: userData?.name || 'User'
          };
          
          return {
            ...current,
            members: [...current.members, newMember]
          };
        }
        return current;
      });
    });

    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'room_members',
      filter: `room_id=eq.${roomId}`
    }, (payload: SupabasePayload) => {
      setRoom(prev => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members.map(member => 
            member.id === payload.new.id ? { ...member, ...payload.new } : member
          )
        };
      });
    });

    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rooms',
      filter: `id=eq.${roomId}`
    }, (payload: SupabasePayload) => {
      if (payload.new.is_active === false && user?.id !== payload.new.host_id) {
        Alert.alert("Room Ended", "The host has ended the room");
        router.replace('/');
      }
    });

    channel.on('broadcast', { event: 'member_leaving' }, () => {
      loadRoom();
    });

    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        const heartbeatInterval = setInterval(() => {
          channel.send({
            type: 'broadcast',
            event: 'heartbeat',
            payload: { user: user?.id }
          });
        }, 30000);
        
        return () => clearInterval(heartbeatInterval);
      }
    });
    
    channelRef.current = channel;
  }, [user?.id, fetchUser, loadRoom]);

  useEffect(() => {
    loadRoom();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [loadRoom]);

  useEffect(() => {
    if (room?.id) {
      setupRealtime(room.id);
    }
  }, [room?.id, setupRealtime]);

  const handleLeave = useCallback(async () => {
    if (!room || !user || isLeaving) return;
    
    setIsLeaving(true);

    try {
      const { error: leaveError } = await supabase
        .from('room_members')
        .update({ 
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('room_id', room.id)
        .eq('user_id', user.id);

      if (leaveError) throw leaveError;

      if (room.host_id === user.id) {
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ is_active: false })
          .eq('id', room.id);

        if (roomError) throw roomError;
      }

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'member_leaving',
          payload: { 
            user_id: user.id,
            room_id: room.id
          }
        });
      }

      setTimeout(() => router.back(), 500);
    } catch (error) {
      console.error('Leave error:', error);
      Alert.alert("Error", "Failed to leave room");
      loadRoom();
      setIsLeaving(false);
    }
  }, [room, user, isLeaving, loadRoom]);

  if (!room) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading room...</Text>
      </View>
    );
  }

  const isHost = room.host_id === user?.id;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Room: {room.code}</Text>
      <Text style={styles.hostText}>Host: {room.host_name}</Text>

      <Text style={styles.membersHeading}>
        Members ({room.members.length}):
      </Text>

      <FlatList
        data={room.members}
        keyExtractor={(item: Member) => item.id}
        renderItem={({ item }: { item: Member }) => (
          <View style={[
            styles.memberRow,
            !item.is_active && styles.inactiveMember
          ]}>
            <Text style={styles.memberName}>
              {item.name}
              {item.user_id === user?.id && ' (You)'}
              {item.user_id === room.host_id && ' (Host)'}
              {item.is_ready && ' ✓'}
              {!item.is_active && item.left_at && ' (Left)'}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No members in room</Text>
        }
        contentContainerStyle={styles.membersList}
      />

      <TouchableOpacity
        style={[styles.leaveButton, isLeaving && styles.disabledButton]}
        onPress={handleLeave}
        disabled={isLeaving}
      >
        <Text style={styles.buttonText}>
          {isLeaving ? 'Leaving...' : 'Leave Room'}
        </Text>
      </TouchableOpacity>

      {isHost && (
        <TouchableOpacity
          style={[styles.endButton, isLeaving && styles.disabledButton]}
          onPress={handleLeave}
          disabled={isLeaving}
        >
          <Text style={styles.buttonText}>
            {isLeaving ? 'Ending...' : 'End Room'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    paddingTop: 60,
  },
  heading: {
    fontSize: 24,
    color: '#F5F5DC',
    marginBottom: 8,
    fontFamily: 'MuseoSansRounded-700',
  },
  hostText: {
    fontSize: 16,
    color: '#F5F5DC',
    opacity: 0.7,
    marginBottom: 32,
    fontFamily: 'MuseoSansRounded-500',
  },
  membersHeading: {
    fontSize: 18,
    color: '#F5F5DC',
    marginBottom: 16,
    fontFamily: 'MuseoSansRounded-600',
  },
  membersList: {
    flexGrow: 1,
  },
  memberRow: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  inactiveMember: {
    opacity: 0.6,
    backgroundColor: '#222',
  },
  memberName: {
    color: '#F5F5DC',
    fontSize: 16,
    fontFamily: 'MuseoSansRounded-500',
  },
  leaveButton: {
    backgroundColor: '#444',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  endButton: {
    backgroundColor: '#B22222',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#F5F5DC',
    fontSize: 16,
    fontFamily: 'MuseoSansRounded-600',
  },
  loadingText: {
    color: '#F5F5DC',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'MuseoSansRounded-500',
  },
  emptyText: {
    color: '#F5F5DC',
    opacity: 0.5,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'MuseoSansRounded-500',
  }
});

export default RoomScreen;