import { Text, View, Image, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { useFonts } from "expo-font";
import { useCallback, useRef, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // Create animated value for rotation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Set up the animation
  useEffect(() => {
    const startWavingAnimation = () => {
      // Reset the animation value
      rotateAnim.setValue(0);
      
      // Create the animation sequence
      Animated.loop(
        Animated.sequence([
          // Rotate right
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          // Rotate left
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 } // Loop infinitely
      ).start();
    };

    startWavingAnimation();
    
    // Clean up animation when component unmounts
    return () => {
      rotateAnim.stopAnimation();
    };
  }, []);

  // Create the interpolated rotation value
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '10deg'], // Adjust these values for more or less rotation
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Logo at the top */}
      <Image 
        source={require("../assets/images/logo.png")} 
        style={styles.logo} 
        resizeMode="contain"
      />
      
      {/* Mascot with head and arm */}
      <View style={styles.mascotContainer}>
        {/* Arm positioned behind head with animation */}
        <Animated.Image 
          source={require("../assets/images/arm.png")} 
          style={[
            styles.arm,
            {
              transform: [
                { rotate },
                // Set the origin of rotation to be the "shoulder" area
                { translateX: -30 },
                { translateY: -30 },
              ]
            }
          ]} 
          resizeMode="contain"
        />
        {/* Head on top */}
        <Image 
          source={require("../assets/images/head.png")} 
          style={styles.head} 
          resizeMode="contain"
        />
      </View>
      
      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>
          Hello there! I'm <Text style={styles.highlight}>sprout</Text>
        </Text>
        <Text style={styles.message}>
          I'm always here to talk to you and it's your job to help me grow. Got it?
        </Text>
      </View>
      
      {/* Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push("/home")}
      >
        <Text style={styles.buttonText}>Yes, of course!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  logo: {
    width: 80,
    height: 40,
    marginTop: 25,
  },
  mascotContainer: {
    position: "relative",
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  head: {
    width: 180,
    height: 180,
    position: "absolute",
    zIndex: 1,
  },
  arm: {
    width: 80,
    height: 80,
    position: "absolute",
    right: 115,
    top: 70,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  greeting: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 24,
    textAlign: "center",
    color: "#2C5E1A",
    marginBottom: 10,
  },
  highlight: {
    color: "#8BC34A",
  },
  message: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 18,
    textAlign: "center",
    color: "#2C5E1A",
    lineHeight: 26,
    marginTop: 15,
  },
  button: {
    backgroundColor: "#2C5E1A",
    paddingVertical: 19,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  buttonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: "white",
  },
});
