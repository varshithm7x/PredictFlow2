import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  SafeAreaView,
  Switch
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { usePonders } from '../context/PonderContext';
import { useLeaderboard } from '../context/LeaderboardContext';
import WalletConnect from '../components/WalletConnect';
import { Ionicons } from '@expo/vector-icons';
import * as notificationService from '../services/notification.service';

const ProfileScreen = ({ navigation }) => {
  const { user, isLoggedIn } = useAuth();
  const { userVotes } = usePonders();
  const { userRank } = useLeaderboard();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  // Toggle notifications
  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    if (value) {
      await notificationService.registerForPushNotifications();
    }
  };
  
  // Generate a placeholder avatar
  const generateAvatarUrl = (address) => {
    if (!address) return 'https://avatars.dicebear.com/api/identicon/default.png';
    return `https://avatars.dicebear.com/api/identicon/${address}.png`;
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Calculate statistics
  const calculateStats = () => {
    if (!userVotes || userVotes.length === 0) {
      return {
        totalVotes: 0,
        wonVotes: 0,
        accuracy: 0,
        totalWinnings: 0,
      };
    }
    
    const totalVotes = userVotes.length;
    const wonVotes = userVotes.filter(vote => vote.status === 'won').length;
    const accuracy = totalVotes > 0 ? (wonVotes / totalVotes) : 0;
    const totalWinnings = userVotes
      .filter(vote => vote.status === 'won')
      .reduce((sum, vote) => sum + vote.amount * 2, 0); // Simple calculation for demo
    
    return {
      totalVotes,
      wonVotes,
      accuracy,
      totalWinnings,
    };
  };
  
  const stats = calculateStats();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <WalletConnect />
      </View>
      
      <ScrollView>
        {isLoggedIn ? (
          <>
            <View style={styles.profileSection}>
              <Image 
                source={{ uri: generateAvatarUrl(user?.addr) }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.username}>
                  {user?.addr ? formatAddress(user.addr) : 'Anonymous'}
                </Text>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Your Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalVotes}</Text>
                  <Text style={styles.statLabel}>Total Votes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.wonVotes}</Text>
                  <Text style={styles.statLabel}>Correct Predictions</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{(stats.accuracy * 100).toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>Accuracy</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${stats.totalWinnings.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>Total Winnings</Text>
                </View>
              </View>
            </View>
            
            {userRank && (
              <View style={styles.rankSection}>
                <Text style={styles.sectionTitle}>Your Rank</Text>
                <View style={styles.rankContainer}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{userRank.rank}</Text>
                  </View>
                  <Text style={styles.rankDescription}>
                    You're in the top {Math.ceil((userRank.rank / 100) * 100)}% of predictors!
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Actions</Text>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Wallet')}
              >
                <View style={styles.actionLeft}>
                  <Ionicons name="wallet-outline" size={24} color="#4A80F0" />
                  <Text style={styles.actionText}>My Wallet</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionLeft}>
                  <Ionicons name="time-outline" size={24} color="#4A80F0" />
                  <Text style={styles.actionText}>Voting History</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionLeft}>
                  <Ionicons name="help-circle-outline" size={24} color="#4A80F0" />
                  <Text style={styles.actionText}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Settings</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications-outline" size={24} color="#4A80F0" />
                  <Text style={styles.settingText}>Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: '#D1D1D1', true: '#4A80F0' }}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="moon-outline" size={24} color="#4A80F0" />
                  <Text style={styles.settingText}>Dark Mode</Text>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: '#D1D1D1', true: '#4A80F0' }}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.connectContainer}>
            <Ionicons name="person-circle-outline" size={80} color="#ccc" />
            <Text style={styles.connectTitle}>Connect Your Wallet</Text>
            <Text style={styles.connectText}>
              Connect your wallet to view your profile, track your predictions, and manage your winnings.
            </Text>
            <WalletConnect />
          </View>
        )}
      </ScrollView>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#E6EEFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#4A80F0',
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  rankSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rankDescription: {
    flex: 1,
    fontSize: 14,
  },
  actionsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
  },
  settingsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
  },
  connectContainer: {
    padding: 40,
    alignItems: 'center',
  },
  connectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  connectText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ProfileScreen;
