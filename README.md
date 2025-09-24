# Flow Predictions

A mobile prediction and voting app built on the Flow blockchain for the Forte Hacks hackathon.

## Overview

Flow Predictions is a decentralized application that allows users to create and vote on various prediction questions ("ponders"). Users can participate with different entry amounts (including a free option) and win from the pool based on their predictions.

The app is built using React Native with Expo and integrates with the Flow blockchain using the Flow Client Library (FCL).

## Features

- Create and browse prediction questions ("ponders")
- Vote on predictions with different entry amounts ($0, $0.50, $1, $5)
- Connect external wallets to fund accounts with USDC
- Featured "ponders" with juiced pools for increased engagement
- Leaderboard system tracking user accuracy, winnings, and votes
- Push notifications for featured ponders and win/loss outcomes
- User profiles with voting history and statistics
- Comment and like system for user interaction

## Technologies Used

- React Native with Expo
- Flow blockchain and FCL (Flow Client Library)
- React Navigation for app navigation
- Expo Notifications for push notifications
- React Context API for state management

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Flow CLI (optional, for blockchain development)

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/flow-predictions.git
cd flow-predictions
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

4. Follow the instructions in the terminal to open the app on your device or emulator.

## Project Structure

```
flow-predictions/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # Services for blockchain, notifications, etc.
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── assets/           # Images, fonts, etc.
│   ├── config/           # Configuration files
│   └── constants/        # Constants and enums
├── App.js                # Main app component
└── README.md             # Project documentation
```

## Flow Blockchain Integration

This project is built on Flow and uses the Flow Client Library (FCL) for blockchain interactions. The app is deployed on the Flow testnet.

### Smart Contracts

The smart contracts for this project are written in Cadence, Flow's resource-oriented programming language. The contracts handle:

- Creating and managing prediction questions
- Processing votes and entry amounts
- Distributing winnings to successful predictors
- Tracking user statistics for the leaderboard

### Forte Actions and Workflows

The app utilizes Flow's Forte upgrade features:

- Flow Actions for standardized, reusable onchain building blocks
- Scheduled Transactions for time-based triggers and automation

## Submission for Forte Hacks

This project is submitted for the Forte Hacks hackathon on Flow. It specifically targets the following bounties:

- Best Killer App on Flow
- Best Use of Flow Forte Actions and Workflows

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Flow team for providing the blockchain infrastructure
- Forte Hacks organizers
- All contributors to the project