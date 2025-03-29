import { useState, useEffect, useRef } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ScrollView,
  Alert,
  Animated,
  Easing
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function MorningSession() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for current step
  const [currentStep, setCurrentStep] = useState(-1); // Start at -1 for mood selection
  const [selectedMood, setSelectedMood] = useState(null);
  
  // State for breathing exercise
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const breathAnimation = useRef(new Animated.Value(1)).current;
  const breathText = useRef(new Animated.Value(0)).current;
  const breathTextContent = useRef("Inhale");

  // Mood options
  const moods = [
    { id: 'great', emoji: '😊', label: 'Great' },
    { id: 'good', emoji: '🙂', label: 'Good' },
    { id: 'okay', emoji: '😐', label: 'Okay' },
    { id: 'meh', emoji: '😕', label: 'Meh' },
    { id: 'bad', emoji: '😔', label: 'Bad' },
  ];
  
  // Morning session steps
  const steps = [
    {
      title: "Take three deep breaths",
      description: "Inhale slowly through your nose for 4 seconds, hold for 4 seconds, then exhale through your mouth for 6 seconds.",
      image: require('../assets/images/head.png')
    },
    {
      title: "Set an intention",
      description: "What's one thing you want to focus on today? It could be staying calm, being present, or showing kindness.",
      image: require('../assets/images/head.png')
    },
    {
      title: "Express gratitude",
      description: "Think of one thing you're grateful for today, no matter how small it might seem.",
      image: require('../assets/images/head.png')
    }
  ];

  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Select mood and move to first step
  const selectMood = (mood) => {
    setSelectedMood(mood);
    setCurrentStep(0);
  };

  // Go to next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeSession();
    }
  };

  // Complete the session
  const completeSession = async () => {
    try {
      // Mark morning session as completed for today
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`morning_completed_${today}`, 'true');
      
      // Save mood for today
      if (selectedMood) {
        await AsyncStorage.setItem(`mood_${today}`, selectedMood.id);
      }
      
      // Update user points
      const pointsJson = await AsyncStorage.getItem('userPoints');
      const currentPoints = pointsJson ? parseInt(pointsJson) : 0;
      const newPoints = currentPoints + 3;
      await AsyncStorage.setItem('userPoints', newPoints.toString());
      
      // Add to check-ins
      const checkInsData = await AsyncStorage.getItem('checkIns');
      let checkIns = checkInsData ? JSON.parse(checkInsData) : [];
      if (!checkIns.includes(today)) {
        checkIns.push(today);
        await AsyncStorage.setItem('checkIns', JSON.stringify(checkIns));
      }
      
      // Show completion screen
      setEarnedPoints(3);
      setIsCompleted(true);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const startBreathingAnimation = () => {
    if (currentStep !== 0) return; // Only run animation on the breathing step
    
    setIsBreathing(true);
    setBreathCount(0); // Reset breath count when starting
    
    // Text animation sequence
    const textSequence = () => {
      breathTextContent.current = "Inhale";
      Animated.timing(breathText, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start(() => {
        setTimeout(() => {
          Animated.timing(breathText, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
          }).start(() => {
            breathTextContent.current = "Hold";
            Animated.timing(breathText, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true
            }).start(() => {
              setTimeout(() => {
                Animated.timing(breathText, {
                  toValue: 0,
                  duration: 500,
                  useNativeDriver: true
                }).start(() => {
                  breathTextContent.current = "Exhale";
                  Animated.timing(breathText, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                  }).start(() => {
                    setTimeout(() => {
                      Animated.timing(breathText, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true
                      }).start(() => {
                        // Increment breath count after a complete cycle
                        setBreathCount(prev => {
                          const newCount = prev + 1;
                          // If we've completed 3 breaths, stop the animation
                          if (newCount >= 3) {
                            setIsBreathing(false);
                            return 3;
                          }
                          // Continue with next breath cycle
                          if (isBreathing) {
                            textSequence();
                          }
                          return newCount;
                        });
                      });
                    }, 5000); // Exhale for 6 seconds
                  });
                });
              }, 1000); // Hold for 2 seconds
            });
          });
        }, 3000); // Inhale for 4 seconds
      });
    };

    // Circle animation sequence
    const breathSequence = () => {
      // Inhale - expand
      Animated.timing(breathAnimation, {
        toValue: 1.5,
        duration: 4000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start(() => {
        // Hold
        setTimeout(() => {
          // Exhale - contract
          Animated.timing(breathAnimation, {
            toValue: 1,
            duration: 6000,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true
          }).start(() => {
            const currentCount = breathCount;
            if (isBreathing && currentCount < 2) {
              breathSequence();
            }
          });
        }, 2000);
      });
    };

    textSequence();
    breathSequence();
  };

  useEffect(() => {
    if (currentStep === 0) {
      startBreathingAnimation();
    } else {
      setIsBreathing(false);
    }
    
    return () => {
      setIsBreathing(false);
    };
  }, [currentStep]);

  return (
    <View style={styles.rootContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C5E1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Morning Session</Text>
          <View style={styles.placeholder}></View>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onLayout={onLayoutRootView}
        >

          
          {/* Mood selection screen */}
          {currentStep === -1 && (
            <View style={styles.moodContainer}>
              <Text style={styles.moodTitle}>How are you feeling today?</Text>
              <Text style={styles.moodSubtitle}>Select your mood to start your morning session</Text>
              
              <View style={styles.moodOptions}>
                {moods.map((mood) => (
                  <TouchableOpacity 
                    key={mood.id}
                    style={[
                      styles.moodOption,
                      selectedMood?.id === mood.id && styles.moodOptionSelected
                    ]}
                    onPress={() => selectMood(mood)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.nextButton,
                  !selectedMood && styles.nextButtonDisabled,
                  styles.moodContinueButton
                ]}
                onPress={() => selectedMood && setCurrentStep(0)}
                disabled={!selectedMood}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Breathing exercise */}
          {currentStep === 0 ? (
            <View style={styles.breathingContainer}>
              <Animated.View 
                style={[
                  styles.breathCircle,
                  {
                    transform: [
                      { scale: breathAnimation }
                    ]
                  }
                ]}
              >
                <Image 
                  source={require('../assets/images/head.png')} 
                  style={styles.breathIcon}
                />
                <Animated.Text 
                  style={[
                    styles.breathText,
                    styles.breathTextTop,
                    {
                      opacity: breathText
                    }
                  ]}
                >
                  {breathTextContent.current}
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.breathText,
                    styles.breathTextBottom,
                    {
                      opacity: breathText
                    }
                  ]}
                >
                  {breathCount + 1}/3
                </Animated.Text>
              </Animated.View>
              <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
              <Text style={styles.stepDescription}>{steps[currentStep].description}</Text>
            </View>
          ) : currentStep > 0 && (
            <View style={styles.stepContainer}>
              <Image 
                source={steps[currentStep].image} 
                style={styles.stepImage} 
              />
              <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
              <Text style={styles.stepDescription}>{steps[currentStep].description}</Text>
            </View>
          )}
        </ScrollView>
        
        {currentStep >= 0 && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.nextButton,
                currentStep === 0 && breathCount < 3 && styles.nextButtonDisabled
              ]}
              onPress={nextStep}
              disabled={currentStep === 0 && breathCount < 3}
            >
              <Text style={styles.nextButtonText}>
                {currentStep < steps.length - 1 ? "Next" : "Complete"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
      
      {isCompleted && (
        <View style={styles.completionOverlay}>
          <View style={styles.completionCard}>
            <View style={styles.completionIconContainer}>
              <FontAwesome name="check-circle" size={80} color="#2C5E1A" />
            </View>
            <Text style={styles.completionTitle}>Session Complete!</Text>
            <Text style={styles.completionText}>
              Great job completing your morning session!
            </Text>
            <View style={styles.pointsContainer}>
              <FontAwesome name="circle" size={24} color="#FFC107" />
              <Text style={styles.pointsText}>+{earnedPoints} coins</Text>
            </View>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => router.back()}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 18,
    color: "#2C5E1A",
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },

  stepImage: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  stepTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 24,
    color: "#2C5E1A",
    textAlign: "center",
    marginBottom: 15,
    marginTop: 35,
  },
  stepDescription: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  nextButton: {
    backgroundColor: "#2C5E1A",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#AAAAAA",
  },
  nextButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "white",
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  breathCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#8BC34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 75,
  },
  breathIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  breathText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    color: '#2C5E1A',
    position: 'absolute',
  },
  breathTextTop: {
    top: 30,
  },
  breathTextBottom: {
    bottom: 30,
  },
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  completionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '80%',
    alignItems: 'center',
  },
  completionIconContainer: {
    marginBottom: 20,
  },
  completionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    color: '#2C5E1A',
    marginBottom: 10,
  },
  completionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 20,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  pointsText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginLeft: 10,
  },
  doneButton: {
    backgroundColor: '#2C5E1A',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
  },
  doneButtonText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  // Mood selection styles
  moodContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  moodTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    color: '#2C5E1A',
    textAlign: 'center',
    marginBottom: 10,
  },
  moodSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 30,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  moodOption: {
    alignItems: 'center',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    width: 100,
  },
  moodOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#8BC34A',
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  moodLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#333333',
  },
  moodContinueButton: {
    paddingHorizontal: 125,
    width: 'auto',
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  stepImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 30,
  },
}); 