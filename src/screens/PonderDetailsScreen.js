import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Share
} from 'react-native';
import { usePonders } from '../context/PonderContext';
import { useAuth } from '../context/AuthContext';
import VotingInterface from '../components/VotingInterface';
import { Ionicons } from '@expo/vector-icons';

const PonderDetailsScreen = ({ route, navigation }) => {
  const { ponderId } = route.params;
  const { ponders, userVotes } = usePonders();
  const { isLoggedIn, user } = useAuth();
  
  const [ponder, setPonder] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Mock comments data
  const [comments, setComments] = useState([
    {
      id: '1',
      user: {
        address: '0x12345',
        username: 'crypto_oracle',
      },
      text: 'I think this is going to be a close one!',
      timestamp: new Date().getTime() - 3600000, // 1 hour ago
      likes: 5,
    },
    {
      id: '2',
      user: {
        address: '0x67890',
        username: 'prediction_master',
      },
      text: 'The market indicators are pointing to a positive outcome.',
      timestamp: new Date().getTime() - 7200000, // 2 hours ago
      likes: 3,
    },
  ]);
  
  // Find the ponder and user vote
  useEffect(() => {
    const foundPonder = ponders.find(p => p.id === ponderId);
    if (foundPonder) {
      setPonder(foundPonder);
      
      if (isLoggedIn) {
        const foundVote = userVotes.find(v => v.ponderId === ponderId);
        if (foundVote) {
          setUserVote(foundVote);
        }
      }
    }
    setLoading(false);
  }, [ponderId, ponders, userVotes, isLoggedIn]);
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!ponder) return '';
    
    const now = new Date().getTime();
    const timeLeft = ponder.endTime - now;
    
    if (timeLeft <= 0) {
      return 'Ended';
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} days, ${hours} hours remaining`;
    } else if (hours > 0) {
      return `${hours} hours, ${minutes} minutes remaining`;
    } else {
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      return `${minutes} minutes, ${seconds} seconds remaining`;
    }
  };
  
  // Format timestamp for comments
  const formatTimestamp = (timestamp) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  };
  
  // Handle liking a comment
  const handleLikeComment = (commentId) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 } 
        : comment
    ));
  };
  
  // Handle sharing the ponder
  const handleShare = async () => {
    if (!ponder) return;
    
    try {
      await Share.share({
        message: `Check out this prediction on Flow Predictions: "${ponder.question}" - Vote now!`,
        // In a real app, you would include a deep link here
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A80F0" />
      </View>
    );
  }
  
  if (!ponder) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ponder not found</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.question}>{ponder.question}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.infoText}>${ponder.totalPool} pool</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{ponder.participants} participants</Text>
          </View>
        </View>
        
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.timeText}>{getTimeRemaining()}</Text>
        </View>
      </View>
      
      {userVote && (
        <View style={styles.userVoteContainer}>
          <Text style={styles.userVoteTitle}>Your Vote</Text>
          <View style={styles.userVoteDetails}>
            <Text style={styles.userVoteOption}>
              {ponder.options[userVote.optionIndex]}
            </Text>
            <Text style={styles.userVoteAmount}>
              ${userVote.amount}
            </Text>
            <View style={[
              styles.userVoteStatus,
              userVote.status === 'won' ? styles.wonStatus : 
              userVote.status === 'lost' ? styles.lostStatus : 
              styles.pendingStatus
            ]}>
              <Text style={styles.userVoteStatusText}>
                {userVote.status === 'won' ? 'Won' : 
                 userVote.status === 'lost' ? 'Lost' : 
                 'Pending'}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      <VotingInterface ponder={ponder} />
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowComments(!showComments)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#4A80F0" />
          <Text style={styles.actionText}>
            {showComments ? 'Hide Comments' : 'Show Comments'} ({comments.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={20} color="#4A80F0" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
      
      {showComments && (
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments</Text>
          
          {comments.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentUser}>
                {comment.user.username || `${comment.user.address.substring(0, 6)}...`}
              </Text>
              <Text style={styles.commentText}>{comment.text}</Text>
              <View style={styles.commentFooter}>
                <Text style={styles.commentTime}>
                  {formatTimestamp(comment.timestamp)}
                </Text>
                <TouchableOpacity 
                  style={styles.likeButton}
                  onPress={() => handleLikeComment(comment.id)}
                >
                  <Ionicons name="heart-outline" size={16} color="#666" />
                  <Text style={styles.likeCount}>{comment.likes}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {isLoggedIn ? (
            <View style={styles.commentInputContainer}>
              <Text style={styles.commentInputPlaceholder}>
                Add a comment...
              </Text>
            </View>
          ) : (
            <Text style={styles.commentLoginText}>
              Connect your wallet to comment
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#4A80F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 4,
    color: '#666',
    fontStyle: 'italic',
  },
  userVoteContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userVoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userVoteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userVoteOption: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  userVoteAmount: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 16,
  },
  userVoteStatus: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  pendingStatus: {
    backgroundColor: '#E0E0E0',
  },
  wonStatus: {
    backgroundColor: '#4CAF50',
  },
  lostStatus: {
    backgroundColor: '#F44336',
  },
  userVoteStatusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 12,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 8,
    color: '#4A80F0',
    fontWeight: '500',
  },
  commentsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  commentInputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  commentInputPlaceholder: {
    color: '#999',
  },
  commentLoginText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default PonderDetailsScreen;
