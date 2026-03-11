import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem as MenuItemType } from '../../types/api';
import MenuItem from '../../components/orders/MenuItem';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MenuItemType[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'biryani', 'sandwich', 'chai', 'thali'
  ]);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      searchItems(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchItems = async (query: string) => {
    setLoading(true);
    try {
      // Mock search - replace with actual API call
      const mockResults: MenuItemType[] = [
        {
          id: '1',
          vendorId: '1',
          name: 'Chicken Biryani',
          description: 'Aromatic basmati rice with tender chicken pieces',
          price: 150,
          category: 'Main Course',
          isAvailable: true,
          preparationTime: 25,
          isExpress: false,
        },
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToCart = (item: MenuItemType, quantity: number) => {
    if (quantity <= 0) return;
    dispatch(addToCart({ item, quantity }));
  };

  const renderRecentSearch = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearch(item)}
    >
      <Ionicons name="time" size={16} color="#666" />
      <Text style={styles.recentSearchText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.trim().length === 0 ? (
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <FlatList
            data={recentSearches}
            renderItem={renderRecentSearch}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuItem
              item={item}
              onAddToCart={handleAddToCart}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons 
                name={loading ? "hourglass" : "search"} 
                size={64} 
                color="#ccc" 
              />
              <Text style={styles.emptyText}>
                {loading ? 'Searching...' : 'No items found'}
              </Text>
              {!loading && searchQuery.length > 2 && (
                <Text style={styles.emptySubtext}>
                  Try searching with different keywords
                </Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  recentContainer: {
    padding: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  recentSearchText: {
    fontSize: 16,
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SearchScreen;
