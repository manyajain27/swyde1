import { useEffect, useRef, useState,  } from "react";
import { View, Text, Animated, Easing, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { router } from "expo-router";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import LottieView from "lottie-react-native";
import { StatusBar } from "expo-status-bar";

const GetStartedScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const lottieRef = useRef<LottieView>(null);

  // State for word animations
  const [wordIndex, setWordIndex] = useState(0);
  const wordFadeAnim = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;


  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }

    // Start fade-in and scale animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Animate words sequentially
    const wordAnimation = Animated.sequence([
      Animated.timing(wordFadeAnim[0], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: 300, // Delay after initial animations
      }),
      Animated.timing(wordFadeAnim[1], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: 300, // Delay between words
      }),
      Animated.timing(wordFadeAnim[2], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: 300, // Delay between words
      }),
    ]);

    wordAnimation.start();
  }, [fadeAnim, scaleAnim, wordFadeAnim]);

  const handleGetStarted = () => {
    router.push("/SignIn");
  };

  return (
    
      <SafeAreaView style={[
        styles.safeArea,
        Platform.OS === 'android' && styles.androidSafeArea
      ]}>
        <StatusBar translucent={true} style="dark" />
        <View style={styles.content}>
          {/* Animation Container */}
          <Animated.View
            style={[
              styles.animationContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Swyde</Text>
            <Text style={styles.title2}>Your Perfect Hangout App</Text>
            <LottieView
              ref={lottieRef}
              source={require("../../assets/getstartedAnimation.json")}
              style={[
                styles.animation,
                Platform.OS === 'android' && styles.androidAnimation
              ]}
              autoPlay
              loop
            />
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            {["Swipe.", "Decide.", "Hangout."].map((word, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.message,
                  Platform.OS === 'android' && styles.androidText,
                  {
                    opacity: wordFadeAnim[index],
                    transform: [
                      {
                        translateY: wordFadeAnim[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {word}
              </Animated.Text>
            ))}
          </View>
        </View>

        {/* Button Container */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
  );
}

export default GetStartedScreen;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "lightgray"
  },
  androidSafeArea: {
    paddingTop: "20@vs",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "20@s",
  },
  animationContainer: {
    width: "100%",
    height: "300@vs",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "30@vs",
  },
  animation: {
    width: "250@s",
    height: "250@s",
  },
  androidAnimation: {
    width: "230@s",
    height: "230@s",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: "30@vs",
  },
  title: {
    fontSize: "36@s",
    fontWeight: "bold",
    color: "black",
    marginBottom: "12@vs",
    textAlign: "center",
  },
  title2: {
    fontSize: "20@s",
    fontWeight: "bold",
    color: "black",
    marginBottom: "12@vs",
    textAlign: "center",
  },
  message: {
    fontSize: "20@s",
    fontWeight: "bold",
    color: "black",
    marginBottom: "12@vs",
    textAlign: "center",
  },
  androidText: {
    fontSize: "18@s",
  },
  buttonContainer: {
    paddingHorizontal: "24@s",
    paddingBottom: "40@vs",
  },
  button: {
    backgroundColor: "black",
    paddingVertical: "12@vs",
    borderRadius: "10@s",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: "16@s",
    fontWeight: "600",
  },
});