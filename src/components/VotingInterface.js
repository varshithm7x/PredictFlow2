import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { usePonders } from '../context/PonderContext';
import { useAuth } from '../context/AuthContext';

const VotingInterface = ({ ponder }) => {
  const { voteOnPonder } = usePonders();
  const { isLoggedIn, login } = useAuth();
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };
  
  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
  };
  
  const handleVote = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'You need to connect your wallet to vote.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Wallet', onPress: login }
        ]
      );
      return;
    }
    
    if (selectedOption === null) {
      Alert.alert('Error', 'Please select an option to vote.');
      return;
    }
    
    if (selectedAmount === null) {
      Alert.alert('Error', 'Please select an entry amount.');
      return;
    }
    
    try {
      setLoading(true);
      const result = await voteOnPonder(ponder.id, selectedOption, selectedAmount);
      
      if (result.success) {
        Alert.alert(
          'Vote Submitted',
          `You have successfully voted on "${ponder.question}" with $${selectedAmount}.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit your vote. Please try again.');
      }
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const isPonderEnded = new Date().getTime() > ponder.endTime;
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cast Your Vote</Text>
      
      {isPonderEnded ? (
        <View style={styles.endedContainer}>
          <Text style={styles.endedText}>This ponder has ended</Text>
        </View>
      ) : (
        <>
          <View style={styles.optionsContainer}>
            {ponder.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === index && styles.selectedOption
                ]}
                onPress={() => handleOptionSelect(index)}
              >
                <Text 
                  style={[
                    styles.optionText,
                    selectedOption === index && styles.selectedOptionText
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.amountTitle}>Select Entry Amount</Text>
          
          <View style={styles.amountsContainer}>
            {ponder.entryAmounts.map((amount, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.selectedAmount,
                  amount === 0 && styles.freeAmount
                ]}
                onPress={() => handleAmountSelect(amount)}
              >
                <Text 
                  style={[
                    styles.amountText,
                    selectedAmount === amount && styles.selectedAmountText,
                    amount === 0 && styles.freeAmountText
                  ]}
                >
                  {amount === 0 ? 'Free' : `$${amount}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.voteButton,
              (selectedOption === null || selectedAmount === null) && styles.disabledButton,
              loading && styles.loadingButton
            ]}
            onPress={handleVote}
            disabled={selectedOption === null || selectedAmount === null || loading}
          >
            <Text style={styles.voteButtonText}>
              {loading ? 'Submitting...' : 'Submit Vote'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            {selectedAmount === 0 
              ? 'Free votes do not influence the pool outcome.'
              : 'Paid votes contribute to and can win from the pool.'}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#4A80F0',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
  amountTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amountButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  selectedAmount: {
    backgroundColor: '#4A80F0',
  },
  freeAmount: {
    backgroundColor: '#E0E0E0',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedAmountText: {
    color: '#fff',
  },
  freeAmountText: {
    color: '#666',
  },
  voteButton: {
    backgroundColor: '#4A80F0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
  loadingButton: {
    backgroundColor: '#7A9BF0',
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  endedContainer: {
    padding: 20,
    alignItems: 'center',
  },
  endedText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default VotingInterface;
