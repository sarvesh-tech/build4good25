import { useState, useEffect, useRef } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function JournalSession() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for journal entry
  const [journalEntry, setJournalEntry] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  
  // Journal prompts
  const prompts = [
    "What are three things you're grateful for today?",
    "What's something that challenged you today and how did you handle it?",
    "What's one small win you had today?",
    "How are you feeling right now, and why might you be feeling this way?",
    "What's something you're looking forward to?",
    "What's one thing you could do tomorrow to take care of yourself?",
    "What's a recent interaction that made you feel good?",
    "What's something you learned recently?",
    "What's a goal you're working toward right now?",
    "What made you smile today?"
  ];

  // Select a random prompt on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setPrompt(prompts[randomIndex]);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Toggle speech recognition
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // In a real app, you would stop the speech recognition here
      // For this mock, we'll just simulate adding some text
      setJournalEntry(prev => prev + " (Voice recording stopped)");
    } else {
      // Start recording
      setIsRecording(true);
      // In a real app, you would start speech recognition here
      // For this mock, we'll just simulate
      setJournalEntry(prev => prev + " (Voice recording started...)");
    }
  };

  // Save journal entry
  const saveJournalEntry = async () => {
    if (journalEntry.trim() === "") {
      Alert.alert("Empty Journal", "Please write something before saving.");
      return;
    }

    try {
      // Dismiss keyboard
      Keyboard.dismiss();
      
      // Get existing journal entries
      const existingEntriesJson = await AsyncStorage.getItem('journalEntries');
      let entries = existingEntriesJson ? JSON.parse(existingEntriesJson) : [];
      
      // Add new entry with timestamp
      const newEntry = {
        id: Date.now().toString(),
        text: journalEntry,
        prompt: prompt,
        date: new Date().toISOString(),
      };
      
      entries.unshift(newEntry); // Add to beginning of array
      
      // Save updated entries
      await AsyncStorage.setItem('journalEntries', JSON.stringify(entries));
      
      // Mark journal activity as completed for today
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`journal_completed_${today}`, 'true');
      
      // Update user points
      const pointsJson = await AsyncStorage.getItem('userPoints');
      const currentPoints = pointsJson ? parseInt(pointsJson) : 0;
      const newPoints = currentPoints + 5;
      await AsyncStorage.setItem('userPoints', newPoints.toString());
      
      // Show completion screen instead of alert
      setEarnedPoints(5);
      setIsCompleted(true);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert("Error", "There was a problem saving your journal entry.");
    }
  };

  return (
    <View style={styles.rootContainer} onLayout={onLayoutRootView}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C5E1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal Entry</Text>
          <View style={styles.placeholder} />
        </View>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.promptContainer}>
              <Text style={styles.promptLabel}>Today's Prompt:</Text>
              <Text style={styles.promptText}>{prompt}</Text>
            </View>
            
            <View style={styles.journalContainer}>
              <TextInput
                style={styles.journalInput}
                multiline
                placeholder="Start writing your thoughts here..."
                value={journalEntry}
                onChangeText={setJournalEntry}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.micButton}
              onPress={toggleRecording}
            >
              <FontAwesome 
                name={isRecording ? "stop-circle" : "microphone"} 
                size={24} 
                color={isRecording ? "#FF5252" : "#2C5E1A"} 
              />
              <Text style={[
                styles.micButtonText,
                isRecording && styles.recordingText
              ]}>
                {isRecording ? "Stop" : "Voice"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveJournalEntry}
            >
              <Text style={styles.saveButtonText}>Save Journal</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {isCompleted && (
        <View style={styles.completionOverlay}>
          <View style={styles.completionCard}>
            <View style={styles.completionIconContainer}>
              <FontAwesome name="check-circle" size={80} color="#2C5E1A" />
            </View>
            <Text style={styles.completionTitle}>Journal Complete!</Text>
            <Text style={styles.completionText}>
              Great job completing your journal entry for today!
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
    width: 34, // Same width as back button for centering
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  promptContainer: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  promptLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#2C5E1A",
    marginBottom: 5,
  },
  promptText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
  },
  journalContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
    minHeight: 300,
  },
  journalInput: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
    minHeight: 280,
  },
  footer: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  micButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  micButtonText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 16,
    color: "#2C5E1A",
    marginLeft: 8,
  },
  recordingText: {
    color: "#FF5252",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2C5E1A",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "white",
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
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  doneButtonText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: 'white',
  },
}); 