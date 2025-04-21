import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import SwiperCard from '../../components/SwiperCard';
import HomeHeader from '@/components/HomeHeader';
import Categories from '@/components/CategoriesScroll';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const scrollY = useSharedValue(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('foryou');

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId ?? 'foryou');
  }, []);

  const getCategoryColor = (categoryId: string | null) => {
    switch (categoryId) {
      case 'foryou': return '#7D55FF';
      case 'dining': return '#FF6B7A';
      case 'cafe': return '#FF9E3E';
      case 'bar': return '#A0E86F';
      case 'dessert': return '#FF7EB3';
      case 'events': return '#FFDE59';
      case 'movies': return '#59C1FF';
      default: return '#7D55FF'; // fallback
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Glowy Aura */}
      <LinearGradient
        colors={[getCategoryColor(selectedCategory), 'transparent']}
        style={styles.glow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={{ height: 95 }}>
        <HomeHeader scrollY={scrollY} />
      </View>

      {/* Categories */}
      <View style={{ height: 80 }}>
        <Categories onCategorySelect={handleCategorySelect} />
      </View>

      {/* Swiper */}
      <View style={styles.swiperContainer}>
        <SwiperCard />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
  },
  glow: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: -1,
    opacity: 0.5,
  },
  swiperContainer: {
    flex: 1,
    marginTop: -20,
  },
});

export default HomeScreen;
