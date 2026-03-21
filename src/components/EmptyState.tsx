import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SparkleIcon, ClockCounterClockwiseIcon, ArrowDownIcon } from 'phosphor-react-native';
import { SPACING, BORDERS } from '../constants/theme';
import { FONTS, TYPOGRAPHY } from '../constants/fonts';
import { useTheme } from '../hooks/useTheme';

export function EmptyState() {
  const { colors, borders } = useTheme();
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
        <View style={[styles.yellowSquare, { borderColor: colors.border, shadowColor: borders.shadowColor }]}>
          <SparkleIcon size={80} color={colors.border} weight="bold" />
        </View>
        <View style={[styles.tealSquare, { borderColor: colors.border, shadowColor: borders.shadowColor }]}>
          <ClockCounterClockwiseIcon size={32} color={colors.border} weight="bold" />
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>No moments yet?</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        Capture a memory and let the clock start ticking!
      </Text>

      <Animated.View style={[styles.bounceRow, { transform: [{ translateY: bounceAnim }] }]}>
        <Text style={[styles.bounceText, { color: colors.primary }]}>Let's make one!</Text>
        <ArrowDownIcon size={20} color={colors.primary} weight="bold" />
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
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: BORDERS.shadowSm,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    transform: [{ rotate: '-12deg' }],
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  body: {
    ...TYPOGRAPHY.body,
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
  },
});
