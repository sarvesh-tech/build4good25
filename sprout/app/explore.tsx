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
  Modal
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Get screen dimensions
const { width } = Dimensions.get('window');

export default function Explore() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // State for event modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Event categories
  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'workshop', name: 'Workshops' },
    { id: 'meetup', name: 'Meetups' },
    { id: 'webinar', name: 'Webinars' },
    { id: 'retreat', name: 'Retreats' }
  ];

  // Events data
  const events = [
    {
      id: '1',
      title: 'Mindfulness Meditation Workshop',
      description: 'Learn practical mindfulness techniques to reduce stress and improve focus in your daily life.',
      longDescription: 'Join expert meditation teacher Sarah Johnson for a 2-hour workshop where you\'ll learn evidence-based mindfulness practices that can be integrated into your busy schedule. Studies show that just 10 minutes of daily mindfulness practice can reduce stress by 30% and improve focus by 14%. This workshop is perfect for beginners and those looking to deepen their practice.',
      date: 'May 15, 2023',
      time: '6:00 PM - 8:00 PM',
      location: 'Community Wellness Center',
      image: require('../assets/images/head.png'),
      category: 'workshop',
      host: 'Sarah Johnson, Certified Meditation Instructor',
      price: 'Free',
      spots: '15 spots left'
    },
    {
      id: '2',
      title: 'Mental Health Support Group',
      description: 'A safe space to share experiences and connect with others on their mental health journey.',
      longDescription: 'This monthly support group provides a judgment-free environment where participants can share their experiences with anxiety, depression, and other mental health challenges. Facilitated by licensed therapist Michael Chen, the group focuses on peer support, coping strategies, and building resilience. Research shows that social connection is a key factor in mental health recovery.',
      date: 'May 20, 2023',
      time: '7:00 PM - 8:30 PM',
      location: 'Online via Zoom',
      image: require('../assets/images/head.png'),
      category: 'meetup',
      host: 'Michael Chen, LMFT',
      price: 'Free',
      spots: '8 spots left'
    },
    {
      id: '3',
      title: 'Sleep Science & Healthy Habits Webinar',
      description: 'Discover the latest research on sleep and learn practical strategies for better rest.',
      longDescription: 'Sleep expert Dr. Amara Patel will share cutting-edge research on how sleep affects mental health, cognitive function, and overall wellbeing. Learn about the science of sleep cycles, the impact of blue light, and evidence-based techniques to improve your sleep quality. Participants will receive a digital sleep journal and a 7-day sleep improvement plan.',
      date: 'May 25, 2023',
      time: '12:00 PM - 1:00 PM',
      location: 'Online via Zoom',
      image: require('../assets/images/head.png'),
      category: 'webinar',
      host: 'Dr. Amara Patel, Sleep Researcher',
      price: '$5 (Scholarship available)',
      spots: '50 spots left'
    },
    {
      id: '4',
      title: 'Weekend Wellness Retreat',
      description: 'A two-day immersive experience focused on mindfulness, movement, and nature connection.',
      longDescription: 'Escape the city for a rejuvenating weekend in nature. This all-inclusive retreat features guided meditation sessions, gentle yoga, forest bathing, nutritious meals, and workshops on stress management. Located at the serene Pinewood Retreat Center, accommodations include private or shared cabins. All experience levels welcome.',
      date: 'June 3-4, 2023',
      time: 'Starts 9:00 AM Saturday',
      location: 'Pinewood Retreat Center',
      image: require('../assets/images/head.png'),
      category: 'retreat',
      host: 'Wellness Collective',
      price: '$250 (Includes meals & accommodation)',
      spots: '5 spots left'
    },
    {
      id: '5',
      title: 'Anxiety Management Techniques',
      description: 'Learn practical tools to manage anxiety in this interactive workshop.',
      longDescription: 'This workshop combines cognitive-behavioral techniques with mindfulness practices to help you understand and manage anxiety. Led by psychologist Dr. James Wilson, you\'ll learn to identify anxiety triggers, challenge negative thought patterns, and develop a personalized anxiety management toolkit. The workshop includes take-home materials and a 30-day practice guide.',
      date: 'June 10, 2023',
      time: '10:00 AM - 12:30 PM',
      location: 'Downtown Library, Room 302',
      image: require('../assets/images/head.png'),
      category: 'workshop',
      host: 'Dr. James Wilson, Clinical Psychologist',
      price: '$15',
      spots: '12 spots left'
    },
    {
      id: '6',
      title: 'Digital Detox Challenge Kickoff',
      description: 'Join a community of people committed to reducing screen time and increasing mindfulness.',
      longDescription: 'The Digital Detox Challenge is a 14-day program designed to help you develop a healthier relationship with technology. At this kickoff event, you\'ll meet fellow participants, learn about the science of digital addiction, and create your personalized detox plan. The challenge includes daily prompts, alternative activities, and a supportive online community.',
      date: 'June 15, 2023',
      time: '6:30 PM - 8:00 PM',
      location: 'Green Space Cafe',
      image: require('../assets/images/head.png'),
      category: 'meetup',
      host: 'Tech-Life Balance Initiative',
      price: 'Free',
      spots: '25 spots left'
    }
  ];

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Filter events by category
  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  // Open event details modal
  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem, 
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text 
        style={[
          styles.categoryText, 
          selectedCategory === item.id && styles.selectedCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render event item
  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => openEventDetails(item)}
    >
      <Image source={item.image} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <View style={styles.eventDateContainer}>
          <Text style={styles.eventDate}>{item.date}</Text>
        </View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.eventFooter}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#555555" style={styles.locationIcon} />
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Current route is explore
  const currentRoute = "explore";

  return (
    <View style={styles.rootContainer} onLayout={onLayoutRootView}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Events</Text>
        </View>
        
        <View style={styles.categoryContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <FlatList
              data={filteredEvents}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.eventsList}
            />
          </View>
        </ScrollView>
        
        {/* Event Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedEvent && (
                <>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Image source={selectedEvent.image} style={styles.modalImage} />
                    <View style={styles.modalBody}>
                      <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                      
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="calendar-outline" size={18} color="#2C5E1A" style={styles.modalIcon} />
                        <Text style={styles.modalInfoText}>{selectedEvent.date}</Text>
                      </View>
                      
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="time-outline" size={18} color="#2C5E1A" style={styles.modalIcon} />
                        <Text style={styles.modalInfoText}>{selectedEvent.time}</Text>
                      </View>
                      
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="location-outline" size={18} color="#2C5E1A" style={styles.modalIcon} />
                        <Text style={styles.modalInfoText}>{selectedEvent.location}</Text>
                      </View>
                      
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="person-outline" size={18} color="#2C5E1A" style={styles.modalIcon} />
                        <Text style={styles.modalInfoText}>{selectedEvent.host}</Text>
                      </View>
                      
                      <View style={styles.modalInfoRow}>
                        <FontAwesome name="ticket" size={16} color="#2C5E1A" style={styles.modalIcon} />
                        <Text style={styles.modalInfoText}>{selectedEvent.price} • {selectedEvent.spots}</Text>
                      </View>
                      
                      <Text style={styles.modalSectionTitle}>About This Event</Text>
                      <Text style={styles.modalDescription}>{selectedEvent.longDescription}</Text>
                    </View>
                  </ScrollView>
                  
                  <View style={styles.modalFooter}>
                    <TouchableOpacity 
                      style={styles.modalCloseButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.modalRegisterButton}>
                      <Text style={styles.modalRegisterButtonText}>Register</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
        
        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/dashboard")}>
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
          
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/sprout")}>
            <MaterialCommunityIcons 
              name="sprout" 
              size={24} 
              color={currentRoute === "sprout" ? "#8BC34A" : "#2C5E1A"} 
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
          
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
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
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 24,
    color: "#2C5E1A",
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  categoryList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
  },
  selectedCategoryItem: {
    backgroundColor: "#2C5E1A",
  },
  categoryText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#555555",
  },
  selectedCategoryText: {
    color: "white",
  },
  eventsList: {
    paddingVertical: 15,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#E8F5E9",
  },
  eventContent: {
    padding: 15,
  },
  eventDateContainer: {
    marginBottom: 8,
  },
  eventDate: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#8BC34A",
  },
  eventTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 18,
    color: "#2C5E1A",
    marginBottom: 8,
  },
  eventDescription: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: "#555555",
    marginBottom: 15,
    lineHeight: 20,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationIcon: {
    marginRight: 5,
  },
  locationText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#555555",
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 12,
    color: "#2C5E1A",
    textTransform: "capitalize",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
  },
  modalImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#E8F5E9",
  },
  modalBody: {
    padding: 20,
    paddingBottom: 100, // Extra padding for scroll area
  },
  modalTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 22,
    color: "#2C5E1A",
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalIcon: {
    marginRight: 10,
    width: 20,
  },
  modalInfoText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  modalSectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 18,
    color: "#2C5E1A",
    marginTop: 20,
    marginBottom: 10,
  },
  modalDescription: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
  },
  modalFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  modalCloseButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2C5E1A",
    borderRadius: 8,
    marginRight: 10,
  },
  modalCloseButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#2C5E1A",
  },
  modalRegisterButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C5E1A",
    borderRadius: 8,
  },
  modalRegisterButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "white",
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