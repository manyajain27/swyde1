import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { s, vs, ms } from 'react-native-size-matters';
import Swiper from 'react-native-deck-swiper';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface Place {
  id: string;
  name: string;
  image_url: string;
  address: string;
  rating: number;
  price_range: string;
}

const SwiperCard: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const router = useRouter();
  const swiperRef = useRef<Swiper<Place>>(null);
  const swipeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase.from('places').select(
        'id,name,address,rating,price_range,image_url'
      );
      if (error) {
        console.error('Error fetching places:', error.message);
      } else {
        setPlaces(data);
      }
      setLoading(false);
    };
    fetchPlaces();
  }, []);

  useEffect(() => {
    if (places.length > 0) {
      places.forEach(place => {
        Image.prefetch(place.image_url).catch(e => console.log('Prefetch error:', e));
      });
    }
  }, [places]);

  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Text 
        key={index} 
        style={[
          styles.starIcon, 
          { color: index < rating ? '#FFD700' : '#E0E0E0' }
        ]}
      >
        ★
      </Text>
    ));
  };

  const onSwiping = (x: number) => {
    setIsSwiping(true);
    swipeAnimation.setValue(x);
  };

  const onSwiped = () => {
    setIsSwiping(false);
    setActiveCardIndex(prev => prev + 1);
  };

  const leftColorOpacity = swipeAnimation.interpolate({
    inputRange: [-width/2, -width/4, 0],
    outputRange: [0.4, 0.2, 0],
    extrapolate: 'clamp'
  });

  const rightColorOpacity = swipeAnimation.interpolate({
    inputRange: [0, width/4, width/2],
    outputRange: [0, 0.2, 0.4],
    extrapolate: 'clamp'
  });

  const renderCard = (card: Place, index: number) => (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        {index === activeCardIndex && isSwiping && (
          <>
            <Animated.View 
              style={[
                styles.colorOverlay, 
                styles.redOverlay,
                { opacity: leftColorOpacity }
              ]}
            />
            <Animated.View 
              style={[
                styles.colorOverlay,
                styles.greenOverlay,
                { opacity: rightColorOpacity }
              ]}
            />
          </>
        )}
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: card.image_url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />
        </View>
        
        <BlurView intensity={50} style={styles.detailsContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {card.name}
          </Text>
          <View style={styles.cardDetailsRow}>
            <View style={styles.ratingContainer}>
              {renderRatingStars(card.rating)}
              <Text style={styles.ratingText}>({card.rating.toFixed(1)})</Text>
            </View>
            <Text style={styles.priceText}>
              {card.price_range}
            </Text>
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {card.address}
          </Text>
        </BlurView>
      </View>
    </View>
  );

  if (loading) {
    return (
        <ActivityIndicator size="large" color="#5956E9" />
      
    );
  }

  return (
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={places}
          renderCard={renderCard}
          onSwiped={onSwiped}
          onSwipedRight={(index) => console.log('Liked:', places[index]?.name)}
          onSwipedLeft={(index) => console.log('Disliked:', places[index]?.name)}
          onSwiping={onSwiping}
          verticalSwipe={false}
          animateCardOpacity={false}
          stackAnimationFriction={50}
          stackAnimationTension={100}
          horizontalThreshold={width/10}
          backgroundColor="transparent"
          stackSize={5}
          swipeAnimationDuration={150}
          onTapCard={(index) => router.push(`/details/${places[index]?.id}`)}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  
  swiperContainer: {
    flex: 1,
    width: '100%',
  },
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.82,
    height: height * 0.55,
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: vs(10),
    paddingHorizontal: s(15),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardTitle: {
    fontSize: Platform.select({
      ios: ms(22),
      android: ms(18)
    }),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: vs(5),
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(5),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: ms(16),
    marginRight: s(3),
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: ms(12),
    marginLeft: s(5),
  },
  priceText: {
    color: '#4CAF50',
    fontSize: ms(14),
    fontWeight: '600',
  },
  addressText: {
    color: '#FFFFFF',
    fontSize: ms(12),
    opacity: 0.8,
  },
  colorOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  redOverlay: {
    backgroundColor: 'rgba(255, 50, 50, 0.4)',
  },
  greenOverlay: {
    backgroundColor: 'rgba(50, 255, 50, 0.4)',
  },
});

export default SwiperCard;