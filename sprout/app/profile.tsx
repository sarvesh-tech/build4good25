import { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ScrollView,
  Dimensions,
  FlatList
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Get screen dimensions
const { width } = Dimensions.get('window');

export default function Profile() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for user data with more realistic initial values
  const [userData, setUserData] = useState({
    name: "Friend",
    checkIns: 0,
    streak: 0,
    lastCheckIn: null,
    insights: []
  });
  
  // State for mood data
  const [moodData, setMoodData] = useState({
    happy: 99,
    content: 87,
    neutral: 25,
    sad: 19,
    stressed: 7
  });
  
  // State for journal entries
  const [journalEntries, setJournalEntries] = useState([]);
  
  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load survey answers
        const savedAnswers = await AsyncStorage.getItem('surveyAnswers');
        
        // Load check-in data
        const checkInsData = await AsyncStorage.getItem('checkIns');
        let checkIns = [];
        let streak = 0;
        let lastCheckIn = null;
        
        if (checkInsData) {
          checkIns = JSON.parse(checkInsData);
          // Calculate streak based on consecutive daily check-ins
          streak = calculateStreak(checkIns);
          if (checkIns.length > 0) {
            lastCheckIn = new Date(checkIns[checkIns.length - 1]);
          }
        }
        
        if (savedAnswers) {
          const parsedAnswers = JSON.parse(savedAnswers);
          
          // Generate insights based on survey answers
          const insights = generateInsights(parsedAnswers);
          
          // Get user name if available
          const userName = await AsyncStorage.getItem('userName') || "Friend";
          
          // Update user data
          setUserData(prev => ({
            ...prev,
            name: userName,
            checkIns: checkIns.length,
            streak,
            lastCheckIn,
            insights
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);
  
  // Load journal entries from AsyncStorage
  useEffect(() => {
    const loadJournalEntries = async () => {
      try {
        const entriesJson = await AsyncStorage.getItem('journalEntries');
        if (entriesJson) {
          setJournalEntries(JSON.parse(entriesJson));
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
      }
    };
    
    loadJournalEntries();
  }, []);
  
  // Calculate streak based on check-in dates
  const calculateStreak = (checkIns) => {
    if (!checkIns || checkIns.length === 0) return 0;
    
    // Sort check-ins by date (newest first)
    const sortedDates = [...checkIns].sort((a, b) => new Date(b) - new Date(a));
    
    // Get today's date with time set to midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the most recent check-in was today or yesterday
    const latestCheckIn = new Date(sortedDates[0]);
    latestCheckIn.setHours(0, 0, 0, 0);
    
    // If the latest check-in wasn't today or yesterday, streak is broken
    if (latestCheckIn.getTime() !== today.getTime() && 
        latestCheckIn.getTime() !== yesterday.getTime()) {
      return 0;
    }
    
    // Count consecutive days
    let streak = 1;
    let currentDate = latestCheckIn;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const checkInDate = new Date(sortedDates[i]);
      checkInDate.setHours(0, 0, 0, 0);
      
      // Check if this check-in was the day before currentDate
      const expectedPrevDate = new Date(currentDate);
      expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
      
      if (checkInDate.getTime() === expectedPrevDate.getTime()) {
        streak++;
        currentDate = checkInDate;
      } else {
        // Break in the streak
        break;
      }
    }
    
    return streak;
  };

  // Function to perform a check-in
  const performCheckIn = async () => {
    try {
      // Get existing check-ins
      const checkInsData = await AsyncStorage.getItem('checkIns');
      let checkIns = checkInsData ? JSON.parse(checkInsData) : [];
      
      // Get today's date as string
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already checked in today
      if (!checkIns.includes(today)) {
        // Add today's check-in
        checkIns.push(today);
        
        // Save updated check-ins
        await AsyncStorage.setItem('checkIns', JSON.stringify(checkIns));
        
        // Calculate new streak
        const newStreak = calculateStreak(checkIns);
        
        // Update user data
        setUserData(prev => ({
          ...prev,
          checkIns: checkIns.length,
          streak: newStreak,
          lastCheckIn: new Date()
        }));
        
        // Show success message or animation
        console.log('Check-in successful!');
      } else {
        console.log('Already checked in today');
      }
    } catch (error) {
      console.error('Error performing check-in:', error);
    }
  };
  
  // Generate insights based on survey answers
  const generateInsights = (answers: any) => {
    // Create an array to store insights
    const insights = [];
    
    console.log("Survey answers:", answers); // Debug log to see the structure
    
    // Map survey question IDs to their responses
    if (answers) {
      // The survey stores answers as { "1": "stress_1", "2": "learning_2", etc. }
      // where the key is the question number and the value is the selected option ID
      
      // Stress levels (Question 1)
      if (answers["1"] === "stress_1") {
        insights.push({
          id: 'calm',
          title: 'Naturally Calm',
          description: 'You\'re handling stress well. People with low stress levels have 27% better immune function and sleep quality.',
          icon: 'smile',
          color: '#4CAF50'
        });
      } else if (answers["1"] === "stress_2") {
        insights.push({
          id: 'resilient',
          title: 'Building Resilience',
          description: 'You\'re managing daily stress. Regular mindfulness can reduce stress hormones by up to 23%.',
          icon: 'balance-scale',
          color: '#FF9800'
        });
      } else if (answers["1"] === "stress_3") {
        insights.push({
          id: 'support',
          title: 'Seeking Support',
          description: 'You\'re going through a challenging time. Reaching out for support can reduce perceived stress by 43%.',
          icon: 'hands-helping',
          color: '#2196F3'
        });
      }
      
      // Learning style (Question 2)
      if (answers["2"] === "learning_1") {
        insights.push({
          id: 'reader',
          title: 'Analytical Learner',
          description: 'You absorb information best through reading. This learning style is linked to 31% better retention of complex concepts.',
          icon: 'book',
          color: '#673AB7'
        });
      } else if (answers["2"] === "learning_2") {
        insights.push({
          id: 'visual',
          title: 'Visual Processor',
          description: 'You learn best through visual content. Visual learners process information 60% faster in certain contexts.',
          icon: 'eye',
          color: '#3F51B5'
        });
      }
      
      // Continue with the rest of the questions...
    }
    
    // If no insights were generated, add a default one
    if (insights.length === 0) {
      insights.push({
        id: 'growth',
        title: 'Growth Mindset',
        description: 'You\'re taking steps to understand yourself better. People with growth mindsets show 40% more progress in personal development.',
        icon: 'seedling',
        color: '#4CAF50'
      });
    }
    
    return insights;
  };
  
  // Generate recommendations based on insights and survey answers
  const getRecommendations = () => {
    const recommendations = [];
    
    // Get survey answers
    const surveyAnswers = userData.insights.map(insight => insight.id);
    
    // Stress-related recommendations
    if (surveyAnswers.includes('support') || surveyAnswers.includes('resilient')) {
      recommendations.push({
        id: 'stress',
        title: 'Stress Relief Techniques',
        description: 'Try 5-minute breathing exercises when feeling overwhelmed. Deep breathing can reduce cortisol levels by up to 20% in just a few minutes.',
        icon: 'wind',
        color: '#2196F3',
        action: 'Try Now'
      });
    }
    
    // Learning-related recommendations
    if (surveyAnswers.includes('reader')) {
      recommendations.push({
        id: 'reading',
        title: 'Curated Reading List',
        description: 'Based on your analytical learning style, we\'ve curated articles that can help deepen your understanding of key wellness concepts.',
        icon: 'book',
        color: '#673AB7',
        action: 'View List'
      });
    } else if (surveyAnswers.includes('visual')) {
      recommendations.push({
        id: 'visual',
        title: 'Visual Learning Resources',
        description: 'Explore our collection of infographics and video tutorials designed for visual learners like you.',
        icon: 'play-circle',
        color: '#3F51B5',
        action: 'Explore'
      });
    }
    
    // Personality-based recommendations
    if (surveyAnswers.includes('analytical')) {
      recommendations.push({
        id: 'journal',
        title: 'Analytical Journaling',
        description: 'Structured journaling can help analytical thinkers process emotions and increase self-awareness by up to 31%.',
        icon: 'pencil-alt',
        color: '#9C27B0',
        action: 'Start Now'
      });
    } else if (surveyAnswers.includes('creative')) {
      recommendations.push({
        id: 'creative',
        title: 'Creative Expression',
        description: 'Regular creative activities can reduce stress by 45% and improve problem-solving abilities for creative personalities.',
        icon: 'palette',
        color: '#E91E63',
        action: 'Explore Activities'
      });
    } else if (surveyAnswers.includes('social')) {
      recommendations.push({
        id: 'community',
        title: 'Community Challenges',
        description: 'Join our community challenges to connect with others. Social accountability increases habit formation success by 65%.',
        icon: 'users',
        color: '#FF9800',
        action: 'Join Now'
      });
    }
    
    // Default recommendations if none match
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'meditation',
        title: 'Morning Meditation',
        description: 'A 5-minute morning meditation could increase your focus by up to 22% throughout the day.',
        icon: 'leaf',
        color: '#4CAF50',
        action: 'Try Now'
      });
      
      recommendations.push({
        id: 'sleep',
        title: 'Sleep Schedule',
        description: 'Maintaining a consistent sleep schedule could improve your mood stability by 35% according to recent studies.',
        icon: 'moon',
        color: '#673AB7',
        action: 'Learn More'
      });
    }
    
    return recommendations;
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  
  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };
  
  // Render insight card
  const renderInsightCard = ({ item }: { item: any }) => (
    <View style={[styles.insightCard, { borderLeftColor: item.color }]}>
      <View style={styles.insightHeader}>
        <View style={[styles.insightIconContainer, { backgroundColor: item.color }]}>
          <FontAwesome5 name={item.icon} size={18} color="white" />
        </View>
        <Text style={styles.insightTitle}>{item.title}</Text>
      </View>
      <Text style={styles.insightDescription}>{item.description}</Text>
    </View>
  );
  
  // Render recommendation card
  const renderRecommendationCard = ({ item }: { item: any }) => (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <View style={[styles.insightIconContainer, { backgroundColor: item.color }]}>
          <FontAwesome5 name={item.icon} size={18} color="white" />
        </View>
        <Text style={styles.recommendationTitle}>{item.title}</Text>
      </View>
      <Text style={styles.recommendationText}>{item.description}</Text>
      <TouchableOpacity style={styles.recommendationButton}>
        <Text style={styles.recommendationButtonText}>{item.action}</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render journal entry
  const renderJournalEntry = ({ item }) => (
    <TouchableOpacity style={styles.journalCard}>
      <View style={styles.journalHeader}>
        <Text style={styles.journalDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.journalPrompt}>{item.prompt}</Text>
      <Text style={styles.journalText} numberOfLines={3}>{item.text}</Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container} onLayout={onLayoutRootView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.headerLeft}>
              <Ionicons name="arrow-back" size={24} color="#2C5E1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Profile</Text>
            <View style={styles.headerRight} />
          </View>
          
          {/* Profile Stats */}
          <View style={styles.profileStats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userData.checkIns}</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userData.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userData.insights.length}</Text>
              <Text style={styles.statLabel}>Insights</Text>
            </View>
          </View>
          
          {/* Mood Tracking */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Mood Tracking</Text>
            <View style={styles.emotionContainer}>
              <View style={styles.emotionRow}>
                <Text style={styles.emotionLabel}>Happy</Text>
                <View style={styles.emotionBarContainer}>
                  <View 
                    style={[
                      styles.emotionBar, 
                      { width: `${moodData.happy}%`, backgroundColor: "#8BC34A" }
                    ]} 
                  />
                </View>
                <Text style={styles.emotionEmoji}>😊</Text>
              </View>
              
              <View style={styles.emotionRow}>
                <Text style={styles.emotionLabel}>Content</Text>
                <View style={styles.emotionBarContainer}>
                  <View 
                    style={[
                      styles.emotionBar, 
                      { width: `${moodData.content}%`, backgroundColor: "#FFC107" }
                    ]} 
                  />
                </View>
                <Text style={styles.emotionEmoji}>🙂</Text>
              </View>
              
              <View style={styles.emotionRow}>
                <Text style={styles.emotionLabel}>Neutral</Text>
                <View style={styles.emotionBarContainer}>
                  <View 
                    style={[
                      styles.emotionBar, 
                      { width: `${moodData.neutral}%`, backgroundColor: "#9E9E9E" }
                    ]} 
                  />
                </View>
                <Text style={styles.emotionEmoji}>😐</Text>
              </View>
              
              <View style={styles.emotionRow}>
                <Text style={styles.emotionLabel}>Sad</Text>
                <View style={styles.emotionBarContainer}>
                  <View 
                    style={[
                      styles.emotionBar, 
                      { width: `${moodData.sad}%`, backgroundColor: "#FF9800" }
                    ]} 
                  />
                </View>
                <Text style={styles.emotionEmoji}>😔</Text>
              </View>
              
              <View style={styles.emotionRow}>
                <Text style={styles.emotionLabel}>Stressed</Text>
                <View style={styles.emotionBarContainer}>
                  <View 
                    style={[
                      styles.emotionBar, 
                      { width: `${moodData.stressed}%`, backgroundColor: "#9C27B0" }
                    ]} 
                  />
                </View>
                <Text style={styles.emotionEmoji}>😫</Text>
              </View>
            </View>
            
            <Text style={styles.emotionInsight}>
              You've been reflecting on positive experiences often this month. Keep it up!
            </Text>
          </View>
          
          {/* Personal Insights */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            <FlatList
              data={userData.insights}
              renderItem={renderInsightCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
          
          {/* Recommendations */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recommendations For You</Text>
            <FlatList
              data={getRecommendations()}
              renderItem={renderRecommendationCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
          
          {/* Journal Entries */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Journal Entries</Text>
            {journalEntries.length > 0 ? (
              <FlatList
                data={journalEntries}
                renderItem={renderJournalEntry}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                style={styles.journalList}
                ListFooterComponent={
                  <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => router.push("/journal-history")}
                  >
                    <Text style={styles.viewAllText}>View All Entries</Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              <View style={styles.emptyJournalContainer}>
                <Text style={styles.emptyJournalText}>
                  You haven't created any journal entries yet.
                </Text>
                <TouchableOpacity 
                  style={styles.startJournalButton}
                  onPress={() => router.push("/journal-session")}
                >
                  <Text style={styles.startJournalButtonText}>Start Journaling</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerLeft: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 18,
    color: "#2C5E1A",
  },
  headerRight: {
    width: 34, // Same width as back button for centering
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "white",
    marginBottom: 15,
  },
  statCard: {
    alignItems: "center",
  },
  statNumber: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 28,
    color: "#2C5E1A",
  },
  statLabel: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#666666",
    marginTop: 5,
  },
  sectionContainer: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 18,
    color: "#2C5E1A",
    marginBottom: 15,
  },
  emotionContainer: {
    marginBottom: 15,
  },
  emotionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  emotionLabel: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#666666",
    width: 70,
  },
  emotionBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "#EEEEEE",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  emotionBar: {
    height: "100%",
    borderRadius: 5,
  },
  emotionEmoji: {
    fontSize: 16,
    width: 20,
    textAlign: "center",
  },
  emotionInsight: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#2C5E1A",
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  insightCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  insightTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 16,
    color: "#2C5E1A",
  },
  insightDescription: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  recommendationTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 18,
    color: "#2C5E1A",
    marginLeft: 10,
  },
  recommendationText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: "#666666",
    marginBottom: 15,
    lineHeight: 20,
  },
  recommendationButton: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  recommendationButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: "#2C5E1A",
  },
  bottomPadding: {
    height: 30,
  },
  journalList: {
    marginTop: 10,
  },
  journalCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  journalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  journalDate: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#8BC34A",
  },
  journalPrompt: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#2C5E1A",
    marginBottom: 8,
  },
  journalText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
  },
  emptyJournalContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyJournalText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
    marginBottom: 15,
  },
  startJournalButton: {
    backgroundColor: "#2C5E1A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startJournalButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "white",
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  viewAllText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#2C5E1A",
  },
}); 