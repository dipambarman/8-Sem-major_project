import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, StatusBar, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem as MenuItemType } from '../../types/api';
import MenuItem from '../../components/orders/MenuItem';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { menuApi } from '../../services/api/menuApi';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MenuItemType[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItemType[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(['biryani', 'sandwich', 'chai', 'thali']);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const FILTER_OPTIONS = ['all', 'Beverages', 'Snacks', 'Main Course', 'Desserts', 'Breakfast'];

  useEffect(() => {
    // Load all menu items once
    loadMenuItems();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchItems(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedFilter]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const res = await menuApi.getMenu();
      if (res.success && res.data) {
        setAllMenuItems(res.data);
      }
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchItems = (query: string) => {
    const filtered = allMenuItems.filter(item => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        (item.description?.toLowerCase() || '').includes(query.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || item.category === selectedFilter;
      
      return matchesQuery && matchesFilter && item.isAvailable;
    });
    
    setSearchResults(filtered);
  };

  const handleAddToCart = (item: MenuItemType, qty: number) => {
    if (qty <= 0) return;
    dispatch(addToCart({ ...item, quantity: qty }));
  };

  const handleRecentSearch = (term: string) => {
    setSearchQuery(term);
    // Add to recent searches (max 5)
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== term);
      return [term, ...filtered].slice(0, 5);
    });
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <View style={[s.searchBar, isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center', borderBottomWidth: 0 }]}>
        <View style={s.inputRow}>
          <Ionicons name="search" size={18} color={Colors.text.tertiary} />
          <TextInput 
            style={s.input} 
            placeholder="Search dishes..." 
            placeholderTextColor={Colors.text.tertiary} 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
            autoFocus 
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Options */}
      {searchQuery.trim().length > 0 && (
        <View style={s.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTER_OPTIONS}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.filterChip, selectedFilter === item && s.filterChipActive]}
                onPress={() => setSelectedFilter(item)}
              >
                <Text style={[s.filterText, selectedFilter === item && s.filterTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={s.filterScroll}
          />
        </View>
      )}

      <View style={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center', flex: 1 }]}>
        {searchQuery.trim().length === 0 ? (
          <View style={s.recent}>
            <Text style={s.recentTitle}>Recent Searches</Text>
            <FlatList 
              data={recentSearches} 
              keyExtractor={i => i} 
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={s.recentItem} 
                  onPress={() => handleRecentSearch(item)}
                >
                  <Ionicons name="time" size={16} color={Colors.text.tertiary} />
                  <Text style={s.recentText}>{item}</Text>
                </TouchableOpacity>
              )} 
            />
          </View>
        ) : (
          <FlatList 
            data={searchResults} 
            keyExtractor={i => i.id} 
            renderItem={({ item }) => <MenuItem item={item} onAddToCart={handleAddToCart} />} 
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Ionicons name={loading ? "hourglass" : "search"} size={48} color={Colors.text.tertiary} />
                <Text style={s.emptyText}>
                  {loading ? 'Searching...' : 'No items found'}
                </Text>
              </View>
            } 
          />
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  searchBar: { paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border.primary },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.tertiary, borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 14, gap: 10, borderWidth: 1, borderColor: Colors.border.primary },
  input: { flex: 1, ...Typography.body, color: Colors.text.primary },
  
  // Filter styles
  filterContainer: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.primary },
  filterScroll: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md, backgroundColor: Colors.background.tertiary, borderWidth: 1, borderColor: Colors.border.primary },
  filterChipActive: { backgroundColor: Colors.accent.primary, borderColor: Colors.accent.primary },
  filterText: { ...Typography.caption, color: Colors.text.secondary },
  filterTextActive: { color: Colors.background.primary, fontWeight: '600' },
  
  recent: { padding: Spacing.xl },
  recentTitle: { ...Typography.h4, color: Colors.text.primary, marginBottom: Spacing.lg },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  recentText: { ...Typography.body, color: Colors.text.primary, textTransform: 'capitalize' },
  empty: { justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { ...Typography.h4, color: Colors.text.secondary, marginTop: 16 },
});

export default SearchScreen;
