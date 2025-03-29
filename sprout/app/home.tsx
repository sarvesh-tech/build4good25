import { Text, View, Image, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions, Platform } from "react-native";
import { useFonts } from "expo-font";
import { useCallback, useState, useRef, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { Asset } from "expo-asset";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Define all images used in the app
const IMAGES = {
  logo: require("../assets/images/logo.png"),
  head: require("../assets/images/head.png"),
  googleIcon: require("../assets/images/google-icon.png"),
  appleIcon: require("../assets/images/apple-icon.png"),
};

// Preload and cache all images
const cacheImages = async () => {
  // Create an array of promises for each image
  const imageAssets = Object.values(IMAGES).map(image => {
    if (typeof image === 'number') {
      return Asset.fromModule(image).downloadAsync();
    }
  });

  // Wait for all images to be cached
  return Promise.all(imageAssets);
};

export default function Home() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for tracking if assets are loaded
  const [appIsReady, setAppIsReady] = useState(false);
  
  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Load all assets
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load and cache images
        await cacheImages();
      } catch (e) {
        console.warn('Error loading assets:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Handle modal animations
  useEffect(() => {
    if (modalVisible) {
      // Animate modal sliding up and overlay fading in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate modal sliding down and overlay fading out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && (fontsLoaded || fontError)) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded, fontError]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Logo at the top */}
      <Image 
        source={IMAGES.logo} 
        style={styles.logo} 
        resizeMode="contain"
      />
      
      {/* Multiple sprout heads */}
      <View style={styles.sproutsContainer}>
        <Image 
          source={IMAGES.head} 
          style={[styles.sproutHead, styles.sproutTop]} 
          resizeMode="contain"
        />
        <Image 
          source={IMAGES.head} 
          style={[styles.sproutHead, styles.sproutRight]} 
          resizeMode="contain"
        />
        <Image 
          source={IMAGES.head} 
          style={[styles.sproutHead, styles.sproutBottom]} 
          resizeMode="contain"
        />
      </View>
      
      {/* Buttons at the bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.primaryButtonText}>I'm new here</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>I'm already a member</Text>
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By clicking Register, you agree to our{"\n"}
          <Text style={styles.termsLink}>Terms</Text>, <Text style={styles.termsLink}>Data Policy</Text>
        </Text>
      </View>

      {/* Sign Up Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Dark overlay */}
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: overlayOpacity }
          ]}
          onTouchEnd={() => setModalVisible(false)}
        />
        
        {/* Modal content */}
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Up</Text>
            
            {/* Google Sign In Button */}
            <TouchableOpacity style={styles.googleButton}>
              <Image 
                source={IMAGES.googleIcon} 
                style={styles.authIcon} 
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            
            {/* Apple Sign In Button */}
            <TouchableOpacity 
              style={styles.appleButton}
              onPress={() => {
                // Implement Apple authentication here
                console.log("Apple authentication");
                setModalVisible(false);
              }}
            >
              <Image 
                source={IMAGES.appleIcon} 
                style={styles.authIcon} 
                resizeMode="contain"
              />
              <Text style={styles.appleButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
            
            {/* Email Sign Up Button */}
            <TouchableOpacity 
              style={styles.emailButton}
              onPress={() => {
                setModalVisible(false);
                // Navigate to questionnaire screen
                router.push("/questionnaire");
              }}
            >
              <Text style={styles.emailButtonText}>Continue as guest</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
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
  sproutsContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  sproutHead: {
    width: 120,
    height: 120,
    position: 'absolute',
  },
  sproutTop: {
    top: 20,
    left: 40,
  },
  sproutRight: {
    top: 120,
    right: 40,
  },
  sproutBottom: {
    top: 240,
    left: 100,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: "#2C5E1A",
    paddingVertical: 19,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  primaryButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: "white",
  },
  secondaryButton: {
    backgroundColor: "#4A8C3A",
    paddingVertical: 19,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: "white",
  },
  termsText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    textAlign: "center",
    color: "#555555",
    marginBottom: 20,
  },
  termsLink: {
    fontFamily: "PlusJakartaSans-SemiBold",
    color: "#2C5E1A",
  },
  // Modal styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContent: {
    width: '100%',
  },
  modalTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 20,
    color: "#2C5E1A",
    textAlign: "center",
    marginBottom: 30,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 15,
  },
  googleButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#333333",
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 15,
  },
  appleButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "white",
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#2C5E1A",
    borderRadius: 8,
    paddingVertical: 16,
  },
  emailButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "white",
  },
  authIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
}); 