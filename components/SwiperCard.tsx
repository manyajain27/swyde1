import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { s, vs, ms } from 'react-native-size-matters';
import Swiper from 'react-native-deck-swiper';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import throttle from 'lodash.throttle';

const { width, height } = Dimensions.get('window');

interface Place {
  id: string;
  name: string;
  image_url: string;
  address: string;
  rating: number;
  price_range: string;
}

interface SwiperCardProps {
  onAllCardsSwiped?: () => void;
}

const SwiperCard: React.FC<SwiperCardProps> = ({ onAllCardsSwiped }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [allSwiped, setAllSwiped] = useState(false);
  const router = useRouter();
  const swiperRef = useRef<Swiper<Place>>(null);
  const animationRef = useRef<LottieView>(null);

  const swipeAnim = useRef(new Animated.Value(0)).current;
  const leftGlowOpacity = useRef(new Animated.Value(0)).current;
  const rightGlowOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayColor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const { data, error } = await supabase
          .from('places')
          .select('id,name,address,rating,price_range,image_url')

        if (error) throw error;
        setPlaces(data || []);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  useEffect(() => {
    if (places.length > 0) {
      const prefetchImages = async () => {
        await Promise.all(
          places.slice(0, 4).map((place) =>
            Image.prefetch(place.image_url).catch(() => {})
          )
        );
      };
      const timer = setTimeout(prefetchImages, 200);
      return () => clearTimeout(timer);
    }
  }, [places]);

  const updateSwipeEffects = useCallback(
    throttle((value: number) => {
      const threshold = width * 0.02;
      const maxValue = width * 0.8;

      if (value < -threshold) {
        const opacity = Math.min(Math.abs(value + threshold) / maxValue, 1);
        leftGlowOpacity.setValue(opacity);
        rightGlowOpacity.setValue(0);
        overlayOpacity.setValue(opacity);
        overlayColor.setValue(-1);
      } else if (value > threshold) {
        const opacity = Math.min((value - threshold) / maxValue, 1);
        rightGlowOpacity.setValue(opacity);
        leftGlowOpacity.setValue(0);
        overlayOpacity.setValue(opacity);
        overlayColor.setValue(1);
      } else {
        leftGlowOpacity.setValue(0);
        rightGlowOpacity.setValue(0);
        overlayOpacity.setValue(0);
        overlayColor.setValue(0);
      }
    }, 16),
    []
  );

  useEffect(() => {
    const listenerId = swipeAnim.addListener(({ value }) => {
      updateSwipeEffects(value);
    });
    return () => swipeAnim.removeListener(listenerId);
  }, [updateSwipeEffects]);

  const resetAnimations = useCallback(() => {
    swipeAnim.setValue(0);
    leftGlowOpacity.setValue(0);
    rightGlowOpacity.setValue(0);
    overlayOpacity.setValue(0);
    overlayColor.setValue(0);
  }, []);

  const renderRatingStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text
        key={`star-${i}`}
        style={[styles.starIcon, { color: i < rating ? '#FFD700' : '#E0E0E0' }]}
      >
        ★
      </Text>
    ));
  }, []);

  const handleAllSwiped = useCallback(() => {
    setAllSwiped(true);
    onAllCardsSwiped?.();
  }, [onAllCardsSwiped]);

  const EmptyState = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <LottieView
          ref={animationRef}
          autoPlay
          loop
          style={styles.lottieAnimation}
          source={require('@/assets/emptyAnimation.json')}
        />
        <Text style={styles.emptyText}>No more places to swipe!</Text>
        <Text style={styles.emptySubText}>Check back later for new places</Text>
      </View>
    ),
    []
  );

  const renderCard = useCallback((card: Place, index: number) => {
    const isActive = index === activeCardIndex;
  
    const interpolatedOverlayColor = overlayColor.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['rgba(255,0,0,0.4)', 'transparent', 'rgba(0,255,0,0.4)'],
      extrapolate: 'clamp',
    });
  
    return (
      <View style={styles.cardWrapper} key={`card-${card.id}`}>
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: card.image_url }}
              style={styles.image}
              contentFit="cover"
              transition={300}
              placeholder={require('@/assets/images/placeholder.png')}
              recyclingKey={`img-${card.id}`}
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.2)']}
              style={styles.imageGradient}
            />
  
            {/* Card overlay shown only for active card */}
            {isActive && (
              <Animated.View
                style={[
                  styles.overlay,
                  {
                    backgroundColor: interpolatedOverlayColor,
                    opacity: overlayOpacity,
                  },
                ]}
              />
            )}
          </View>
  
          <BlurView intensity={30} style={styles.detailsContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {card.name}
            </Text>
            <View style={styles.cardDetailsRow}>
              <View style={styles.ratingContainer}>
                {renderRatingStars(card.rating)}
                <Text style={styles.ratingText}>({card.rating.toFixed(1)})</Text>
              </View>
              <Text style={styles.priceText}>{card.price_range}</Text>
            </View>
            <Text style={styles.addressText} numberOfLines={1}>
              {card.address}
            </Text>
          </BlurView>
        </View>
      </View>
    );
  }, [activeCardIndex, overlayColor, overlayOpacity, renderRatingStars]);
  

  if (loading) {
    return <ActivityIndicator size="large" color="#5956E9" style={styles.loader} />;
  }

  if (allSwiped || places.length === 0) {
    return EmptyState;
  }

  return (
    <View style={styles.swiperContainer}>
      {/* Overlay & Glows */}
      <Animated.View
        style={[
          styles.sideGlow,
          styles.leftGlow,
          { opacity: leftGlowOpacity },
        ]}
      />
      <Animated.View
        style={[
          styles.sideGlow,
          styles.rightGlow,
          { opacity: rightGlowOpacity },
        ]}
      />

      {/* Swiper */}
      <Swiper
        ref={swiperRef}
        cards={places}
        renderCard={renderCard}
        onSwiped={(i) => {
          setActiveCardIndex(i + 1);
          resetAnimations();
        }}
        onSwipedRight={(i) => console.log('Liked:', places[i]?.name)}
        onSwipedLeft={(i) => console.log('Disliked:', places[i]?.name)}
        onSwiping={(x) => swipeAnim.setValue(x)}
        onSwipedAborted={resetAnimations}
        onSwipedAll={handleAllSwiped}
        verticalSwipe={false}
        animateCardOpacity={false}
        stackAnimationFriction={45} //DO NOT CHANGE (dont remove this comment)
        stackAnimationTension={90} //DO NOT CHANGE (dont remove this comment)
        horizontalThreshold={width / 10} //DO NOT CHANGE (dont remove this comment)
        backgroundColor="transparent"
        stackSize={4} //DO NOT CHANGE (dont remove this comment)
        stackSeparation={10} //DO NOT CHANGE (dont remove this comment)
        swipeAnimationDuration={140} //DO NOT CHANGE (dont remove this comment)
        onTapCard={(i) => router.push(`/details/${places[i]?.id}`)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  swiperContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.82,
    height: height * 0.55,
    borderRadius: ms(20),
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  sideGlow: {
    position: 'absolute',
    top: height * 0.1,
    width: width * 0.3,
    height: height * 0.6,
    zIndex: 5,
    borderRadius: ms(20),
  },
  leftGlow: {
    left: 0,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 25,
  },
  rightGlow: {
    right: 0,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 25,
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: vs(10),
    paddingHorizontal: s(15),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardTitle: {
    fontSize: Platform.select({ ios: ms(22), android: ms(18) }),
    fontWeight: '700',
    color: '#fff',
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
    opacity: 0.85,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  emptyText: {
    fontSize: ms(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: vs(10),
  },
  emptySubText: {
    fontSize: ms(16),
    color: '#AAAAAA',
    textAlign: 'center',
  },
  lottieAnimation: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: vs(20),
  },
});

export default SwiperCard;
