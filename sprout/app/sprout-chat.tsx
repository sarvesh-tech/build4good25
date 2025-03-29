import { useState, useEffect, useRef } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Animated,
  Easing,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert,
  ScrollView,
  Dimensions
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
// Uncomment after installing expo-speech
import * as Speech from 'expo-speech';
// Uncomment after installing expo-av
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { initializeApiKey, getApiKey } from '../utils/api-config';
import * as FileSystem from 'expo-file-system';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

const FloatingClouds = () => {
  // Create multiple cloud animations with different speeds and positions
  const clouds = [
    { id: 1, startX: -100, startY: height * 0.1, speed: 0.08, scale: 0.6 },
    { id: 2, startX: width, startY: height * 0.25, speed: 0.05, scale: 0.8 },
    { id: 3, startX: -150, startY: height * 0.4, speed: 0.07, scale: 0.5 },
    { id: 4, startX: width + 50, startY: height * 0.6, speed: 0.04, scale: 0.7 },
    { id: 5, startX: -80, startY: height * 0.75, speed: 0.06, scale: 0.4 },
  ];

  // Create animated values for each cloud
  const cloudAnimations = useRef(
    clouds.map(() => new Animated.Value(0))
  ).current;

  // Start the animations when component mounts
  useEffect(() => {
    // Animate each cloud
    clouds.forEach((cloud, index) => {
      // Calculate animation duration based on screen width and cloud speed
      const duration = (width + 200) / cloud.speed;
      
      // Create looping animation
      Animated.loop(
        Animated.timing(cloudAnimations[index], {
          toValue: 1,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    });
  }, []);

  return (
    <View style={styles.cloudsContainer}>
      {clouds.map((cloud, index) => {
        // Calculate the cloud's position based on animation value
        const translateX = cloudAnimations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [
            cloud.startX < 0 ? cloud.startX : width, 
            cloud.startX < 0 ? width : cloud.startX - width - 200
          ],
        });

        return (
          <Animated.Image
            key={cloud.id}
            source={require('../assets/images/cloud.png')}
            style={[
              styles.cloud,
              {
                transform: [
                  { translateX },
                  { translateY: cloud.startY },
                  { scale: cloud.scale }
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

export default function SproutChat() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for recording and chat
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(null);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  
  // Animation values
  const sproutAnimation = useRef(new Animated.Value(0)).current;
  const speechBubbleAnimation = useRef(new Animated.Value(1)).current;
  
  // API key - we'll store this securely
  const [apiKey, setApiKey] = useState(null);
  
  // Load API key from secure storage
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        // Initialize API key if not already set
        await initializeApiKey();
        
        // Get the API key
        const key = await getApiKey();
        if (key) {
          setApiKey(key);
        } else {
          Alert.alert("API Key Missing", "Please restart the app to initialize the API key.");
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };
    
    loadApiKey();
  }, []);

  // Animation for sprout head
  const animateSprout = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sproutAnimation, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(sproutAnimation, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  };
  
  // Stop sprout animation
  const stopSproutAnimation = () => {
    sproutAnimation.stopAnimation();
    Animated.timing(sproutAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  };
  
  // Animation for speech bubble
  useEffect(() => {
    if (showSpeechBubble) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(speechBubbleAnimation, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(speechBubbleAnimation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [showSpeechBubble]);

  // Start recording
  const startRecording = async () => {
    try {
      setIsRecording(true);
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need microphone permissions to make this work!');
        setIsRecording(false);
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      
      // Hide speech bubble when recording starts
      Animated.timing(speechBubbleAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => setShowSpeechBubble(false));
      
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording', error);
      setIsRecording(false);
    }
  };

  // Stop recording and process audio
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      if (!recording) {
        console.log('No recording to stop');
        setIsProcessing(false);
        return;
      }
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        await processAudio(uri);
      } else {
        setIsProcessing(false);
        alert('Failed to record audio.');
      }
      
    } catch (error) {
      console.error('Failed to stop recording', error);
      setIsProcessing(false);
    }
  };
  
  // Process audio with OpenAI
  const processAudio = async (audioUri) => {
    if (!apiKey) {
      alert('API key not found. Please set up your OpenAI API key.');
      setIsProcessing(false);
      return;
    }
    
    try {
      // Create form data with audio file
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });
      formData.append('model', 'whisper-1');
      
      // Transcribe audio
      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });
      
      if (!transcriptionResponse.ok) {
        throw new Error(`Transcription failed: ${transcriptionResponse.status}`);
      }
      
      const transcriptionData = await transcriptionResponse.json();
      const userMessage = transcriptionData.text;
      
      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      
      // Process with OpenAI
      await processWithOpenAI(userMessage);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Sorry, there was an error processing your audio.');
      setIsProcessing(false);
    }
  };
  
  // Process text with OpenAI
  const processWithOpenAI = async (userMessage) => {
    if (!apiKey) {
      alert('API key not found. Please set up your OpenAI API key.');
      setIsProcessing(false);
      return;
    }
    
    try {
      // Get response from OpenAI
      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are Sprout, a compassionate and empathetic AI therapist. Your responses should be warm, supportive, and helpful. Use therapeutic techniques like validation, reflective listening, and gentle guidance. Avoid giving medical advice or diagnosing conditions. Focus on emotional support and coping strategies. Keep responses concise (2-3 sentences) but meaningful. Your goal is to help the user feel heard, understood, and supported in a safe space. Do not sound so robotic and sound like a human and be playful at appropriate times. have some character and be happy when happy, and understand when the user is sad. be a good listener and a great pal. remember be funny and authentically human.'
            },
            ...messages.slice(-4), // Include recent context
            { role: 'user', content: userMessage }
          ],
          max_tokens: 150,
        }),
      });
      
      if (!chatResponse.ok) {
        throw new Error(`Chat completion failed: ${chatResponse.status}`);
      }
      
      const chatData = await chatResponse.json();
      const assistantMessage = chatData.choices[0].message.content;
      
      // Add assistant message to chat
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      
      // Speak the response
      speakResponse(assistantMessage);
      
    } catch (error) {
      console.error('Error processing with OpenAI:', error);
      alert('Sorry, there was an error getting a response.');
      setIsProcessing(false);
    }
  };
  
  // Speak the response using Eleven Labs
  const speakResponse = async (text) => {
    try {
      setIsSpeaking(true);
      
      // Animate Sprout while "speaking"
      animateSprout();
      
      // ElevenLabs API key
      const elevenLabsApiKey = "sk_dd7bb279550c84c85ed18f1da2ae7e2073065f0c89743cb6";
      // Voice ID for a youthful excited female voice (using Bella voice)
      const voiceId = "EXAVITQu4vr4xnSDxMaL"; // Bella voice
      
      // Call Eleven Labs API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5, // More expressive
            use_speaker_boost: true
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Eleven Labs API error: ${response.status}`);
      }
      
      // Get audio data as blob
      const audioBlob = await response.blob();
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          // Extract base64 data (remove data URL prefix)
          const base64Data = reader.result.split(',')[1];
          
          // Create a temporary file URI
          const fileUri = `${FileSystem.cacheDirectory}temp_audio.mp3`;
          
          // Write the base64 data to a file
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Play the audio file
          const { sound } = await Audio.Sound.createAsync(
            { uri: fileUri },
            { shouldPlay: true }
          );
          
          // When audio finishes playing
          sound.setOnPlaybackStatusUpdate(status => {
            if (status.didJustFinish) {
              setIsSpeaking(false);
              stopSproutAnimation();
              sound.unloadAsync();
            }
          });
        } catch (error) {
          console.error('Error playing audio:', error);
          setIsSpeaking(false);
          stopSproutAnimation();
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading audio blob:', error);
        setIsSpeaking(false);
        stopSproutAnimation();
        
        // Fallback to regular speech if Eleven Labs fails
        Speech.speak(text, {
          language: 'en',
          pitch: 1.1,
          rate: 0.9,
          onDone: () => {
            setIsSpeaking(false);
            stopSproutAnimation();
          }
        });
      };
      
    } catch (error) {
      console.error('Failed to speak with Eleven Labs:', error);
      
      // Fallback to regular speech if Eleven Labs fails
      try {
        await Speech.speak(text, {
          language: 'en',
          pitch: 1.1,
          rate: 0.9,
          onDone: () => {
            setIsSpeaking(false);
            stopSproutAnimation();
          }
        });
      } catch (speechError) {
        console.error('Speech fallback error:', speechError);
        setIsSpeaking(false);
        stopSproutAnimation();
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle tapping on Sprout
  const handleSproutTap = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing && !isSpeaking) {
      startRecording();
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.rootContainer} onLayout={onLayoutRootView}>
      <SafeAreaView style={styles.safeArea}>
        <FloatingClouds />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C5E1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat with Sprout</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.container}>
          {/* Speech bubble */}
          {showSpeechBubble && (
            <Animated.View 
              style={[
                styles.speechBubble,
                {
                  transform: [
                    { scale: speechBubbleAnimation }
                  ]
                }
              ]}
            >
              <Text style={styles.speechBubbleText}>Tap me to start talking!</Text>
            </Animated.View>
          )}
          
          {/* Sprout character */}
          <TouchableOpacity 
            style={styles.sproutContainer}
            onPress={handleSproutTap}
            disabled={isProcessing}
          >
            <Animated.Image 
              source={require('../assets/images/head.png')}
              style={[
                styles.sproutImage,
                {
                  transform: [
                    { translateY: sproutAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10]
                      }) 
                    }
                  ]
                }
              ]}
            />
          </TouchableOpacity>
          
          {/* Status indicators */}
          <View style={styles.statusContainer}>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <Text style={styles.statusText}>Listening...</Text>
                <View style={styles.recordingDot} />
              </View>
            )}
            
            {isProcessing && (
              <View style={styles.processingIndicator}>
                <Text style={styles.statusText}>Processing...</Text>
                <ActivityIndicator color="#2C5E1A" size="small" />
              </View>
            )}
            
            {isSpeaking && (
              <View style={styles.speakingIndicator}>
                <Text style={styles.statusText}>Speaking...</Text>
              </View>
            )}
          </View>
          
          {/* Conversation history */}
          {messages.length > 0 && (
            <View style={styles.conversationContainer}>
              <ScrollView 
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((message, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.messageItem, 
                      message.role === 'user' ? styles.userMessage : styles.assistantMessage
                    ]}
                  >
                    <Text style={styles.messageRole}>
                      {message.role === 'user' ? 'You' : 'Sprout'}
                    </Text>
                    <Text style={styles.messageText}>{message.content}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#AEE7FE", // Light sky blue background
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
    borderBottomColor: "#BBDEFB",
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
    alignItems: 'center',
    top: 40,
    padding: 20,
  },
  sproutContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  sproutImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  speechBubble: {
    position: 'absolute',
    top: '35%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    maxWidth: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  speechBubbleText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 16,
    color: "#333333",
    textAlign: 'center',
  },
  statusContainer: {
    position: 'absolute',
    bottom: '15%',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  speakingIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#2C5E1A",
    marginRight: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
  },
  conversationContainer: {
    position: 'absolute',
    top: 250,
    left: 20,
    right: 20,
    maxHeight: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  messagesList: {
    width: '100%',
  },
  messagesContent: {
    paddingVertical: 5,
  },
  messageItem: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '90%',
  },
  userMessage: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
  },
  messageRole: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: "#2C5E1A",
    marginBottom: 3,
  },
  messageText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  cloudsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  cloud: {
    position: 'absolute',
    width: 150,
    height: 100,
    resizeMode: 'contain',
    opacity: 0.7,
  },
}); 