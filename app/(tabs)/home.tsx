import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { s, vs, ms } from 'react-native-size-matters';
import Swiper from 'react-native-deck-swiper';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface Place {
  id: string;
  name: string;
  image_url: string;
}

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const router = useRouter();
  const swiperRef = useRef<Swiper<Place>>(null);
  const swipeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase.from('places').select('id, name, image_url');
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {loading ? (
        <ActivityIndicator size="large" color="#5956E9" />
      ) : (
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={places}
            renderCard={(card, index) => (
              <View style={styles.cardWrapper}>
                <View style={styles.card}>
                  {/* Swiping Overlay */}
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
                  
                  {/* Image with Gradient Overlay */}
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
                  
                  {/* Blurred Title Container */}
                  <BlurView intensity={50} style={styles.titleContainer}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {card.name}
                    </Text>
                  </BlurView>
                </View>
              </View>
            )}
            onSwiped={onSwiped}
            onSwipedRight={(index) => console.log('Liked:', places[index]?.name)}
            onSwipedLeft={(index) => console.log('Disliked:', places[index]?.name)}
            onSwiping={onSwiping}
            verticalSwipe={false}
            animateCardOpacity={false}
            stackAnimationFriction={50} //DO NOT CHANGE
            stackAnimationTension={100} //DO NOT CHANGE
            horizontalThreshold={width/10} //DO NOT CHANGE
            backgroundColor="transparent"
            stackSize={5}
            swipeAnimationDuration={150} //DO NOT CHANGE
            onTapCard={(index) => router.push(`/details/${places[index]?.id}` as `/details/[id]`)}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  swiperContainer: {
    flex: 1,
    width: '100%',
  },
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.9,
    height: height * 0.65,
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
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
  titleContainer: {
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
    textAlign: 'center',
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

export default HomeScreen;