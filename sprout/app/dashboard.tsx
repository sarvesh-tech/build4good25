import { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  StatusBar
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Days of the week
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Dashboard() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for selected date
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Generate dates for the date picker
  const dates = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 3 + i); // Show 3 days before and 3 days after today
    return date;
  });

  // Activities data
  const [activities, setActivities] = useState([
    {
      id: '1',
      title: 'Start off your day with a morning session',
      duration: '1 min',
      coins: 3,
      image: require('../assets/images/morning.png'),
      completed: false,
      route: '/morning-session'
    },
    {
      id: '2',
      title: "Let's journal a lil' bit to start the day",
      duration: '3   min',
      coins: 5,
      image: require('../assets/images/notebook.png'),
      completed: false,
      route: '/journal-session'
    }
  ]);

  // Add this state for user points
  const [userPoints, setUserPoints] = useState(0);

  // Add this useEffect to load completion status from AsyncStorage
  useFocusEffect(
    useCallback(() => {
      const loadCompletionStatus = async () => {
        try {
          // Get today's date as string for the key
          const today = new Date().toISOString().split('T')[0];
          
          // Check if morning session is completed today
          const morningCompleted = await AsyncStorage.getItem(`morning_completed_${today}`);
          
          // Check if journal is completed today
          const journalCompleted = await AsyncStorage.getItem(`journal_completed_${today}`);
          
          // Update activities with completion status
          setActivities(prev => prev.map(activity => {
            if (activity.id === '1') {
              return { ...activity, completed: morningCompleted === 'true' };
            } else if (activity.id === '2') {
              return { ...activity, completed: journalCompleted === 'true' };
            }
            return activity;
          }));
          
          // Also update user points
          const pointsJson = await AsyncStorage.getItem('userPoints');
          if (pointsJson) {
            setUserPoints(parseInt(pointsJson));
          }
        } catch (error) {
          console.error('Error loading completion status:', error);
        }
      };
      
      loadCompletionStatus();
    }, [])
  );

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Handle profile button press
  const handleProfilePress = () => {
    router.push("/profile");
  };

  // Render date item
  const renderDateItem = ({ item }) => {
    const day = DAYS[item.getDay()];
    const date = item.getDate();
    const isSelected = selectedDate.getDate() === date && 
                       selectedDate.getMonth() === item.getMonth() &&
                       selectedDate.getFullYear() === item.getFullYear();
    
    return (
      <TouchableOpacity 
        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[styles.dateDay, isSelected && styles.selectedDateText]}>{day}</Text>
        <Text style={[styles.dateNumber, isSelected && styles.selectedDateText]}>{date}</Text>
      </TouchableOpacity>
    );
  };

  // Render activity item
  const renderActivityItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.activityCard}
      onPress={() => router.push(item.route)}
    >
      <View style={styles.activityContent}>
        <View style={styles.activityLeft}>
          {item.completed && (
            <View style={styles.completedCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
          {!item.completed && <View style={styles.incompleteCircle} />}
          
          <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <View style={styles.activityMeta}>
              <View style={styles.coinContainer}>
                <FontAwesome name="circle" size={16} color="#FFC107" style={styles.coinIcon} />
                <Text style={styles.coinText}>+{item.coins}</Text>
              </View>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color="#888888" style={styles.durationIcon} />
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            </View>
          </View>
        </View>
        <Image source={item.image} style={styles.activityImage} />
      </View>
    </TouchableOpacity>
  );

  // Current route is dashboard/home
  const currentRoute = "home";

  return (
    <View style={styles.rootContainer}>
      {/* Sun image positioned at the absolute top right */}
      <Image 
        source={require("../assets/images/sun.png")} 
        style={styles.sunImage} 
        resizeMode="contain"
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container} onLayout={onLayoutRootView}>
            {/* Decorative elements (behind header) */}
            <Image 
              source={require("../assets/images/cloud.png")} 
              style={styles.cloudLeft} 
              resizeMode="contain"
            />
            <Image 
              source={require("../assets/images/cloud.png")} 
              style={styles.cloudRight} 
              resizeMode="contain"
            />
            
            {/* Header with profile and points */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
                <View style={styles.profileIconContainer}>
                  <Text style={styles.profileDot}>•</Text>
                  <Ionicons name="person-circle-outline" size={35} color="#2C5E1A" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.pointsContainer}>
                <View style={styles.pointsBadge}>
                  <FontAwesome name="circle" size={16} color="#FFC107" style={styles.pointsIcon} />
                  <Text style={styles.pointsText}>{userPoints}</Text>
                </View>
              </View>
            </View>
            
            {/* Greeting section */}
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>Good Morning!</Text>
            </View>
            
            {/* Date selector */}
            <View style={styles.dateSelector}>
              <FlatList
                data={dates}
                renderItem={renderDateItem}
                keyExtractor={(item) => item.toISOString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateList}
              />
            </View>
            
            {/* Activities */}
            <View style={styles.activitiesContainer}>
              <FlatList
                data={activities}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.activitiesList}
              />
            </View>
            
            {/* Featured Collections */}
            <View style={styles.featuredContainer}>
              <Text style={styles.featuredTitle}>Featured Collections</Text>
              <Image 
                source={require("../assets/images/head.png")} 
                style={styles.featuredImage} 
                resizeMode="cover"
              />
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <FontAwesome5 
              name="home" 
              size={24} 
              color={currentRoute === "home" ? "#8BC34A" : "#2C5E1A"} 
            />
            <Text 
              style={[
                styles.navText, 
                currentRoute === "home" && styles.navTextActive
              ]}
            >
              home
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/sprout-chat")}>
            <MaterialCommunityIcons 
              name="sprout" 
              size={24} 
              color={currentRoute === "sprout-chat-chat" ? "#8BC34A" : "#2C5E1A"} 
            />
            <Text 
              style={[
                styles.navText, 
                currentRoute === "sprout" && styles.navTextActive
              ]}
            >
              sprout
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/shop")}>
            <Feather 
              name="shopping-bag" 
              size={24} 
              color={currentRoute === "shop" ? "#8BC34A" : "#2C5E1A"} 
            />
            <Text 
              style={[
                styles.navText, 
                currentRoute === "shop" && styles.navTextActive
              ]}
            >
              shop
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/explore")}>
            <Ionicons 
              name="cloud-outline" 
              size={24} 
              color={currentRoute === "explore" ? "#8BC34A" : "#2C5E1A"} 
            />
            <Text 
              style={[
                styles.navText, 
                currentRoute === "explore" && styles.navTextActive
              ]}
            >
              explore
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    backgroundColor: "white",
    position: "relative",
    zIndex: 2, // Ensure SafeAreaView is above the sun
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 10,
    zIndex: 20, // Higher z-index to ensure it's above the sun
  },
  profileButton: {
    padding: 5,
    zIndex: 20, // Ensure profile button is above sun
  },
  profileIconContainer: {
    position: "relative",
    zIndex: 20, // Ensure profile icon container is above sun
  },
  profileDot: {
    position: "absolute",
    top: -5,
    right: -5,
    color: "#8BC34A",
    fontSize: 24,
    zIndex: 21, // Ensure profile dot is above profile icon
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20, // Higher z-index to ensure it's above the sun
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    zIndex: 20, // Ensure points badge is above sun
    elevation: 5, // Add elevation for Android
  },
  pointsIcon: {
    marginRight: 5,
    zIndex: 20, // Ensure points icon is above sun
  },
  pointsText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    color: "#2C5E1A",
    fontSize: 16,
    zIndex: 20, // Ensure points text is above sun
  },
  greetingSection: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  greetingText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 28,
    color: "black",
    textAlign: "center",
    zIndex: 1,
  },
  cloudLeft: {
    position: "absolute",
    left: -10,
    top: 70,
    width: 70,
    height: 70,
    opacity: 0.8,
    zIndex: 1, // Lower zIndex to be behind header
  },
  cloudRight: {
    position: "absolute",
    right: 10,
    top: 120,
    width: 60,
    height: 40,
    opacity: 0.8,
    zIndex: 1, // Lower zIndex to be behind header
  },
  sunImage: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 150,
    height: 150,
    zIndex: 1, // Lower z-index to be behind header elements
  },
  dateSelector: {
    marginBottom: 20,
  },
  dateList: {
    paddingHorizontal: 0,
    justifyContent: "center", // Center the dates horizontally
    minWidth: "100%", // Ensure the container takes full width
  },
  dateItem: {
    width: 50,
    height: 70,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    backgroundColor: "white",
  },
  selectedDateItem: {
    backgroundColor: "#2C5E1A",
    borderWidth: 1,
    borderColor: "#2C5E1A",
  },
  dateDay: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 12,
    color: "#2C5E1A",
  },
  dateNumber: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 18,
    color: "#2C5E1A",
    marginTop: 5,
  },
  selectedDateText: {
    color: "white",
  },
  activitiesContainer: {
    marginBottom: 20,
  },
  activitiesList: {
    paddingHorizontal: 0, // Remove horizontal padding to align with container
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  activityContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  completedCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#8BC34A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  incompleteCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginRight: 15,
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#2C5E1A",
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    zIndex: 10,
  },
  coinIcon: {
    marginRight: 5,
  },
  coinText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#FFC107",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationIcon: {
    marginRight: 5,
  },
  durationText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#888888",
  },
  activityImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  featuredContainer: {
    paddingHorizontal: 0, // Remove horizontal padding to align with container
    marginBottom: 20,
  },
  featuredTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 22,
    color: "black",
    marginBottom: 15,
  },
  featuredImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    backgroundColor: "#E8F5E9",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingVertical: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  navText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#2C5E1A",
    marginTop: 5,
  },
  navTextActive: {
    color: "#8BC34A",
  }
}); 