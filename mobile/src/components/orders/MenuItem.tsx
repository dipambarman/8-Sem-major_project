import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  
  const handleAddToCart = () => onAddToCart(item, 1);
  const handleIncrement = () => onAddToCart(item, cartQuantity + 1);
  const handleDecrement = () => { if (cartQuantity > 0) onAddToCart(item, cartQuantity - 1); };

  // Responsive image size
  const imageSize = isSmallScreen ? 60 : 72;

  return (
    <View style={[s.container, !item.isAvailable && s.unavailable]}>
      <View style={[s.content, isSmallScreen && s.contentSmall]}>
        <View style={s.info}>
          <View style={s.header}>
            <Text style={[s.name, isSmallScreen && s.nameSmall]} numberOfLines={2}>{item.name}</Text>
            {item.isExpress && (
              <View style={[s.expressTag, isSmallScreen && s.expressTagSmall]}>
                <Ionicons name="flash" size={isSmallScreen ? 8 : 10} color="#fff" />
                <Text style={[s.expressText, isSmallScreen && s.expressTextSmall]}>EXPRESS</Text>
              </View>
            )}
          </View>
          <Text style={[s.description, isSmallScreen && s.descriptionSmall]} numberOfLines={2}>{item.description}</Text>
          <View style={s.details}>
            <Text style={[s.price, isSmallScreen && s.priceSmall]}>₹{item.price}</Text>
            <View style={s.prepTime}>
              <Ionicons name="time" size={isSmallScreen ? 10 : 12} color={Colors.text.tertiary} />
              <Text style={[s.prepTimeText, isSmallScreen && s.prepTimeTextSmall]}>{item.preparationTime} min</Text>
            </View>
          </View>
        </View>
        {item.image && <Image source={{ uri: item.image }} style={[s.image, { width: imageSize, height: imageSize }]} />}
      </View>
      <View style={[s.actions, isSmallScreen && s.actionsSmall]}>
        {!item.isAvailable ? (
          <View style={[s.unavailableBtn, isSmallScreen && s.unavailableBtnSmall]}><Text style={[s.unavailableText, isSmallScreen && s.unavailableTextSmall]}>Unavailable</Text></View>
        ) : cartQuantity === 0 ? (
          <TouchableOpacity style={s.addBtn} onPress={handleAddToCart}>
            <LinearGradient colors={Colors.gradients.goldCta} style={[s.addBtnGrad, isSmallScreen && s.addBtnGradSmall]}>
              <Text style={[s.addBtnText, isSmallScreen && s.addBtnTextSmall]}>ADD</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={[s.qtyControls, isSmallScreen && s.qtyControlsSmall]}>
            <TouchableOpacity style={[s.qtyBtn, isSmallScreen && s.qtyBtnSmall]} onPress={handleDecrement}><Ionicons name="remove" size={isSmallScreen ? 14 : 16} color={Colors.accent.primary} /></TouchableOpacity>
            <Text style={[s.qty, isSmallScreen && s.qtySmall]}>{cartQuantity}</Text>
            <TouchableOpacity style={[s.qtyBtn, isSmallScreen && s.qtyBtnSmall]} onPress={handleIncrement}><Ionicons name="add" size={isSmallScreen ? 14 : 16} color={Colors.accent.primary} /></TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { 
    backgroundColor: Colors.background.card, 
    borderRadius: Radius.lg, 
    marginVertical: 8, 
    padding: Spacing.lg, 
    borderWidth: 1, 
    borderColor: Colors.border.primary 
  },
  unavailable: { opacity: 0.5 },
  content: { flexDirection: 'row', marginBottom: 12 },
  contentSmall: { marginBottom: 10 },
  info: { flex: 1, paddingRight: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  name: { ...Typography.label, color: Colors.text.primary, flex: 1, fontSize: 14 },
  nameSmall: { fontSize: 12 },
  expressTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 2, flexShrink: 0 },
  expressTagSmall: { paddingHorizontal: 4, paddingVertical: 1 },
  expressText: { ...Typography.badge, color: '#fff', fontSize: 9 },
  expressTextSmall: { fontSize: 7 },
  description: { ...Typography.bodySm, color: Colors.text.secondary, marginBottom: 8, lineHeight: 18, fontSize: 12 },
  descriptionSmall: { fontSize: 11, lineHeight: 16, marginBottom: 6 },
  details: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  price: { ...Typography.price, color: Colors.accent.primary, fontSize: 16, fontWeight: '700' },
  priceSmall: { fontSize: 14 },
  prepTime: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  prepTimeText: { ...Typography.caption, color: Colors.text.tertiary, fontSize: 11 },
  prepTimeTextSmall: { fontSize: 9 },
  image: { borderRadius: Radius.md, backgroundColor: Colors.background.tertiary },
  actions: { alignItems: 'flex-end' },
  actionsSmall: { marginTop: 8 },
  addBtn: { borderRadius: Radius.sm, overflow: 'hidden' },
  addBtnGrad: { paddingHorizontal: 22, paddingVertical: 8, borderRadius: Radius.sm },
  addBtnGradSmall: { paddingHorizontal: 16, paddingVertical: 6 },
  addBtnText: { ...Typography.label, color: Colors.background.primary, fontSize: 13 },
  addBtnTextSmall: { fontSize: 11 },
  unavailableBtn: { backgroundColor: Colors.background.tertiary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.sm },
  unavailableBtnSmall: { paddingHorizontal: 10, paddingVertical: 6 },
  unavailableText: { ...Typography.caption, color: Colors.text.tertiary, fontWeight: '500', fontSize: 12 },
  unavailableTextSmall: { fontSize: 10 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.tertiary, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border.gold },
  qtyControlsSmall: { borderRadius: Radius.sm },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyBtnSmall: { width: 28, height: 28 },
  qty: { ...Typography.label, color: Colors.text.primary, marginHorizontal: 10, minWidth: 18, textAlign: 'center', fontSize: 13 },
  qtySmall: { marginHorizontal: 8, minWidth: 16, fontSize: 11 },
});

export default MenuItem;
