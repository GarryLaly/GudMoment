import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ElapsedTimeDisplay } from './ElapsedTimeDisplay';
import { COLORS, BORDERS, SPACING } from '../constants/theme';
import { FONTS, TYPOGRAPHY } from '../constants/fonts';
import type { Moment } from '../db/moments';

interface Props {
  moment: Moment;
  onPress: (id: string) => void;
  onLongPress?: () => void;
  disabled?: boolean;
}

export function MomentCard({ moment, onPress, onLongPress, disabled }: Props) {
  return (
    <Pressable
      onPress={() => onPress(moment.id)}
      onLongPress={onLongPress}
      disabled={disabled}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityLabel={moment.title}
      testID={`moment-card-${moment.id}`}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.stripe, { backgroundColor: moment.color }]} />
          <View style={styles.content}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{moment.emoji}</Text>
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.title} numberOfLines={1} accessibilityLabel={moment.title}>
                {moment.title}
              </Text>
              <ElapsedTimeDisplay date={moment.date} time={moment.time} size="sm" />
            </View>
            <View style={styles.dragDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.page,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  pressed: {
    shadowOffset: { width: 0, height: 0 },
    transform: [
      { translateX: 2 },
      { translateY: 2 },
    ],
  },
  stripe: {
    width: 16,
    borderRightWidth: BORDERS.width,
    borderRightColor: COLORS.border,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  emojiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    letterSpacing: -0.3,
    color: COLORS.text,
  },
  dragDots: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
});
