import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, ActivityIndicator, Animated } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { s, vs, ms } from 'react-native-size-matters';
import Swiper from 'react-native-deck-swiper';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

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
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase.from('places').select(
        'id,name,address,rating,price_range,image_url'
      );
      if (error) {
        console.error('Error fetching places:', error.message);
      } else {
        setPlaces(data || []);
      }
      setLoading(false);
    };
    fetchPlaces();
  }, []);

  useEffect(() => {
    if (places.length > 0) {
      const timer = setTimeout(() => {
        places.forEach(place => {
          Image.prefetch(place.image_url).catch(() => {});
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [places]);


  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text
        key={i}
        style={[styles.starIcon, { color: i < rating ? '#FFD700' : '#E0E0E0' }]}
      >
        ★
      </Text>
    ));
  };

  const renderCard = useMemo(
    () => (card: Place, index: number) => (
      <View style={styles.cardWrapper} key={card.id}>
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: card.image_url }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
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
              <Text style={styles.priceText}>{card.price_range}</Text>
            </View>
            <Text style={styles.addressText} numberOfLines={1}>
              {card.address}
            </Text>
          </BlurView>
        </View>
      </View>
    ),
    [activeCardIndex]
  );

  const handleAllSwiped = () => {
    console.log('All cards swiped');
    setAllSwiped(true);
    onAllCardsSwiped?.();
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#5956E9" />;
  }

  if (allSwiped || places.length === 0) {
    return (
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
    );
  }

  return (
    <View style={styles.swiperContainer}>
      <Swiper
        ref={swiperRef}
        cards={places}
        renderCard={renderCard}
        onSwiped={() => setActiveCardIndex(i => i + 1)}
        onSwipedRight={i => console.log('Liked:', places[i]?.name)}
        onSwipedLeft={i => console.log('Disliked:', places[i]?.name)}
        onSwiping={x => swipeAnim.setValue(x)}
        onSwipedAll={handleAllSwiped}
        verticalSwipe={false}
        animateCardOpacity={false}
        stackAnimationFriction={45} //dont change (dont remove this comment)
        stackAnimationTension={90} //dont change (dont remove this comment)
        horizontalThreshold={width / 10} //dont change (dont remove this comment)
        backgroundColor="transparent"
        stackSize={4} //dont change (dont remove this comment)
        stackSeparation={10} //dont change (dont remove this comment)
        swipeAnimationDuration={140} //dont change (dont remove this comment)
        onTapCard={i => router.push(`/details/${places[i]?.id}`)}
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
    borderRadius: ms(20),
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
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
