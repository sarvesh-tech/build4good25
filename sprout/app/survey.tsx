import { useState, useEffect, useRef } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Animated,
  ScrollView
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Define the questions and their options
const QUESTIONS = [
  {
    id: 1,
    question: "How are your stress levels these days?",
    options: [
      { id: "stress_1", text: "Smooth sailing", emoji: "😌" },
      { id: "stress_2", text: "Feeling stress daily", emoji: "😔" },
      { id: "stress_3", text: "Having a crisis right now", emoji: "😣" }
    ]
  },
  {
    id: 2,
    question: "What is your favorite way of learning new things?",
    options: [
      { id: "learning_1", text: "Reading articles and books", emoji: "📚" },
      { id: "learning_2", text: "Watching videos and tutorials", emoji: "🎬" },
      { id: "learning_3", text: "Hands-on practice", emoji: "🛠️" },
      { id: "learning_4", text: "Learning with others", emoji: "👥" }
    ]
  },
  {
    id: 3,
    question: "Which of these best describes you?",
    options: [
      { id: "personality_1", text: "Analytical and thoughtful", emoji: "🤔" },
      { id: "personality_2", text: "Creative and expressive", emoji: "🎨" },
      { id: "personality_3", text: "Practical and organized", emoji: "📋" },
      { id: "personality_4", text: "Social and outgoing", emoji: "🎉" }
    ]
  },
  {
    id: 4,
    question: "Do you tend to be critical of yourself?",
    options: [
      { id: "critical_1", text: "Almost never", emoji: "😌" },
      { id: "critical_2", text: "Sometimes", emoji: "🙂" },
      { id: "critical_3", text: "Often", emoji: "😕" },
      { id: "critical_4", text: "Almost always", emoji: "😩" }
    ]
  },
  {
    id: 5,
    question: "What area would you like to focus on improving?",
    options: [
      { id: "focus_1", text: "Career/performance", emoji: "💼" },
      { id: "focus_2", text: "Relationships", emoji: "❤️" },
      { id: "focus_3", text: "Mental wellbeing", emoji: "🧠" },
      { id: "focus_4", text: "Physical health", emoji: "💪" },
      { id: "focus_5", text: "Life balance", emoji: "⚖️" }
    ]
  }
];

export default function Survey() {
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
  
  // State for current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // State for selected answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Calculate progress based on current question
  const progress = (currentQuestionIndex + 1) / QUESTIONS.length;
  
  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(currentQuestionIndex / QUESTIONS.length)).current;
  
  // Animate progress bar when question changes
  useEffect(() => {
    // Show loading for 1 second on first load
    if (isLoading) {
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(loadingTimer);
    }
    
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, isLoading]);

  // Save answers to AsyncStorage when they change
  useEffect(() => {
    const saveAnswers = async () => {
      try {
        await AsyncStorage.setItem('surveyAnswers', JSON.stringify(answers));
      } catch (error) {
        console.error('Error saving answers:', error);
      }
    };
    
    if (Object.keys(answers).length > 0) {
      saveAnswers();
    }
  }, [answers]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  
  // Handle option selection
  const handleSelectOption = (questionId: number, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId.toString()]: optionId
    }));
  };
  
  // Handle continue button press
  const handleContinue = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      // Go to next question
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered, navigate to results
      router.push({
        pathname: "/results",
        params: { name: userName }
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

  const currentQuestion = QUESTIONS[currentQuestionIndex];

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
        
        {/* Question section */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.questionText}>
            {currentQuestion.question}
          </Text>
          
          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity 
                key={option.id}
                style={[
                  styles.optionButton,
                  answers[currentQuestion.id.toString()] === option.id && styles.optionButtonSelected
                ]}
                onPress={() => handleSelectOption(currentQuestion.id, option.id)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Bottom section with continue button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !answers[currentQuestion.id.toString()] && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!answers[currentQuestion.id.toString()]}
          >
            <Text style={styles.continueButtonText}>
              {currentQuestionIndex < QUESTIONS.length - 1 ? "Next" : "Finish"}
            </Text>
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
    width: "70%",
    height: 8,
    backgroundColor: "#EEEEEE",
    borderRadius: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2C5E1A",
    borderRadius: 4,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  questionText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 22,
    color: "#2C5E1A",
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionButtonSelected: {
    backgroundColor: "rgba(139, 195, 74, 0.1)",
    borderColor: "rgba(44, 94, 26, 0.5)",
    borderWidth: 2,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 16,
    color: "#333333",
    flex: 1,
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
  continueButtonDisabled: {
    backgroundColor: "#AAAAAA",
  },
  continueButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 17,
    color: "white",
  },
}); 