import { View, Pressable, Text, StyleSheet } from 'react-native';
import { EMOJI_PRESETS } from '../constants/colors';
import { BORDERS, SPACING } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface Props { selected: string; onSelect: (emoji: string) => void; }

const COLUMNS = 4;

export function EmojiPicker({ selected, onSelect }: Props) {
  const { colors, borders } = useTheme();

  // Build rows of 4
  const rows: string[][] = [];
  for (let i = 0; i < EMOJI_PRESETS.length; i += COLUMNS) {
    rows.push(EMOJI_PRESETS.slice(i, i + COLUMNS) as unknown as string[]);
  }

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.border, shadowColor: borders.shadowColor }]}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((emoji) => (
            <Pressable
              key={emoji}
              style={[
                styles.cell,
                { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
                selected === emoji && [styles.selected, { backgroundColor: colors.accentYellow, borderColor: colors.border }],
              ]}
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
    gap: 1,
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
    borderWidth: 1,
  },
  selected: {
    borderWidth: BORDERS.width,
  },
  emoji: { fontSize: 30 },
});
