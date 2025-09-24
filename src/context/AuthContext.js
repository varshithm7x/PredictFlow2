import React, { createContext, useState, useEffect, useContext } from 'react';
import * as flowService from '../services/flow.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUserLoggedIn = async () => {
      try {
        setLoading(true);
        const currentUser = await flowService.getCurrentUser();
        if (currentUser.loggedIn) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking user login status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to user changes
    const unsubscribe = flowService.subscribeToCurrentUser((currentUser) => {
      setUser(currentUser);
      
      // Store user data in AsyncStorage when logged in
      if (currentUser.loggedIn) {
        AsyncStorage.setItem('user', JSON.stringify(currentUser))
          .catch(err => console.error('Error storing user data:', err));
      } else {
        AsyncStorage.removeItem('user')
          .catch(err => console.error('Error removing user data:', err));
      }
    });

    checkUserLoggedIn();

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      await flowService.authenticate();
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await flowService.unauthenticate();
      setUser(null);
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isLoggedIn: user?.loggedIn || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
