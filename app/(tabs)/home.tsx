import React from 'react';
import SwiperCard from '../../components/SwiperCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView className='flex-1 bg-black'>
      <SwiperCard />
    </SafeAreaView>
  );
};

export default HomeScreen;