import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

const ASPECT_RATIO = 2400 / 1398;
const GAP = 8;
const PADDING = 12;

export default function BrochurePage({ page, onPress }) {
  const { width } = useWindowDimensions();
  const tileWidth = (width - PADDING * 2 - GAP) / 2;
  const tileHeight = tileWidth * ASPECT_RATIO;

  return (
    <TouchableOpacity
      style={[styles.container, { width: tileWidth }]}
      onPress={() => onPress && onPress(page)}
      activeOpacity={0.8}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>p. {page.page_number}</Text>
      </View>
      <Image
        source={{ uri: page.image_url }}
        style={{ width: tileWidth, height: tileHeight }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(26,122,46,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
