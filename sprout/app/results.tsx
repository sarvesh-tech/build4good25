import { useState, useEffect, useRef } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ScrollView,
  Dimensions
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Results() {
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
  
  // State for survey answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // State to control confetti
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Reference to confetti cannon
  const confettiRef = useRef(null);
  
  // Load answers from AsyncStorage
  useEffect(() => {
    const loadAnswers = async () => {
      try {
        const savedAnswers = await AsyncStorage.getItem('surveyAnswers');
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }
        
        // Show loading for 1.5 seconds
        setTimeout(() => {
          setIsLoading(false);
          // Show confetti after loading is complete
          setShowConfetti(true);
        }, 1500);
      } catch (error) {
        console.error('Error loading answers:', error);
        setIsLoading(false);
      }
    };
    
    loadAnswers();
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
    // Navigate to dashboard or home screen
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={require("../assets/images/logo.png")} 
          style={styles.loadingLogo} 
          resizeMode="contain"
        />
        <Text style={styles.loadingText}>Analyzing your responses...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        {/* Top section with logo */}
        <View style={styles.topSection}>
          {/* Logo at the top */}
          <Image 
            source={require("../assets/images/logo.png")} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        
        {/* Content section - centered in the middle */}
        <View style={styles.contentContainer}>
          <Image 
            source={require("../assets/images/head.png")} 
            style={styles.mascotImage} 
            resizeMode="contain"
          />
          
          <Text style={styles.thankYouTitle}>
            Yayy, you're all set {userName}!
          </Text>
          
          <Text style={styles.thankYouText}>
            I've learned a lot about you and will use this information to personalize your experience!
          </Text>
        </View>
        
        {/* Bottom section with continue button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Let's Begin!</Text>
          </TouchableOpacity>
        </View>
        
        {/* Confetti animation - positioned absolutely to be above all content */}
        {showConfetti && (
          <View style={styles.confettiContainer}>
            <ConfettiCannon
              ref={confettiRef}
              count={250}
              origin={{x: Dimensions.get('window').width / 2, y: -10}}
              autoStart={true}
              fadeOut={true}
              fallSpeed={3000}        // Slower fall speed for more vertical spread
              explosionSpeed={300}    // Slightly slower explosion for more control
              colors={[
                '#FF9AA2', // Pastel Red
                '#FFB7B2', // Pastel Salmon
                '#FFDAC1', // Pastel Orange
                '#E2F0CB', // Pastel Light Green
                '#B5EAD7', // Pastel Mint
                '#C7CEEA', // Pastel Blue
                '#9FB7E0', // Pastel Periwinkle
                '#D4A5A5', // Pastel Mauve
                '#F9C0C0', // Pastel Pink
                '#FFFFD8', // Pastel Yellow
                '#B0E0E6', // Powder Blue
                '#FDFD96', // Pastel Light Yellow
                '#FFABAB', // Light Pink
                '#D8BFD8', // Thistle
                '#AEC6CF', // Pastel Blue
                '#77DD77'  // Pastel Green
              ]}
            />
          </View>
        )}
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
  contentContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center", // This centers content vertically
    paddingBottom: 20,
  },
  mascotImage: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  thankYouTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 24,
    color: "#8BC34A",
    marginBottom: 20,
    textAlign: "center",
  },
  thankYouText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 18,
    color: "#2C5E1A",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  bottomSection: {
    width: "100%",
    paddingBottom: 40,
    paddingTop: 20,
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
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999, // Ensure it's above all other content
    pointerEvents: 'none', // Allow touches to pass through to elements below
  },
}); 