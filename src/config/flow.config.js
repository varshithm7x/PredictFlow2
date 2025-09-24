import { config } from "@onflow/fcl";

// Configure FCL for Flow testnet
config({
  "accessNode.api": "https://rest-testnet.onflow.org", // Flow testnet API
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Wallet discovery endpoint
  "app.detail.title": "Flow Predictions", // App name
  "app.detail.icon": "https://placekitten.com/g/200/200", // Placeholder icon, replace with your app icon
  "0xProfile": "0xba1132bc08f82fe2", // Flow Profile contract on testnet
});
