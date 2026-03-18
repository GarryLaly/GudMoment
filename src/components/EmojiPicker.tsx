import { View, Pressable, Text, StyleSheet } from 'react-native';
import { EMOJI_PRESETS } from '../constants/colors';
import { COLORS, SPACING } from '../constants/theme';

interface Props { selected: string; onSelect: (emoji: string) => void; }

export function EmojiPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {EMOJI_PRESETS.map((emoji) => (
        <Pressable key={emoji} style={[styles.cell, selected === emoji && styles.selected]} onPress={() => onSelect(emoji)}>
          <Text style={styles.emoji}>{emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cell: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  selected: { borderColor: COLORS.border, backgroundColor: COLORS.accent },
  emoji: { fontSize: 28 },
});
