import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const WalletScreen = () => {
  const { user } = useAuth();
  
  const [balance, setBalance] = useState(25.50); // Mock balance
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Mock transaction history
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      type: 'deposit',
      amount: 10,
      timestamp: new Date().getTime() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      status: 'completed',
    },
    {
      id: '2',
      type: 'win',
      amount: 15.50,
      ponderId: '1',
      timestamp: new Date().getTime() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      status: 'completed',
    },
    {
      id: '3',
      type: 'vote',
      amount: -1,
      ponderId: '2',
      timestamp: new Date().getTime() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      status: 'completed',
    },
  ]);
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Format timestamp for transactions
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Handle deposit
  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Add transaction to history
      const newTransaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount,
        timestamp: new Date().getTime(),
        status: 'completed',
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Update balance
      setBalance(prevBalance => prevBalance + amount);
      
      // Reset input
      setDepositAmount('');
      setLoading(false);
      
      Alert.alert('Success', `Successfully deposited $${amount.toFixed(2)}.`);
    }, 1500);
  };
  
  // Handle withdraw
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    
    if (amount > balance) {
      Alert.alert('Error', 'Insufficient funds.');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Add transaction to history
      const newTransaction = {
        id: Date.now().toString(),
        type: 'withdraw',
        amount: -amount,
        timestamp: new Date().getTime(),
        status: 'completed',
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Update balance
      setBalance(prevBalance => prevBalance - amount);
      
      // Reset input
      setWithdrawAmount('');
      setLoading(false);
      
      Alert.alert('Success', `Successfully withdrew $${amount.toFixed(2)}.`);
    }, 1500);
  };
  
  // Get transaction icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <Ionicons name="arrow-down-circle" size={24} color="#4CAF50" />;
      case 'withdraw':
        return <Ionicons name="arrow-up-circle" size={24} color="#F44336" />;
      case 'win':
        return <Ionicons name="trophy" size={24} color="#FFD700" />;
      case 'vote':
        return <Ionicons name="checkmark-circle" size={24} color="#2196F3" />;
      default:
        return <Ionicons name="ellipsis-horizontal-circle" size={24} color="#9E9E9E" />;
    }
  };
  
  // Get transaction description
  const getTransactionDescription = (transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdraw';
      case 'win':
        return 'Prediction Win';
      case 'vote':
        return 'Prediction Vote';
      default:
        return 'Transaction';
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
        <Text style={styles.balanceAddress}>
          {user?.addr ? formatAddress(user.addr) : 'Not connected'}
        </Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Deposit</Text>
          <TextInput
            style={styles.amountInput}
            value={depositAmount}
            onChangeText={setDepositAmount}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.actionButton, loading && styles.disabledButton]}
            onPress={handleDeposit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Deposit USDC</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Withdraw</Text>
          <TextInput
            style={styles.amountInput}
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.actionButton, loading && styles.disabledButton]}
            onPress={handleWithdraw}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Withdraw USDC</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Transaction History</Text>
        
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                {getTransactionIcon(transaction.type)}
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>
                  {getTransactionDescription(transaction)}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatTimestamp(transaction.timestamp)}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount
              ]}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} USDC
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  balanceContainer: {
    backgroundColor: '#4A80F0',
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#E6EEFF',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceAddress: {
    color: '#E6EEFF',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionSection: {
    flex: 1,
    marginHorizontal: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#4A80F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  transactionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  transactionIcon: {
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
});

export default WalletScreen;
