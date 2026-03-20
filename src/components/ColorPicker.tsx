import { View, Pressable, StyleSheet } from 'react-native';
import { MOMENT_COLORS } from '../constants/colors';
import { COLORS, BORDERS, SPACING } from '../constants/theme';

interface Props { selected: string; onSelect: (color: string) => void; }

export function ColorPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.grid}>
        {MOMENT_COLORS.map((color) => (
          <View key={color} style={selected === color ? styles.ringWrapper : undefined}>
            <Pressable
              style={[
                styles.swatch,
                { backgroundColor: color },
                selected === color && styles.selected,
              ]}
              onPress={() => onSelect(color)}
              accessibilityLabel={`Color ${color}`}
              accessibilityRole="button"
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowSm,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  selected: {
    borderWidth: 4,
    shadowOffset: BORDERS.shadowOffset,
    elevation: 4,
  },
  ringWrapper: {
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 2,
  },
});
