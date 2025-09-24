import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const WalletConnect = () => {
  const { user, login, logout, loading, isLoggedIn } = useAuth();
  
  // Function to truncate address for display
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle connect wallet button press
  const handleConnectWallet = async () => {
    if (isLoggedIn) {
      await logout();
    } else {
      await login();
    }
  };
  
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#4A80F0" />
      ) : isLoggedIn ? (
        <View style={styles.connectedContainer}>
          <View style={styles.addressContainer}>
            <View style={styles.dot} />
            <Text style={styles.addressText}>{truncateAddress(user?.addr)}</Text>
          </View>
          <TouchableOpacity style={styles.disconnectButton} onPress={handleConnectWallet}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.connectButton} onPress={handleConnectWallet}>
          <Text style={styles.connectText}>Connect Wallet</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  connectButton: {
    backgroundColor: '#4A80F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  connectedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  disconnectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  disconnectText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WalletConnect;
