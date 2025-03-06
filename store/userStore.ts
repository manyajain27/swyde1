import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { Alert } from 'react-native';

interface UserState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut();
    router.dismissAll();
    Alert.alert('Sign Out', 'You have been successfully signed out');
    set({ user: null, session: null });
  },
}));

// Initialize the auth listener
export const initializeAuthListener = () => {
  const { setUser, setSession, setLoading } = useUserStore.getState();

  // Set up the auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
      
      useUserStore.setState({ initialized: true });
      
      console.log('Auth event:', event);
      console.log('Session:', session);
    }
  );

  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user || null);
    setLoading(false);
    useUserStore.setState({ initialized: true });
  });

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};