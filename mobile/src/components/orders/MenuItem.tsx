import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MenuItem as MenuItemType } from '../../types/api';
import { Colors, Radius, Spacing } from '../../theme/colors';
import { Typography } from '../../theme/typography';

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
  cartQuantity?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onAddToCart, cartQuantity = 0 }) => {
  const handleAddToCart = () => onAddToCart(item, 1);
  const handleIncrement = () => onAddToCart(item, cartQuantity + 1);
  const handleDecrement = () => { if (cartQuantity > 0) onAddToCart(item, cartQuantity - 1); };

  return (
    <View style={[s.container, !item.isAvailable && s.unavailable]}>
      <View style={s.content}>
        <View style={s.info}>
          <View style={s.header}>
            <Text style={s.name}>{item.name}</Text>
            {item.isExpress && (
              <View style={s.expressTag}>
                <Ionicons name="flash" size={10} color="#fff" />
                <Text style={s.expressText}>EXPRESS</Text>
              </View>
            )}
          </View>
          <Text style={s.description} numberOfLines={2}>{item.description}</Text>
          <View style={s.details}>
            <Text style={s.price}>₹{item.price}</Text>
            <View style={s.prepTime}>
              <Ionicons name="time" size={12} color={Colors.text.tertiary} />
              <Text style={s.prepTimeText}>{item.preparationTime} min</Text>
            </View>
          </View>
        </View>
        {item.image && <Image source={{ uri: item.image }} style={s.image} />}
      </View>
      <View style={s.actions}>
        {!item.isAvailable ? (
          <View style={s.unavailableBtn}><Text style={s.unavailableText}>Unavailable</Text></View>
        ) : cartQuantity === 0 ? (
          <TouchableOpacity style={s.addBtn} onPress={handleAddToCart}>
            <LinearGradient colors={Colors.gradients.goldCta} style={s.addBtnGrad}>
              <Text style={s.addBtnText}>ADD</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={s.qtyControls}>
            <TouchableOpacity style={s.qtyBtn} onPress={handleDecrement}><Ionicons name="remove" size={16} color={Colors.accent.primary} /></TouchableOpacity>
            <Text style={s.qty}>{cartQuantity}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={handleIncrement}><Ionicons name="add" size={16} color={Colors.accent.primary} /></TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { backgroundColor: Colors.background.card, borderRadius: Radius.lg, margin: 8, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border.primary },
  unavailable: { opacity: 0.5 },
  content: { flexDirection: 'row', marginBottom: 12 },
  info: { flex: 1, paddingRight: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  name: { ...Typography.label, color: Colors.text.primary, flex: 1 },
  expressTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 2 },
  expressText: { ...Typography.badge, color: '#fff', fontSize: 9 },
  description: { ...Typography.bodySm, color: Colors.text.secondary, marginBottom: 8, lineHeight: 18 },
  details: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { ...Typography.price, color: Colors.accent.primary, fontSize: 16 },
  prepTime: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  prepTimeText: { ...Typography.caption, color: Colors.text.tertiary },
  image: { width: 72, height: 72, borderRadius: Radius.md, backgroundColor: Colors.background.tertiary },
  actions: { alignItems: 'flex-end' },
  addBtn: { borderRadius: Radius.sm, overflow: 'hidden' },
  addBtnGrad: { paddingHorizontal: 22, paddingVertical: 8, borderRadius: Radius.sm },
  addBtnText: { ...Typography.label, color: Colors.background.primary, fontSize: 13 },
  unavailableBtn: { backgroundColor: Colors.background.tertiary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.sm },
  unavailableText: { ...Typography.caption, color: Colors.text.tertiary, fontWeight: '500' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.tertiary, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border.gold },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qty: { ...Typography.label, color: Colors.text.primary, marginHorizontal: 10, minWidth: 18, textAlign: 'center' },
});

export default MenuItem;
