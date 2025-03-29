import { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  Modal,
  ScrollView
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function JournalHistory() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  // State for journal entries
  const [journalEntries, setJournalEntries] = useState([]);
  
  // State for selected entry and modal
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load journal entries
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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Open entry details
  const openEntryDetails = (entry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

  // Render journal entry
  const renderJournalEntry = ({ item }) => (
    <TouchableOpacity 
      style={styles.journalCard}
      onPress={() => openEntryDetails(item)}
    >
      <View style={styles.journalHeader}>
        <Text style={styles.journalDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.journalPrompt}>{item.prompt}</Text>
      <Text style={styles.journalText} numberOfLines={3}>{item.text}</Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Journal History</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.container}>
          {journalEntries.length > 0 ? (
            <FlatList
              data={journalEntries}
              renderItem={renderJournalEntry}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.journalList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
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
        
        {/* Entry Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#2C5E1A" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Journal Entry</Text>
                <View style={styles.placeholder} />
              </View>
              
              <ScrollView style={styles.modalBody}>
                {selectedEntry && (
                  <>
                    <Text style={styles.entryDate}>
                      {formatDate(selectedEntry.date)}
                    </Text>
                    <View style={styles.promptContainer}>
                      <Text style={styles.promptLabel}>Prompt:</Text>
                      <Text style={styles.promptText}>{selectedEntry.prompt}</Text>
                    </View>
                    <Text style={styles.entryText}>{selectedEntry.text}</Text>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    padding: 15,
  },
  journalList: {
    paddingBottom: 20,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
    marginBottom: 20,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 18,
    color: "#2C5E1A",
  },
  modalBody: {
    padding: 20,
  },
  entryDate: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 16,
    color: "#8BC34A",
    marginBottom: 15,
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
  entryText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
  },
}); 