import { useState, useEffect, useRef } from "react";
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Animated, 
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Questionnaire() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for name input
  const [name, setName] = useState("");
  
  // State for loading animation
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track keyboard visibility
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Progress value (1 out of total questions)
  const progress = 0.1; // 10% for first question
  
  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Animate progress bar on mount and handle keyboard events
  useEffect(() => {
    // Show loading for 1.5 seconds
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, 1500);
    
    // Set up keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );
    
    return () => {
      clearTimeout(loadingTimer);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
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
    if (name.trim()) {
      // Store name in global state or async storage
      // For a simple implementation, we'll pass it as a parameter
      router.push({
        pathname: "/welcome",
        params: { name: name.trim() }
      });
    }
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
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        onLayout={onLayoutRootView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
          
          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>What's your name?</Text>
            
            {/* Name input */}
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
          
          {/* Continue button */}
          <View style={[
            styles.buttonContainer,
            { marginBottom: keyboardVisible ? 20 : 40 }
          ]}>
            <TouchableOpacity 
              style={[
                styles.continueButton,
                // Disable button if name is empty
                !name.trim() && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={!name.trim()}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: "white",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 40,
    marginBottom: 30,
  },
  progressOuterContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 60,
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
  questionContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
  },
  questionText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 22,
    color: "#2C5E1A",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 19,
    paddingHorizontal: 20,
    fontSize: 17,
    fontFamily: "PlusJakartaSans-Regular",
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
  },
  continueButton: {
    backgroundColor: "#2C5E1A",
    paddingVertical: 19,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#AAAAAA",
  },
  continueButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: "white",
  },
}); 