import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItem as MenuItemType } from '../../types/api';

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
  cartQuantity?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  onAddToCart,
  cartQuantity = 0,
}) => {
  const handleAddToCart = () => {
    onAddToCart(item, 1);
  };

  const handleIncrement = () => {
    onAddToCart(item, cartQuantity + 1);
  };

  const handleDecrement = () => {
    if (cartQuantity > 0) {
      onAddToCart(item, cartQuantity - 1);
    }
  };

  return (
    <View style={[styles.container, !item.isAvailable && styles.unavailable]}>
      <View style={styles.content}>
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.name}>{item.name}</Text>
            {item.isExpress && (
              <View style={styles.expressTag}>
                <Ionicons name="flash" size={12} color="#fff" />
                <Text style={styles.expressText}>EXPRESS</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.details}>
            <Text style={styles.price}>₹{item.price}</Text>
            <View style={styles.prepTime}>
              <Ionicons name="time" size={14} color="#666" />
              <Text style={styles.prepTimeText}>{item.preparationTime} min</Text>
            </View>
          </View>
        </View>

        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}
      </View>

      <View style={styles.actions}>
        {!item.isAvailable ? (
          <View style={styles.unavailableButton}>
            <Text style={styles.unavailableText}>Currently Unavailable</Text>
          </View>
        ) : cartQuantity === 0 ? (
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityControls}>
            <TouchableOpacity style={styles.quantityButton} onPress={handleDecrement}>
              <Ionicons name="remove" size={16} color="#007AFF" />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{cartQuantity}</Text>
            
            <TouchableOpacity style={styles.quantityButton} onPress={handleIncrement}>
              <Ionicons name="add" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unavailable: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  expressTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  expressText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  prepTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prepTimeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  actions: {
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  unavailableButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unavailableText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default MenuItem;
