import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

// TypeScript interfaces
interface Member {
  id: string;
  user_id: string;
  is_ready: boolean;
  name?: string;
}

interface Room {
  id: string;
  code: string;
  host_id: string;
  is_active: boolean;
  current_round: number;
  created_at: string;
  host_name?: string;
}

const RoomScreen = () => {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useUserStore();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Store the channel ref so we can unsubscribe on cleanup
  const channelRef = useRef<any>(null);
  
  useEffect(() => {
    // Find the room and set up realtime subscription
    const setupRoom = async () => {
      setLoading(true);
      
      try {
        // Get the room data
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', code)
          .eq('is_active', true)
          .single();
          
        if (roomError || !roomData) {
          console.error("Error finding room:", roomError);
          Alert.alert("Error", "Room not found or no longer active");
          router.back();
          return;
        }
        
        // Get the host username separately to avoid join issues
        const { data: hostData } = await supabase
          .from('user_profile')
          .select('name')
          .eq('id', roomData.host_id)
          .single();
          
        setRoom({
          ...roomData,
          host_name: hostData?.name || 'Unknown Host'
        });
        
        // Initial fetch of members
        await fetchMembers(roomData.id);
        
        // Set up realtime subscription
        setupRealtimeSubscription(roomData.id);
        
      } catch (error) {
        console.error("Exception setting up room:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    
    setupRoom();
    
    // Cleanup function
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [code, user?.id]);
  
  const fetchMembers = async (roomId: string) => {
    try {
      // First get all the members
      const { data: membersData, error: membersError } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId);
        
      if (membersError) {
        console.error("Error fetching members:", membersError);
        return;
      }
      
      if (!membersData.length) {
        setMembers([]);
        return;
      }
      
      // Then get usernames for each member
      const userIds = membersData.map(member => member.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('user_profile')
        .select('id, name')
        .in('id', userIds);
        
      if (usersError) {
        console.error("Error fetching usernames:", usersError);
        return;
      }
      
      // Combine the data
      const enrichedMembers = membersData.map(member => {
        const userData = usersData?.find(u => u.id === member.user_id);
        return {
          ...member,
          name: userData?.name || 'Unknown User'
        };
      });
      
      setMembers(enrichedMembers);
    } catch (error) {
      console.error("Exception fetching members:", error);
    }
  };
  
  const setupRealtimeSubscription = (roomId: string) => {
    // Subscribe to changes in room_members table for this room
    channelRef.current = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'room_members',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        console.log('Change received:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'INSERT') {
          // Someone joined
          const newMember = payload.new as Member;
          // Fetch full member data including username
          fetchMemberName(newMember)
            .then(enrichedMember => {
              if (enrichedMember) {
                setMembers(prev => [...prev, enrichedMember]);
                
                // Show alert for new member
                if (enrichedMember.user_id !== user?.id) {
                  Alert.alert("New Member", `${enrichedMember.name || 'Someone'} joined the room`);
                }
              }
            });
        }
        else if (payload.eventType === 'DELETE') {
          // Someone left
          const oldMember = payload.old as Member;
          setMembers(prev => {
            const leavingMember = prev.find(m => m.id === oldMember.id);
            
            // Show alert for member leaving
            if (leavingMember && leavingMember.user_id !== user?.id) {
              Alert.alert("Member Left", `${leavingMember.name || 'Someone'} left the room`);
            }
            
            return prev.filter(m => m.id !== oldMember.id);
          });
        }
        else if (payload.eventType === 'UPDATE') {
          // Member updated their status
          const updatedMember = payload.new as Member;
          setMembers(prev => prev.map(m => 
            m.id === updatedMember.id ? { ...m, ...updatedMember } : m
          ));
        }
      })
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
  };
  
  const fetchMemberName = async (member: Member) => {
    try {
      const { data: userData, error } = await supabase
        .from('user_profile')
        .select('name')
        .eq('id', member.user_id)
        .single();
        
      if (error || !userData) {
        console.error("Error fetching Name:", error);
        return { ...member, name: 'Unknown User' };
      }
      
      return { ...member, name: userData.name };
    } catch (error) {
      console.error("Exception fetching name:", error);
      return { ...member, name: 'Unknown User' };
    }
  };
  
  const leaveRoom = async () => {
    if (!room || !user) return;
    
    try {
      const { error } = await supabase
        .from('room_members')
        .delete()
        .eq('room_id', room.id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error leaving room:", error);
        Alert.alert("Error", "Failed to leave the room. Please try again.");
        return;
      }
      
      router.back();
    } catch (error) {
      console.error("Exception leaving room:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading room...</Text>
      </View>
    );
  }
  
  const isHost = room?.host_id === user?.id;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Room: {code}</Text>
      {room?.host_name && (
        <Text style={styles.hostText}>Host: {room.host_name}</Text>
      )}
      
      <Text style={styles.membersHeading}>Members ({members.length}):</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        style={styles.membersList}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Text style={styles.memberName}>
              {item.name}
              {item.user_id === user?.id ? ' (You)' : ''}
              {item.user_id === room?.host_id ? ' (Host)' : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No members found</Text>
        }
      />
      
      <TouchableOpacity 
        style={styles.leaveButton}
        onPress={leaveRoom}
      >
        <Text style={styles.buttonText}>Leave Room</Text>
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
    flex: 1,
  },
  memberRow: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
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