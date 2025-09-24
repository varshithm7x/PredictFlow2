import React, { createContext, useState, useEffect, useContext } from 'react';
import * as flowService from '../services/flow.service';

const LeaderboardContext = createContext();

export const LeaderboardProvider = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the blockchain
      // For now, we'll use mock data
      const mockLeaderboard = [
        {
          address: '0x12345',
          username: 'crypto_oracle',
          accuracy: 0.85,
          totalWinnings: 1250,
          totalVotes: 42,
          rank: 1,
        },
        {
          address: '0x67890',
          username: 'prediction_master',
          accuracy: 0.82,
          totalWinnings: 980,
          totalVotes: 38,
          rank: 2,
        },
        {
          address: '0x54321',
          username: 'future_seer',
          accuracy: 0.79,
          totalWinnings: 820,
          totalVotes: 35,
          rank: 3,
        },
        {
          address: '0x98765',
          username: 'lucky_guesser',
          accuracy: 0.76,
          totalWinnings: 750,
          totalVotes: 40,
          rank: 4,
        },
        {
          address: '0x24680',
          username: 'blockchain_wizard',
          accuracy: 0.74,
          totalWinnings: 680,
          totalVotes: 32,
          rank: 5,
        },
        {
          address: '0x13579',
          username: 'token_trader',
          accuracy: 0.71,
          totalWinnings: 620,
          totalVotes: 30,
          rank: 6,
        },
        {
          address: '0x86420',
          username: 'defi_expert',
          accuracy: 0.68,
          totalWinnings: 550,
          totalVotes: 28,
          rank: 7,
        },
        {
          address: '0x97531',
          username: 'nft_collector',
          accuracy: 0.65,
          totalWinnings: 480,
          totalVotes: 25,
          rank: 8,
        },
        {
          address: '0x31415',
          username: 'crypto_newbie',
          accuracy: 0.62,
          totalWinnings: 420,
          totalVotes: 22,
          rank: 9,
        },
        {
          address: '0x27182',
          username: 'web3_enthusiast',
          accuracy: 0.60,
          totalWinnings: 380,
          totalVotes: 20,
          rank: 10,
        },
      ];
      
      setLeaderboard(mockLeaderboard);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  // Get user's rank
  const getUserRank = async (address) => {
    if (!address) return null;
    
    try {
      // In a real app, this would query the blockchain
      // For now, we'll just check our mock data
      const userEntry = leaderboard.find(entry => entry.address === address);
      if (userEntry) {
        setUserRank(userEntry.rank);
        return userEntry.rank;
      } else {
        // Mock a rank for a user not in the top 10
        const mockRank = {
          address,
          username: 'you',
          accuracy: 0.55,
          totalWinnings: 120,
          totalVotes: 8,
          rank: 42, // Example rank outside top 10
        };
        setUserRank(mockRank);
        return mockRank;
      }
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        userRank,
        loading,
        fetchLeaderboard,
        getUserRank,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};
