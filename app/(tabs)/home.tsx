import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import SwiperCard from '../../components/SwiperCard';
import HomeHeader from '@/components/HomeHeader';

const HomeScreen: React.FC = () => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader scrollY={scrollY} />
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
    paddingTop: 10, // Add some spacing between header and cards
    marginTop: -70
  }
});

export default HomeScreen;