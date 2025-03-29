import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to securely store API key
export const storeApiKey = async (apiKey) => {
  try {
    await AsyncStorage.setItem('openai_api_key', apiKey);
    return true;
  } catch (error) {
    console.error('Error storing API key:', error);
    return false;
  }
};

// Function to retrieve API key
export const getApiKey = async () => {
  try {
    return await AsyncStorage.getItem('openai_api_key');
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
};

// Initialize API key (call this once when app starts)
export const initializeApiKey = async () => {
  const storedKey = await getApiKey();
  if (!storedKey) {
    // Store the provided API key
    const defaultKey = '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';
    await storeApiKey(defaultKey);
  }
}; 