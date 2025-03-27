import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { s, vs, ms } from 'react-native-size-matters';
import Swiper from 'react-native-deck-swiper';

interface Place {
  id: string;
  name: string;
  image_url: string;
}

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase.from('places').select('id, name, image_url');

      if (error) {
        console.error('Error fetching places:', error.message);
      } else {
        console.log('Places:', data);
        setPlaces(data);
      }

      setLoading(false);
    };

    fetchPlaces();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {loading ? (
        <ActivityIndicator size="large" color="#5956E9" />
      ) : (
        <Swiper
          cards={places}
          renderCard={(place) => (
            <View style={styles.card}>
              <Image source={{ uri: place.image_url }} style={styles.image} />
              <Text style={styles.cardTitle}>{place.name}</Text>
            </View>
          )}
          onSwipedRight={(index) => console.log('Liked:', places[index]?.name)}
          onSwipedLeft={(index) => console.log('Disliked:', places[index]?.name)}
          verticalSwipe={false}
          animateCardOpacity={true}
          stackAnimationFriction={2}
          stackAnimationTension={60}
          horizontalThreshold={width/10}
          backgroundColor="transparent"
          stackSize={5}
          onTapCard={(index) => router.push(`/details/${places[index]?.id}` as `/details/[id]`)}
          overlayLabels={{
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: 'red',
                  color: 'white',
                  fontSize: ms(32),
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: vs(30),
                  marginLeft: -vs(30),
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: 'green',
                  color: 'white',
                  fontSize: ms(32),
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: vs(30),
                  marginLeft: vs(30),
                },
              },
            },
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: ms(22),
    fontWeight: 'bold',
    marginBottom: vs(10),
  },
  card: {
    width: width * 0.9,
    height: height * 0.65,
    backgroundColor: '#fff',
    borderRadius: ms(10),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    borderRadius: ms(10),
  },
  cardTitle: {
    fontSize: ms(20),
    fontWeight: 'bold',
    marginTop: vs(10),
  },
});

export default HomeScreen;
