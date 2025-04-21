import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

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
  const [imageLoading, setImageLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;

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

  const openWebsite = () => {
    if (place?.website_url) {
      Linking.openURL('https://' + place.website_url);
    }
  };

  const callPhone = () => {
    if (place?.contact_number) {
      Linking.openURL(`tel:${place.contact_number}`);
    }
  };

  const openMap = () => {
    if (place?.address) {
      const encodedAddress = encodeURIComponent(place.address);
      Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
    }
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FontAwesome key={i} name="star" size={16} color="#FFD700" style={styles.starIcon} />);
      } else if (i === fullStars && halfStar) {
        stars.push(<FontAwesome key={i} name="star-half-o" size={16} color="#FFD700" style={styles.starIcon} />);
      } else {
        stars.push(<FontAwesome key={i} name="star-o" size={16} color="#FFD700" style={styles.starIcon} />);
      }
    }

    return stars;
  };

  const renderPriceRange = (priceRange: string) => {
    const dollarSigns = [];
    const count = priceRange.split('$').length - 1;

    for (let i = 0; i < 4; i++) {
      dollarSigns.push(
        <Text key={i} style={{ color: i < count ? '#5956E9' : '#666', fontWeight: 'bold', marginRight: 2 }}>
          $
        </Text>
      );
    }

    return <View style={{ flexDirection: 'row' }}>{dollarSigns}</View>;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5956E9" />
        <Text style={styles.loadingText}>Loading place details...</Text>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF5252" />
        <Text style={styles.errorText}>Place not found</Text>
        <TouchableOpacity style={styles.backHomeButton} onPress={() => router.back()}>
          <Text style={styles.backHomeButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: place.image_url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            placeholder={{ color: '#2A2A2A' }}
            onLoadStart={() => setImageLoading(true)}
            onLoad={() => setImageLoading(false)}
          />
          {imageLoading && (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color="#5956E9" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(23, 23, 23, 0.8)', '#171717']}
            style={styles.imageGradient}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{place.name}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>{renderRatingStars(place.rating)}</View>
            <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
          </View>

          <View style={styles.priceContainer}>
            {renderPriceRange(place.price_range)}
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{place.description}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>Details</Text>

            <TouchableOpacity style={styles.contactItem} onPress={openMap}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(89, 86, 233, 0.15)' }]}>
                <Ionicons name="location" size={20} color="#5956E9" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactInfo}>{place.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5956E9" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={callPhone}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                <Ionicons name="call" size={20} color="#4CAF50" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactInfo}>{place.contact_number}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5956E9" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={openWebsite}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
                <Ionicons name="globe-outline" size={20} color="#FF9800" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactInfo} numberOfLines={1} ellipsizeMode="tail">
                  {place.website_url}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5956E9" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.directionsButton} onPress={openMap}>
            <Ionicons name="navigate" size={20} color="#FFF" />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 16,
  },
  backHomeButton: {
    backgroundColor: '#5956E9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 24,
  },
  backHomeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButton: {
    position: 'absolute',
    top: 46,
    left: 16,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(23, 23, 23, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F5F5DC',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  descriptionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5F5DC',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#AAA',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 24,
  },
  contactContainer: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 16,
    color: '#F5F5DC',
  },
  directionsButton: {
    backgroundColor: '#5956E9',
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  directionsButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PlaceDetailsScreen;