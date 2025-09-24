import React, { createContext, useState, useEffect, useContext } from 'react';
import * as flowService from '../services/flow.service';
import { useAuth } from './AuthContext';

const PonderContext = createContext();

export const PonderProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [ponders, setPonders] = useState([]);
  const [featuredPonders, setFeaturedPonders] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch active ponders
  const fetchPonders = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the blockchain
      // For now, we'll use mock data
      const mockPonders = [
        {
          id: '1',
          question: 'Will ETH price exceed $5000 by end of October?',
          options: ['Yes', 'No'],
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime(), // 7 days from now
          entryAmounts: [0, 0.5, 1, 5], // Free, $0.50, $1, $5
          totalPool: 250,
          featured: true,
          createdBy: '0x12345',
          createdAt: new Date().getTime(),
          participants: 120,
        },
        {
          id: '2',
          question: 'Will the Flow hackathon have more than 500 submissions?',
          options: ['Yes', 'No'],
          endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).getTime(), // 14 days from now
          entryAmounts: [0, 0.5, 1, 5], // Free, $0.50, $1, $5
          totalPool: 100,
          featured: false,
          createdBy: '0x67890',
          createdAt: new Date().getTime(),
          participants: 45,
        },
        {
          id: '3',
          question: 'Will Bitcoin reach a new all-time high in 2025?',
          options: ['Yes', 'No'],
          endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime(), // 30 days from now
          entryAmounts: [0, 1, 5, 10], // Free, $1, $5, $10
          totalPool: 500,
          featured: true,
          createdBy: '0x54321',
          createdAt: new Date().getTime(),
          participants: 230,
        },
      ];
      
      setPonders(mockPonders);
      setFeaturedPonders(mockPonders.filter(p => p.featured));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ponders:', error);
      setLoading(false);
    }
  };

  // Fetch user's voting history
  const fetchUserVotes = async () => {
    if (!isLoggedIn || !user?.addr) return;
    
    try {
      setLoading(true);
      // In a real app, this would fetch from the blockchain
      // For now, we'll use mock data
      const mockUserVotes = [
        {
          ponderId: '1',
          optionIndex: 0,
          amount: 1,
          timestamp: new Date().getTime() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
          status: 'pending', // pending, won, lost
        },
        {
          ponderId: '2',
          optionIndex: 1,
          amount: 0.5,
          timestamp: new Date().getTime() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
          status: 'won',
        },
      ];
      
      setUserVotes(mockUserVotes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user votes:', error);
      setLoading(false);
    }
  };

  // Create a new ponder
  const createPonder = async (ponderData) => {
    try {
      setLoading(true);
      // In a real app, this would call the blockchain
      // For now, we'll just add to our local state
      const newPonder = {
        id: Date.now().toString(),
        ...ponderData,
        createdBy: user?.addr,
        createdAt: new Date().getTime(),
        participants: 0,
      };
      
      setPonders(prev => [...prev, newPonder]);
      if (newPonder.featured) {
        setFeaturedPonders(prev => [...prev, newPonder]);
      }
      setLoading(false);
      return { success: true, ponderId: newPonder.id };
    } catch (error) {
      console.error('Error creating ponder:', error);
      setLoading(false);
      return { success: false, error };
    }
  };

  // Vote on a ponder
  const voteOnPonder = async (ponderId, optionIndex, amount) => {
    try {
      setLoading(true);
      // In a real app, this would call the blockchain
      // For now, we'll just update our local state
      const newVote = {
        ponderId,
        optionIndex,
        amount,
        timestamp: new Date().getTime(),
        status: 'pending',
      };
      
      setUserVotes(prev => [...prev, newVote]);
      
      // Update the ponder's participants count
      setPonders(prev => 
        prev.map(p => 
          p.id === ponderId 
            ? { ...p, participants: p.participants + 1 } 
            : p
        )
      );
      
      setFeaturedPonders(prev => 
        prev.map(p => 
          p.id === ponderId 
            ? { ...p, participants: p.participants + 1 } 
            : p
        )
      );
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Error voting on ponder:', error);
      setLoading(false);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchPonders();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserVotes();
    }
  }, [isLoggedIn, user]);

  return (
    <PonderContext.Provider
      value={{
        ponders,
        featuredPonders,
        userVotes,
        loading,
        fetchPonders,
        fetchUserVotes,
        createPonder,
        voteOnPonder,
      }}
    >
      {children}
    </PonderContext.Provider>
  );
};

export const usePonders = () => {
  const context = useContext(PonderContext);
  if (!context) {
    throw new Error('usePonders must be used within a PonderProvider');
  }
  return context;
};
