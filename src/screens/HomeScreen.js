import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { usePonders } from '../context/PonderContext';
import PonderCard from '../components/PonderCard';
import WalletConnect from '../components/WalletConnect';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { ponders, featuredPonders, loading, fetchPonders } = usePonders();
  
  useEffect(() => {
    fetchPonders();
  }, []);
  
  const handleRefresh = () => {
    fetchPonders();
  };
  
  const renderPonderItem = ({ item }) => (
    <PonderCard ponder={item} />
  );
  
  const renderFeaturedPonderItem = ({ item }) => (
    <PonderCard ponder={item} featured={true} />
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Flow Predictions</Text>
        <WalletConnect />
      </View>
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {featuredPonders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Ponders</Text>
              <Text style={styles.sectionSubtitle}>Juiced pools!</Text>
            </View>
            
            <FlatList
              data={featuredPonders}
              renderItem={renderFeaturedPonderItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              snapToAlignment="start"
              decelerationRate="fast"
              snapToInterval={300}
            />
          </View>
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Ponders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Create')}>
              <View style={styles.createButton}>
                <Ionicons name="add" size={16} color="#4A80F0" />
                <Text style={styles.createButtonText}>Create</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {ponders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No ponders available</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Create')}
              >
                <Text style={styles.emptyButtonText}>Create the first one!</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pondersList}>
              {ponders.map((ponder) => (
                <PonderCard key={ponder.id} ponder={ponder} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  featuredList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6EEFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  createButtonText: {
    color: '#4A80F0',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#4A80F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pondersList: {
    paddingBottom: 16,
  },
});

export default HomeScreen;
