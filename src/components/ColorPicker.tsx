import { View, Pressable, StyleSheet } from 'react-native';
import { MOMENT_COLORS } from '../constants/colors';
import { COLORS, BORDERS, SPACING } from '../constants/theme';

interface Props { selected: string; onSelect: (color: string) => void; }

export function ColorPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {MOMENT_COLORS.map((color) => (
        <Pressable key={color} style={[styles.swatch, { backgroundColor: color }, selected === color && styles.selected]}
          onPress={() => onSelect(color)} accessibilityLabel={`Color ${color}`} accessibilityRole="button" />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  swatch: { width: 44, height: 44, borderWidth: BORDERS.width, borderColor: COLORS.border },
  selected: { shadowColor: BORDERS.shadowColor, shadowOffset: BORDERS.shadowOffset, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
});
