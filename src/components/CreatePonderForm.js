import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { usePonders } from '../context/PonderContext';
import { useAuth } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreatePonderForm = ({ onSuccess }) => {
  const { createPonder } = usePonders();
  const { isLoggedIn, login } = useAuth();
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 7 days from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [entryAmounts, setEntryAmounts] = useState([true, true, true, false]); // Free, $0.50, $1, $5
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Handle adding a new option
  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    } else {
      Alert.alert('Limit Reached', 'You can add a maximum of 5 options.');
    }
  };
  
  // Handle removing an option
  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    } else {
      Alert.alert('Minimum Required', 'You need at least 2 options.');
    }
  };
  
  // Handle option text change
  const handleOptionChange = (text, index) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };
  
  // Handle entry amount toggle
  const toggleEntryAmount = (index) => {
    const newEntryAmounts = [...entryAmounts];
    newEntryAmounts[index] = !newEntryAmounts[index];
    setEntryAmounts(newEntryAmounts);
  };
  
  // Get actual entry amounts based on toggles
  const getActualEntryAmounts = () => {
    const amountValues = [0, 0.5, 1, 5];
    return amountValues.filter((_, index) => entryAmounts[index]);
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question.');
      return;
    }
    
    if (options.some(option => !option.trim())) {
      Alert.alert('Error', 'All options must have text.');
      return;
    }
    
    if (new Date() >= endDate) {
      Alert.alert('Error', 'End date must be in the future.');
      return;
    }
    
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'You need to connect your wallet to create a ponder.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Wallet', onPress: login }
        ]
      );
      return;
    }
    
    try {
      setLoading(true);
      
      const actualEntryAmounts = getActualEntryAmounts();
      if (actualEntryAmounts.length === 0) {
        Alert.alert('Error', 'Please select at least one entry amount.');
        setLoading(false);
        return;
      }
      
      const result = await createPonder({
        question,
        options,
        endTime: endDate.getTime(),
        entryAmounts: actualEntryAmounts,
        featured,
        totalPool: featured ? 100 : 0, // Mock initial pool for featured ponders
        participants: 0,
      });
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Your ponder has been created successfully!',
          [{ text: 'OK', onPress: () => onSuccess && onSuccess() }]
        );
        
        // Reset form
        setQuestion('');
        setOptions(['', '']);
        setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        setEntryAmounts([true, true, true, false]);
        setFeatured(false);
      } else {
        Alert.alert('Error', 'Failed to create ponder. Please try again.');
      }
    } catch (error) {
      console.error('Error creating ponder:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create a New Ponder</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Question</Text>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="Enter your prediction question"
          maxLength={100}
          multiline
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Options</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <TextInput
              style={styles.optionInput}
              value={option}
              onChangeText={(text) => handleOptionChange(text, index)}
              placeholder={`Option ${index + 1}`}
              maxLength={50}
            />
            {options.length > 2 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeOption(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {options.length < 5 && (
          <TouchableOpacity style={styles.addButton} onPress={addOption}>
            <Text style={styles.addButtonText}>+ Add Option</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="datetime"
            display="default"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Entry Amounts</Text>
        <View style={styles.entryAmountsContainer}>
          <View style={styles.entryAmountItem}>
            <Text style={styles.entryAmountText}>Free</Text>
            <Switch
              value={entryAmounts[0]}
              onValueChange={() => toggleEntryAmount(0)}
              trackColor={{ false: '#D1D1D1', true: '#4A80F0' }}
            />
          </View>
          
          <View style={styles.entryAmountItem}>
            <Text style={styles.entryAmountText}>$0.50</Text>
            <Switch
              value={entryAmounts[1]}
              onValueChange={() => toggleEntryAmount(1)}
              trackColor={{ false: '#D1D1D1', true: '#4A80F0' }}
            />
          </View>
          
          <View style={styles.entryAmountItem}>
            <Text style={styles.entryAmountText}>$1</Text>
            <Switch
              value={entryAmounts[2]}
              onValueChange={() => toggleEntryAmount(2)}
              trackColor={{ false: '#D1D1D1', true: '#4A80F0' }}
            />
          </View>
          
          <View style={styles.entryAmountItem}>
            <Text style={styles.entryAmountText}>$5</Text>
            <Switch
              value={entryAmounts[3]}
              onValueChange={() => toggleEntryAmount(3)}
              trackColor={{ false: '#D1D1D1', true: '#4A80F0' }}
            />
          </View>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.featuredContainer}>
          <Text style={styles.label}>Featured Ponder</Text>
          <Switch
            value={featured}
            onValueChange={setFeatured}
            trackColor={{ false: '#D1D1D1', true: '#FFD700' }}
          />
        </View>
        {featured && (
          <Text style={styles.featuredInfo}>
            Featured ponders are highlighted and start with a juiced pool!
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Ponder</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#4A80F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#4A80F0',
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
  },
  entryAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  entryAmountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  entryAmountText: {
    marginRight: 8,
    fontSize: 16,
  },
  featuredContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4A80F0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreatePonderForm;
