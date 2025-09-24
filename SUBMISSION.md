# Flow Predictions - Forte Hacks Submission

## Project Overview

Flow Predictions is a decentralized mobile application that allows users to create and participate in prediction markets. Users can vote on various "ponders" (prediction questions) with different entry amounts and win from the pool based on the accuracy of their predictions.

### Key Features

- Create and browse prediction questions ("ponders")
- Vote on predictions with different entry amounts ($0, $0.50, $1, $5)
- Connect external wallets to fund accounts with USDC
- Featured "ponders" with juiced pools for increased engagement
- Leaderboard system tracking user accuracy, winnings, and votes
- Push notifications for featured ponders and win/loss outcomes
- User profiles with voting history and statistics
- Comment and like system for user interaction

## Submission Category

We are submitting this project for the following bounties:

1. **Best Use of Flow Forte Actions and Workflows** - Our app leverages Flow's Forte upgrade to create standardized, reusable onchain building blocks that can be composed into workflows. We've implemented Actions for creating ponders, voting, claiming rewards, and automated resolution, as well as Workflows for batch operations and scheduled events.

2. **Best Killer App on Flow** - Flow Predictions aims to be a consumer-oriented killer app by solving the real user pain point of participating in prediction markets in a user-friendly, mobile-first interface. The app is designed for mass adoption with a focus on ease of use and engaging features.

## Technical Implementation

### Flow Blockchain Integration

The app is built on the Flow blockchain and uses the following components:

1. **Smart Contracts**:
   - `FlowPredictions.cdc`: Core contract for creating and managing prediction markets
   - `FlowPredictionActions.cdc`: Implementation of Flow Actions for standardized operations
   - `FlowPredictionWorkflows.cdc`: Composition of Actions into automated workflows

2. **Flow Forte Features**:
   - **Actions**: Standardized, reusable onchain building blocks for creating ponders, voting, claiming rewards, and resolving predictions
   - **Scheduled Transactions**: Used for automatic resolution of ponders at their end time
   - **Workflows**: Composable sequences of actions for batch operations and complex processes

3. **Frontend Integration**:
   - Flow Client Library (FCL) for authentication and blockchain interactions
   - React Native with Expo for cross-platform mobile development
   - Context API for state management

### User Experience

The app is designed with a focus on user experience:

1. **Intuitive Interface**: Clean, modern UI with easy navigation between ponders, creation, leaderboard, and profile sections
2. **Wallet Integration**: Seamless connection to external wallets for funding and transactions
3. **Notifications**: Push notifications for featured ponders, voting results, and other important events
4. **Social Features**: Comments, likes, and sharing functionality for community engagement

## Deployment Information

- **Contract Addresses**:
  - FlowPredictions: `0xYOUR_CONTRACT_ADDRESS`
  - FlowPredictionActions: `0xYOUR_CONTRACT_ADDRESS`
  - FlowPredictionWorkflows: `0xYOUR_CONTRACT_ADDRESS`

- **Network**: Flow Testnet

- **GitHub Repository**: [https://github.com/yourusername/flow-predictions](https://github.com/yourusername/flow-predictions)

## Demo

- **Video Demo**: [Link to video demo]

- **Social Media Post**: [Link to social media post]

## Team

- [Your Name] - Developer
- [Team Member 2] - Designer
- [Team Member 3] - Smart Contract Developer

## Future Plans

1. **Enhanced Prediction Types**: Support for multi-option predictions, numeric ranges, and time-based predictions
2. **Integration with Real-World Data**: Oracle integration for automated resolution based on real-world events
3. **Advanced Analytics**: More detailed statistics and insights for users
4. **Mobile App Store Launch**: Deployment to iOS App Store and Google Play Store
5. **Mainnet Launch**: Migration from testnet to mainnet with full functionality

## Conclusion

Flow Predictions demonstrates the power of Flow's Forte upgrade by creating a consumer-friendly prediction market application that leverages Actions and Workflows for enhanced functionality. The app provides a seamless user experience while maintaining the security and transparency of blockchain technology.

We believe this project has the potential to become a killer app on Flow by bringing prediction markets to mainstream users in an accessible, engaging format.
