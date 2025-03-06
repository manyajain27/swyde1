import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import LottieView from "lottie-react-native";
import { ScaledSheet } from "react-native-size-matters";

interface LoadingOverlayProps {
  visible: boolean;
  mainText?: string;
  subText?: string;
}

export default function LoadingOverlay({ visible, mainText = "Hang in there...", subText="" }: LoadingOverlayProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible && animationRef.current) {
      animationRef.current.play();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.loadingBox}>
          <LottieView
            ref={animationRef}
            source={require("../assets/fistbumpLoadingAnimation.json")}
            style={styles.animation}
            autoPlay
            loop
            speed={2}
          />
          {subText && <Text style={styles.subLoadingText}>{subText}</Text>}
          {mainText && <Text style={styles.mainLoadingText}>{mainText}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: "220@s",
    height: "220@s",
  },
  subLoadingText: {
    color: "beige",
    fontSize: "16@s",
    fontWeight: "300",
    marginBottom: "10@s",

  },
  mainLoadingText: {
    color: "beige",
    fontSize: "20@s",
    fontWeight: "600",

  },
});