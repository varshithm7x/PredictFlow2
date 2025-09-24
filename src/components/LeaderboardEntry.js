import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

const LeaderboardEntry = ({ entry, index }) => {
  const { user } = useAuth();
  const isCurrentUser = user?.addr === entry.address;
  
  // Function to truncate address for display
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Function to generate a placeholder avatar
  const generateAvatarUrl = (address) => {
    return `https://avatars.dicebear.com/api/identicon/${address}.png`;
  };
  
  // Function to format accuracy as percentage
  const formatAccuracy = (accuracy) => {
    return `${(accuracy * 100).toFixed(1)}%`;
  };
  
  // Determine rank style based on position
  const getRankStyle = () => {
    if (index === 0) return styles.firstRank;
    if (index === 1) return styles.secondRank;
    if (index === 2) return styles.thirdRank;
    return styles.normalRank;
  };
  
  return (
    <View style={[styles.container, isCurrentUser && styles.currentUserContainer]}>
      <View style={[styles.rankContainer, getRankStyle()]}>
        <Text style={styles.rankText}>{entry.rank}</Text>
      </View>
      
      <Image
        source={{ uri: generateAvatarUrl(entry.address) }}
        style={styles.avatar}
      />
      
      <View style={styles.userInfo}>
        <Text style={styles.username}>
          {entry.username || truncateAddress(entry.address)}
          {isCurrentUser && <Text style={styles.youText}> (You)</Text>}
        </Text>
        <Text style={styles.address}>{truncateAddress(entry.address)}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${entry.totalWinnings}</Text>
          <Text style={styles.statLabel}>Winnings</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatAccuracy(entry.accuracy)}</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{entry.totalVotes}</Text>
          <Text style={styles.statLabel}>Votes</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserContainer: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#4A80F0',
  },
  rankContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  firstRank: {
    backgroundColor: '#FFD700',
  },
  secondRank: {
    backgroundColor: '#C0C0C0',
  },
  thirdRank: {
    backgroundColor: '#CD7F32',
  },
  normalRank: {
    backgroundColor: '#E0E0E0',
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  youText: {
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#4A80F0',
  },
  address: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 150,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
});

export default LeaderboardEntry;
