import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import CreatePonderForm from '../components/CreatePonderForm';
import WalletConnect from '../components/WalletConnect';

const CreateScreen = ({ navigation }) => {
  const { isLoggedIn } = useAuth();
  
  const handleCreateSuccess = () => {
    // Navigate to Home screen after successful creation
    navigation.navigate('Home');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Ponder</Text>
        <WalletConnect />
      </View>
      
      {!isLoggedIn ? (
        <View style={styles.connectContainer}>
          <Text style={styles.connectText}>
            Connect your wallet to create a new ponder
          </Text>
          <WalletConnect />
        </View>
      ) : (
        <CreatePonderForm onSuccess={handleCreateSuccess} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});

export default CreateScreen;
