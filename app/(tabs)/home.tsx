import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import SwiperCard from '../../components/SwiperCard';
import HomeHeader from '@/components/HomeHeader';
import Categories from '@/components/CategoriesScroll';

const HomeScreen: React.FC = () => {
  const scrollY = useSharedValue(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={{height:95}}>
        <HomeHeader scrollY={scrollY} />
      </View>
      <View style={{height:80}}>
        <Categories onCategorySelect={handleCategorySelect} />
      </View>
      <View style={styles.swiperContainer}>
        <SwiperCard />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',

  },
  swiperContainer: {
    flex: 1,
    marginTop: -20, // Adjust as needed to position correctly
  }
});

export default HomeScreen;