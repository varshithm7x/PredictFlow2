/**
 * Deployment script for Flow Predictions app
 * 
 * This script deploys the smart contracts to the Flow blockchain.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Network to deploy to (emulator, testnet, mainnet)
const NETWORK = process.env.FLOW_NETWORK || 'testnet';

// Account to deploy from
const ACCOUNT = process.env.FLOW_ACCOUNT || 'testnet-account';

// Check if flow.json exists
const checkFlowConfig = () => {
  const flowConfigPath = path.join(__dirname, '../../flow.json');
  
  if (!fs.existsSync(flowConfigPath)) {
    console.error('Error: flow.json not found. Please create a flow.json file with your account configuration.');
    process.exit(1);
  }
  
  console.log('Flow configuration found.');
};

// Deploy contracts
const deployContracts = () => {
  return new Promise((resolve, reject) => {
    console.log(`Deploying contracts to ${NETWORK} using account ${ACCOUNT}...`);
    
    const command = `flow project deploy --network=${NETWORK} --update`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error deploying contracts: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`Deployment stderr: ${stderr}`);
      }
      
      console.log(`Deployment stdout: ${stdout}`);
      resolve();
    });
  });
};

// Update contract addresses in config
const updateContractAddresses = () => {
  return new Promise((resolve, reject) => {
    console.log('Updating contract addresses in config...');
    
    try {
      // Read flow.json
      const flowConfigPath = path.join(__dirname, '../../flow.json');
      const flowConfig = JSON.parse(fs.readFileSync(flowConfigPath, 'utf8'));
      
      // Get deployed contract addresses
      const accountAddress = flowConfig.accounts[ACCOUNT].address;
      
      // Update the Flow config file
      const flowJsConfigPath = path.join(__dirname, '../config/flow.config.js');
      let flowJsConfig = fs.readFileSync(flowJsConfigPath, 'utf8');
      
      // Replace placeholder addresses with actual addresses
      flowJsConfig = flowJsConfig.replace(/0x0000000000000000/g, `0x${accountAddress}`);
      
      fs.writeFileSync(flowJsConfigPath, flowJsConfig);
      
      console.log('Contract addresses updated in config.');
      resolve();
    } catch (error) {
      console.error(`Error updating contract addresses: ${error.message}`);
      reject(error);
    }
  });
};

// Run deployment
const runDeployment = async () => {
  try {
    checkFlowConfig();
    await deployContracts();
    await updateContractAddresses();
    
    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
};

// Run the deployment if this script is executed directly
if (require.main === module) {
  runDeployment();
}

// Export for use in other scripts
module.exports = {
  checkFlowConfig,
  deployContracts,
  updateContractAddresses,
  runDeployment,
};
