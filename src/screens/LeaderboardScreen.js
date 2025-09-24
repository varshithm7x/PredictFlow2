import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useLeaderboard } from '../context/LeaderboardContext';
import { useAuth } from '../context/AuthContext';
import LeaderboardEntry from '../components/LeaderboardEntry';
import WalletConnect from '../components/WalletConnect';
import { Ionicons } from '@expo/vector-icons';

const LeaderboardScreen = () => {
  const { leaderboard, userRank, loading, fetchLeaderboard, getUserRank } = useLeaderboard();
  const { user, isLoggedIn } = useAuth();
  
  useEffect(() => {
    fetchLeaderboard();
    
    if (isLoggedIn && user?.addr) {
      getUserRank(user.addr);
    }
  }, [isLoggedIn, user]);
  
  const handleRefresh = () => {
    fetchLeaderboard();
    
    if (isLoggedIn && user?.addr) {
      getUserRank(user.addr);
    }
  };
  
  const renderLeaderboardItem = ({ item, index }) => (
    <LeaderboardEntry entry={item} index={index} />
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <WalletConnect />
      </View>
      
      {isLoggedIn && userRank && (
        <View style={styles.userRankContainer}>
          <Text style={styles.userRankTitle}>Your Rank</Text>
          <View style={styles.userRankContent}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{userRank.rank}</Text>
            </View>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${userRank.totalWinnings}</Text>
                <Text style={styles.statLabel}>Winnings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{(userRank.accuracy * 100).toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userRank.totalVotes}</Text>
                <Text style={styles.statLabel}>Votes</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.leaderboardContainer}>
        <View style={styles.leaderboardHeader}>
          <Text style={styles.leaderboardTitle}>Top Predictors</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>All Time</Text>
            <Ionicons name="chevron-down" size={16} color="#4A80F0" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.address}
          contentContainerStyle={styles.leaderboardList}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No leaderboard data available</Text>
            </View>
          }
        />
      </View>
      
      {!isLoggedIn && (
        <View style={styles.connectPrompt}>
          <Text style={styles.connectText}>Connect your wallet to see your rank</Text>
          <WalletConnect />
        </View>
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
  userRankContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userRankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userRankContent: {
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
  userStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6EEFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterText: {
    color: '#4A80F0',
    marginRight: 4,
  },
  leaderboardList: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  connectPrompt: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  connectText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
});

export default LeaderboardScreen;
