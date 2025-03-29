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
  Alert
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

export default function Shop() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for user points
  const [userPoints, setUserPoints] = useState(0);
  
  // State for shop categories
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Load user points from AsyncStorage
  useEffect(() => {
    const loadUserPoints = async () => {
      try {
        const points = await AsyncStorage.getItem('userPoints');
        if (points) {
          setUserPoints(parseInt(points));
        }
      } catch (error) {
        console.error('Error loading user points:', error);
      }
    };
    
    loadUserPoints();
  }, []);

  // Shop items data
  const shopItems = [
    {
      id: '1',
      title: 'Stress Relief Ball',
      description: 'Squeeze away tension with this therapeutic stress ball',
      price: 50,
      image: require('../assets/images/head.png'),
      category: 'physical'
    },
    {
      id: '2',
      title: 'Gym Day Pass',
      description: 'One-day access to a local fitness center of your choice',
      price: 150,
      image: require('../assets/images/head.png'),
      category: 'physical'
    },
    {
      id: '3',
      title: 'Guided Meditation Session',
      description: 'Access to premium 30-minute guided meditation',
      price: 75,
      image: require('../assets/images/head.png'),
      category: 'digital'
    },
    {
      id: '4',
      title: 'Wellness Journal',
      description: 'Beautiful journal with prompts for mental well-being',
      price: 120,
      image: require('../assets/images/head.png'),
      category: 'physical'
    },
    {
      id: '5',
      title: 'Sleep Sound Pack',
      description: 'Collection of premium sleep sounds and white noise',
      price: 60,
      image: require('../assets/images/head.png'),
      category: 'digital'
    },
    {
      id: '6',
      title: 'Therapy Session Discount',
      description: '15% off your next online therapy session',
      price: 200,
      image: require('../assets/images/head.png'),
      category: 'service'
    },
    {
      id: '7',
      title: 'Aromatherapy Kit',
      description: 'Essential oils starter kit for stress relief',
      price: 180,
      image: require('../assets/images/head.png'),
      category: 'physical'
    },
    {
      id: '8',
      title: 'Mindfulness Course',
      description: 'Access to 8-week online mindfulness course',
      price: 250,
      image: require('../assets/images/head.png'),
      category: 'digital'
    }
  ];
  
  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  
  // Handle redeem button press
  const handleRedeem = async (item) => {
    if (userPoints >= item.price) {
      // Deduct points
      const newPoints = userPoints - item.price;
      
      try {
        // Update points in storage
        await AsyncStorage.setItem('userPoints', newPoints.toString());
        
        // Update state
        setUserPoints(newPoints);
        
        // Show success message
        Alert.alert(
          "Redemption Successful!",
          `You've redeemed ${item.title}. Check your email for details on how to claim your reward.`,
          [{ text: "OK" }]
        );
      } catch (error) {
        console.error('Error updating points:', error);
        Alert.alert("Error", "There was a problem processing your redemption. Please try again.");
      }
    } else {
      // Not enough points
      Alert.alert(
        "Insufficient Points",
        `You need ${item.price - userPoints} more points to redeem this item.`,
        [{ text: "OK" }]
      );
    }
  };
  
  // Render shop item
  const renderShopItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.itemFooter}>
          <View style={styles.priceContainer}>
            <FontAwesome name="circle" size={16} color="#FFC107" style={styles.coinIcon} />
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.redeemButton, 
              userPoints < item.price && styles.redeemButtonDisabled
            ]}
            onPress={() => handleRedeem(item)}
            disabled={userPoints < item.price}
          >
            <Text style={styles.redeemButtonText}>Redeem</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  // Current route is shop
  const currentRoute = "shop";

  return (
    <View style={styles.rootContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wellness Shop</Text>
          <View style={styles.pointsBadge}>
            <FontAwesome name="circle" size={16} color="#FFC107" style={styles.pointsIcon} />
            <Text style={styles.pointsText}>{userPoints}</Text>
          </View>
        </View>
        
        {/* Category selector */}
        <View style={styles.categoryContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity 
              style={[
                styles.categoryButton, 
                selectedCategory === 'all' && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === 'all' && styles.categoryTextActive
              ]}>All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton, 
                selectedCategory === 'physical' && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory('physical')}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === 'physical' && styles.categoryTextActive
              ]}>Physical Items</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton, 
                selectedCategory === 'digital' && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory('digital')}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === 'digital' && styles.categoryTextActive
              ]}>Digital Content</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton, 
                selectedCategory === 'service' && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory('service')}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === 'service' && styles.categoryTextActive
              ]}>Services</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Shop items */}
        <FlatList
          data={filteredItems}
          renderItem={renderShopItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.itemsList}
          showsVerticalScrollIndicator={false}
        />
        
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
          
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 22,
    color: "#2C5E1A",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  pointsIcon: {
    marginRight: 5,
  },
  pointsText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#FFC107",
  },
  categoryContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  categoryScroll: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
  },
  categoryButtonActive: {
    backgroundColor: "#2C5E1A",
  },
  categoryText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 14,
    color: "#555555",
  },
  categoryTextActive: {
    color: "white",
  },
  itemsList: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#E8F5E9",
  },
  itemContent: {
    padding: 15,
  },
  itemTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 18,
    color: "#2C5E1A",
    marginBottom: 5,
  },
  itemDescription: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: "#555555",
    marginBottom: 15,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinIcon: {
    marginRight: 5,
  },
  priceText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: "#FFC107",
  },
  redeemButton: {
    backgroundColor: "#2C5E1A",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: "#AAAAAA",
  },
  redeemButtonText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
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