import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ElapsedTimeDisplay } from './ElapsedTimeDisplay';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS } from '../constants/fonts';
import type { Moment } from '../db/moments';

interface Props {
  moment: Moment;
  onPress: (id: string) => void;
}

export function MomentCard({ moment, onPress }: Props) {
  return (
    <Pressable onPress={() => onPress(moment.id)} style={styles.container}>
      <View style={[styles.stripe, { backgroundColor: moment.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{moment.emoji}</Text>
          <Text style={styles.title} numberOfLines={1}>{moment.title}</Text>
        </View>
        <ElapsedTimeDisplay date={moment.date} time={moment.time} size="sm" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderWidth: BORDERS.width, borderColor: COLORS.border,
    marginBottom: SPACING.md, marginHorizontal: SPACING.md,
    shadowColor: BORDERS.shadowColor, shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  stripe: { width: 8 },
  content: { flex: 1, padding: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  emoji: { fontSize: 24, marginRight: SPACING.sm },
  title: { fontFamily: FONTS.bodyBold, fontSize: 18, color: COLORS.text, flex: 1 },
});
