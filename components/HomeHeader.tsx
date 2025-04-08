// HomeHeader.tsx
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { Ionicons, FontAwesome, AntDesign } from "@expo/vector-icons";
import * as Location from "expo-location";
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  Extrapolate,
  withSpring 
} from "react-native-reanimated";
import { router } from "expo-router";

const HomeHeader = ({ scrollY }: { scrollY: Animated.SharedValue<number> }) => {
  const [nameLocation, setNameLocation] = useState<string | null>(null);
  const [districtLocation, setDistrictLocation] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setNameLocation("Permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(location.coords);
      const { latitude: lat, longitude: long } = location.coords;
      setLatitude(lat);
      setLongitude(long);
      console.log(lat, long);
      console.log(address);
      setNameLocation(address[0]?.name || address[0]?.city || "Unknown location");
      setDistrictLocation(address[0]?.district || address[0]?.city || "Unknown location");

    })();
  }, []);

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 100],
        [180, 120],
        Extrapolate.CLAMP
      ),
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0.98],
        Extrapolate.CLAMP
      ),
    };
  });

 

  const titleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [0, 100],
            [1, 0.9],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, headerStyle]}>
      <View style={styles.topRow}>
        <Animated.Text style={[styles.title, titleStyle]}>
          Swyde
        </Animated.Text>
        <TouchableOpacity 
        style={styles.exploreButton} 
        onPress={() => router.push("/(tabs)/explore")}
         >
          <FontAwesome name="search" size={24} color="#F5F5DC" />
        </TouchableOpacity>
      </View>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={24} color="#F5F5DC" />
        <View style={styles.locationTextContainer}>
          <View>
            <Pressable 
            style={styles.locationSubRow} 
            onPress={() => router.push("/location/LocationScreen")}>
                <Text style={styles.locationMainText}>
                    {nameLocation || "Locating..."}
                </Text>
                <AntDesign name="down" size={14} color="#F5F5DC" />
            </Pressable>
          </View>
          <Text style={styles.locationSubText}>
            {districtLocation}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000000",
    // paddingTop: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  title: {
    fontSize: 32,
    color: "#F5F5DC",
    letterSpacing: -1,
    fontFamily: "MuseoSans-Bold",
  },
  exploreButton: {
    padding: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingTop: 4,
  },
    locationSubRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
  locationTextContainer: {
    marginLeft: 5,
    flex: 1,
  },
  locationMainText: {
    fontSize: 16,
    color:"#F5F5DC", //color complementary to beige 
    fontFamily: "MuseoSans-Medium",
  },
  locationSubText: {
    fontSize: 13,
    color: "#F5F5DC",
    marginTop: 2,
    fontFamily: "MuseoSans-Regular",
  }
});

export default HomeHeader;