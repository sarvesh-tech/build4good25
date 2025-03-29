import { useState, useEffect, useRef } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Animated
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Welcome() {
  const params = useLocalSearchParams();
  const userName = params.name as string || "Friend";
  
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for loading animation
  const [isLoading, setIsLoading] = useState(true);
  
  // Progress value (2 out of total questions)
  const progress = 0.2; // 20% for second question
  
  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(0.1)).current; // Start from previous progress
  
  // Animate progress bar on mount
  useEffect(() => {
    // Show loading for 1 second
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, 1000);
    
    return () => clearTimeout(loadingTimer);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  
  // Handle continue button press
  const handleContinue = () => {
    // Navigate to next question or dashboard
    // router.push("/next-question");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={require("../assets/images/logo.png")} 
          style={styles.loadingLogo} 
          resizeMode="contain"
        />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        {/* Top section with logo and progress bar */}
        <View style={styles.topSection}>
          {/* Logo at the top */}
          <Image 
            source={require("../assets/images/logo.png")} 
            style={styles.logo} 
            resizeMode="contain"
          />
          
          {/* Progress bar */}
          <View style={styles.progressOuterContainer}>
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })}
                ]} 
              />
            </View>
          </View>
        </View>
        
        {/* Center section with welcome message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>
            Welcome {userName}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Let's personalize ahead for you!
          </Text>
        </View>
        
        {/* Bottom section with continue button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  loadingLogo: {
    width: 100,
    height: 50,
    marginBottom: 20,
  },
  loadingText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 16,
    color: "#2C5E1A",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  topSection: {
    width: "100%",
    alignItems: "center",
    paddingTop: 40,
  },
  logo: {
    width: 80,
    height: 40,
    marginBottom: 30,
  },
  progressOuterContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  progressContainer: {
    width: "70%", // Narrower progress bar
    height: 8,
    backgroundColor: "#EEEEEE",
    borderRadius: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2C5E1A",
    borderRadius: 4,
  },
  welcomeContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // Center vertically
  },
  welcomeTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 22,
    color: "#8BC34A",
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: "#2C5E1A",
    textAlign: "center",
    lineHeight: 26,
  },
  bottomSection: {
    width: "100%",
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: "#2C5E1A",
    paddingVertical: 19,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  continueButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: "white",
  },
}); 