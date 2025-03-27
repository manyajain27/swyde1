import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  image_url: string;
  rating: number;
  price_range: string;
  contact_number: string;
  website_url: string;
}

const PlaceDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching place details:', error.message);
      } else {
        setPlace(data);
      }

      setLoading(false);
    };

    fetchPlaceDetails();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#5956E9" />
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Place not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#5956E9" />
      </TouchableOpacity> */}

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: place.image_url }} style={styles.image} />

        <Text style={styles.title}>{place.name}</Text>
        <Text style={styles.description}>{place.description}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>📍 Address:</Text>
          <Text style={styles.info}>{place.address}</Text>

          <Text style={styles.label}>⭐ Rating:</Text>
          <Text style={styles.info}>{place.rating}/5</Text>

          <Text style={styles.label}>💰 Price Range:</Text>
          <Text style={styles.info}>{place.price_range}</Text>

          <Text style={styles.label}>📞 Contact:</Text>
          <Text style={styles.info}>{place.contact_number}</Text>

          <Text style={styles.label}>🔗 Website:</Text>
          <Text style={styles.info}>{place.website_url}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    margin: 16,
  },
  content: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  info: {
    fontSize: 16,
    color: '#444',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PlaceDetailsScreen;
