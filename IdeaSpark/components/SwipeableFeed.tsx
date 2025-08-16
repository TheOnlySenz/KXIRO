import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import IdeaCard from './IdeaCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SwipeableFeedProps {
  ideas: any[];
  currentUserRoles: string[];
  onReact: (ideaId: string, type: 'fire' | 'comment' | 'connect') => void;
  onConnect: (ideaId: string) => void;
  onSwipeLeft?: (ideaId: string) => void;
  onSwipeRight?: (ideaId: string) => void;
  onSwipeTop?: (ideaId: string) => void;
}

export default function SwipeableFeed({
  ideas,
  currentUserRoles,
  onReact,
  onConnect,
  onSwipeLeft,
  onSwipeRight,
  onSwipeTop,
}: SwipeableFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<Swiper<any>>(null);

  const handleSwipeLeft = (cardIndex: number) => {
    const idea = ideas[cardIndex];
    console.log('Swiped left (pass) on:', idea?.headline);
    onSwipeLeft?.(idea?.id);
  };

  const handleSwipeRight = (cardIndex: number) => {
    const idea = ideas[cardIndex];
    console.log('Swiped right (interested) on:', idea?.headline);
    onSwipeRight?.(idea?.id);
    // Auto-react with fire
    onReact(idea?.id, 'fire');
  };

  const handleSwipeTop = (cardIndex: number) => {
    const idea = ideas[cardIndex];
    console.log('Swiped up (super interested) on:', idea?.headline);
    onSwipeTop?.(idea?.id);
    // Auto-connect
    onConnect(idea?.id);
  };

  const renderCard = (idea: any, index: number) => {
    if (!idea) return null;

    return (
      <View style={styles.cardContainer}>
        <IdeaCard
          idea={idea}
          currentUserRoles={currentUserRoles}
          onReact={onReact}
          onConnect={onConnect}
        />
      </View>
    );
  };

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCardsContainer}>
      <Text style={styles.noMoreCardsEmoji}>🎉</Text>
      <Text style={styles.noMoreCardsTitle}>You're all caught up!</Text>
      <Text style={styles.noMoreCardsSubtitle}>
        Check back later for more amazing ideas
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => {
          // Reset to beginning or fetch more ideas
          setCurrentIndex(0);
          Alert.alert('Refreshed!', 'Starting over with new ideas');
        }}
      >
        <Text style={styles.refreshButtonText}>Start Over</Text>
      </TouchableOpacity>
    </View>
  );

  if (ideas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>💡</Text>
        <Text style={styles.emptyTitle}>No ideas yet</Text>
        <Text style={styles.emptySubtitle}>Be the first to share an idea!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={ideas}
        renderCard={renderCard}
        onSwipedLeft={handleSwipeLeft}
        onSwipedRight={handleSwipeRight}
        onSwipedTop={handleSwipeTop}
        onSwipedAll={() => console.log('All cards swiped')}
        cardIndex={currentIndex}
        backgroundColor="transparent"
        stackSize={2}
        stackSeparation={15}
        stackScale={0.95}
        animateCardOpacity
        swipeBackCard
        verticalSwipe={true}
        horizontalSwipe={true}
        cardVerticalMargin={20}
        cardHorizontalMargin={10}
        renderNoMoreCards={renderNoMoreCards}
        overlayLabels={{
          left: {
            title: 'PASS',
            style: {
              label: {
                backgroundColor: '#ff6b6b',
                color: 'white',
                fontSize: 24,
                fontWeight: 'bold',
                borderRadius: 10,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 20,
                marginLeft: -20,
              },
            },
          },
          right: {
            title: 'INTERESTED',
            style: {
              label: {
                backgroundColor: '#4ecdc4',
                color: 'white',
                fontSize: 24,
                fontWeight: 'bold',
                borderRadius: 10,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 20,
                marginLeft: 20,
              },
            },
          },
          top: {
            title: 'CONNECT!',
            style: {
              label: {
                backgroundColor: '#45b7d1',
                color: 'white',
                fontSize: 24,
                fontWeight: 'bold',
                borderRadius: 10,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
          },
        }}
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Text style={styles.actionButtonText}>❌</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.connectButton]}
          onPress={() => swiperRef.current?.swipeTop()}
        >
          <Text style={styles.actionButtonText}>⚡</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Text style={styles.actionButtonText}>🔥</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          ← Pass • ↑ Connect • → Interested
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noMoreCardsEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  noMoreCardsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  noMoreCardsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    gap: 30,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  passButton: {
    backgroundColor: '#ff6b6b',
  },
  connectButton: {
    backgroundColor: '#45b7d1',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  likeButton: {
    backgroundColor: '#4ecdc4',
  },
  actionButtonText: {
    fontSize: 24,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});