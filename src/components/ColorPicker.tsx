import { View, Pressable, StyleSheet } from 'react-native';
import { MOMENT_COLORS } from '../constants/colors';
import { BORDERS, SPACING } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface Props { selected: string; onSelect: (color: string) => void; }

export function ColorPicker({ selected, onSelect }: Props) {
  const { colors, borders } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.border, shadowColor: borders.shadowColor }]}>
      <View style={styles.grid}>
        {MOMENT_COLORS.map((color) => (
          <View key={color} style={selected === color ? [styles.ringWrapper, { borderColor: colors.border }] : undefined}>
            <Pressable
              style={[
                styles.swatch,
                { backgroundColor: color, borderColor: colors.border, shadowColor: borders.shadowColor },
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
    borderWidth: BORDERS.width,
    padding: SPACING.lg,
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
    padding: 2,
  },
});
