/**
 * Test script for Flow Predictions app
 * 
 * This script tests various components and functionality of the app.
 */

import * as fcl from "@onflow/fcl";
import * as flowService from "../services/flow.service";
import * as notificationService from "../services/notification.service";

// Configure FCL for testnet
import "../config/flow.config";

// Test authentication
const testAuth = async () => {
  console.log("Testing authentication...");
  
  try {
    // Authenticate user
    await flowService.authenticate();
    console.log("Authentication successful");
    
    // Get current user
    const user = await flowService.getCurrentUser();
    console.log("Current user:", user);
    
    // Unauthenticate user
    await flowService.unauthenticate();
    console.log("Unauthentication successful");
    
    return true;
  } catch (error) {
    console.error("Authentication test failed:", error);
    return false;
  }
};

// Test creating a ponder
const testCreatePonder = async () => {
  console.log("Testing ponder creation...");
  
  try {
    // Authenticate user
    await flowService.authenticate();
    
    // Create a ponder
    const question = "Will ETH price exceed $5000 by end of October?";
    const options = ["Yes", "No"];
    const endTime = (Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000; // 7 days from now in seconds
    const entryAmounts = [0, 0.5, 1, 5];
    
    const transactionId = await flowService.createPonder(
      question,
      options,
      endTime,
      entryAmounts
    );
    
    console.log("Ponder created with transaction ID:", transactionId);
    
    // Unauthenticate user
    await flowService.unauthenticate();
    
    return true;
  } catch (error) {
    console.error("Ponder creation test failed:", error);
    return false;
  }
};

// Test voting on a ponder
const testVoteOnPonder = async () => {
  console.log("Testing voting on a ponder...");
  
  try {
    // Authenticate user
    await flowService.authenticate();
    
    // Get active ponders
    const ponders = await flowService.getActivePonders();
    
    if (ponders.length === 0) {
      console.log("No active ponders found");
      return false;
    }
    
    // Vote on the first ponder
    const ponderId = ponders[0].id;
    const optionIndex = 0;
    const amount = 0.5;
    
    const transactionId = await flowService.voteOnPonder(
      ponderId,
      optionIndex,
      amount
    );
    
    console.log("Vote cast with transaction ID:", transactionId);
    
    // Unauthenticate user
    await flowService.unauthenticate();
    
    return true;
  } catch (error) {
    console.error("Voting test failed:", error);
    return false;
  }
};

// Test notifications
const testNotifications = async () => {
  console.log("Testing notifications...");
  
  try {
    // Register for push notifications
    const token = await notificationService.registerForPushNotifications();
    console.log("Push notification token:", token);
    
    // Schedule a test notification
    const notificationId = await notificationService.scheduleLocalNotification(
      "Test Notification",
      "This is a test notification from Flow Predictions",
      { test: true }
    );
    
    console.log("Notification scheduled with ID:", notificationId);
    
    return true;
  } catch (error) {
    console.error("Notifications test failed:", error);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log("Starting Flow Predictions app tests...");
  
  const results = {
    auth: await testAuth(),
    createPonder: await testCreatePonder(),
    voteOnPonder: await testVoteOnPonder(),
    notifications: await testNotifications(),
  };
  
  console.log("Test results:", results);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log("All tests passed!");
  } else {
    console.log("Some tests failed. See above for details.");
  }
};

// Export the test functions
export {
  testAuth,
  testCreatePonder,
  testVoteOnPonder,
  testNotifications,
  runTests,
};
