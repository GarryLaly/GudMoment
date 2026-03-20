import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SparkleIcon, ClockCounterClockwiseIcon, ArrowDownIcon } from 'phosphor-react-native';
import { COLORS, SPACING, BORDERS } from '../constants/theme';
import { FONTS, TYPOGRAPHY } from '../constants/fonts';

export function EmptyState() {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounceAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.iconArea}>
        <View style={styles.yellowSquare}>
          <SparkleIcon size={80} color={COLORS.border} weight="bold" />
        </View>
        <View style={styles.tealSquare}>
          <ClockCounterClockwiseIcon size={32} color={COLORS.border} weight="bold" />
        </View>
      </View>

      <Text style={styles.title}>No moments yet?</Text>
      <Text style={styles.body}>
        Capture a memory and let the clock start ticking!
      </Text>

      <Animated.View style={[styles.bounceRow, { transform: [{ translateY: bounceAnim }] }]}>
        <Text style={styles.bounceText}>Let's make one!</Text>
        <ArrowDownIcon size={20} color={COLORS.primary} weight="bold" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.page,
  },
  iconArea: {
    width: 192,
    height: 192,
    marginBottom: SPACING.lg,
  },
  yellowSquare: {
    width: 192,
    height: 192,
    backgroundColor: '#FFE66D',
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    transform: [{ rotate: '3deg' }],
  },
  tealSquare: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 96,
    height: 96,
    backgroundColor: '#4ECDC4',
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowSm,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    transform: [{ rotate: '-12deg' }],
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  body: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  bounceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bounceText: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.primary,
  },
});
