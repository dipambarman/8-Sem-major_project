import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, StatusBar, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem as MenuItemType } from '../../types/api';
import MenuItem from '../../components/orders/MenuItem';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MenuItemType[]>([]);
  const [recentSearches] = useState<string[]>(['biryani', 'sandwich', 'chai', 'thali']);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    if (searchQuery.trim().length > 2) { searchItems(searchQuery); }
    else { setSearchResults([]); }
  }, [searchQuery]);

  const searchItems = async (query: string) => {
    setLoading(true);
    try {
      const mockResults: MenuItemType[] = [
        { id: '1', vendorId: '1', name: 'Chicken Biryani', description: 'Aromatic basmati rice', price: 150, category: 'Main Course', isAvailable: true, preparationTime: 25, isExpress: false },
      ].filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(mockResults);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddToCart = (item: MenuItemType, qty: number) => {
    if (qty <= 0) return;
    dispatch(addToCart({ ...item, quantity: qty }));
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />
      <View style={[s.searchBar, isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center', borderBottomWidth: 0 }]}>
        <View style={s.inputRow}>
          <Ionicons name="search" size={18} color={Colors.text.tertiary} />
          <TextInput style={s.input} placeholder="Search dishes..." placeholderTextColor={Colors.text.tertiary} value={searchQuery} onChangeText={setSearchQuery} autoFocus />
          {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color={Colors.text.tertiary} /></TouchableOpacity>}
        </View>
      </View>
      <View style={[isTablet && { width: '100%', maxWidth: 800, alignSelf: 'center', flex: 1 }]}>
        {searchQuery.trim().length === 0 ? (
          <View style={s.recent}>
            <Text style={s.recentTitle}>Recent Searches</Text>
            <FlatList data={recentSearches} keyExtractor={i => i} renderItem={({ item }) => (
              <TouchableOpacity style={s.recentItem} onPress={() => setSearchQuery(item)}>
                <Ionicons name="time" size={16} color={Colors.text.tertiary} />
                <Text style={s.recentText}>{item}</Text>
              </TouchableOpacity>
            )} />
          </View>
        ) : (
          <FlatList data={searchResults} keyExtractor={i => i.id} renderItem={({ item }) => <MenuItem item={item} onAddToCart={handleAddToCart} />} contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={<View style={s.empty}><Ionicons name={loading ? "hourglass" : "search"} size={48} color={Colors.text.tertiary} /><Text style={s.emptyText}>{loading ? 'Searching...' : 'No items found'}</Text></View>} />
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
  recent: { padding: Spacing.xl },
  recentTitle: { ...Typography.h4, color: Colors.text.primary, marginBottom: Spacing.lg },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  recentText: { ...Typography.body, color: Colors.text.primary, textTransform: 'capitalize' },
  empty: { justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { ...Typography.h4, color: Colors.text.secondary, marginTop: 16 },
});

export default SearchScreen;
