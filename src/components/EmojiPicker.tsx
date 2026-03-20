import { View, Pressable, Text, StyleSheet } from 'react-native';
import { EMOJI_PRESETS } from '../constants/colors';
import { COLORS, BORDERS, SPACING } from '../constants/theme';

interface Props { selected: string; onSelect: (emoji: string) => void; }

const COLUMNS = 4;

export function EmojiPicker({ selected, onSelect }: Props) {
  // Build rows of 4
  const rows: string[][] = [];
  for (let i = 0; i < EMOJI_PRESETS.length; i += COLUMNS) {
    rows.push(EMOJI_PRESETS.slice(i, i + COLUMNS) as unknown as string[]);
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((emoji) => (
            <Pressable
              key={emoji}
              style={[styles.cell, selected === emoji && styles.selected]}
              onPress={() => onSelect(emoji)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.border,
    gap: 1,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 1,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  selected: {
    backgroundColor: COLORS.accentYellow,
    borderColor: COLORS.border,
    borderWidth: BORDERS.width,
  },
  emoji: { fontSize: 30 },
});
