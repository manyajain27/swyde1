import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CategoryProps {
  onCategorySelect: (categoryId: string | null) => void;
}

const Categories: React.FC<CategoryProps> = ({ onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('foryou');
  
  const categories = [
    { id: 'foryou', name: 'For you', icon: 'sparkles', type: 'ionicon' },
    { id: 'dining', name: 'Dining', icon: 'silverware-fork-knife', type: 'material' },
    { id: 'cafe', name: 'Cafés', icon: 'coffee', type: 'font-awesome' },
    { id: 'bar', name: 'Bars', icon: 'wine-glass-alt', type: 'font-awesome' },
    { id: 'dessert', name: 'Desserts', icon: 'cake', type: 'material' },
    { id: 'events', name: 'Events', icon: 'music', type: 'material' },
    { id: 'movies', name: 'Movies', icon: 'film', type: 'font-awesome' },
  ];

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategorySelect(categoryId === 'foryou' ? null : categoryId);
  }, [onCategorySelect]);

  const renderIcon = (category: { id: string, icon: string, type: string }, isSelected: boolean) => {
    const color = isSelected ? '#FFFFFF' : getCategoryColor(category.id);
    const size = 24;

    switch (category.type) {
      case 'ionicon':
        return <Ionicons name={category.icon as any} size={size} color={color} />;
      case 'material':
        return <MaterialCommunityIcons name={category.icon as any} size={size} color={color} />;
      case 'font-awesome':
        return <FontAwesome5 name={category.icon as any} size={size} color={color} />;
      default:
        return null;
    }
  };

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case 'foryou': return '#7D55FF';
      case 'dining': return '#FF6B7A';
      case 'cafe': return '#FF9E3E';
      case 'bar': return '#A0E86F';
      case 'dessert': return '#FF7EB3';
      case 'events': return '#FFDE59';
      case 'movies': return '#59C1FF';
      default: return '#AAAAAA';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const backgroundColor = isSelected ? getCategoryColor(category.id) : 'none';
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                { backgroundColor }
              ]}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress(category.id)}
            >
              <View style={styles.iconContainer}>
                {renderIcon(category, isSelected)}
              </View>
              <Text style={[
                styles.categoryText,
                isSelected && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    marginBottom: 15,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryItem: {
    width: width / 5,
    height: width / 5,
    marginRight: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    marginBottom: 6,
    height: 26,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedCategoryText: {
    fontWeight: '700',
  },
});

export default Categories;