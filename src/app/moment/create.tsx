import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { MomentForm } from '../../components/MomentForm';
import { useMoments } from '../../hooks/useMoments';
import { useTheme } from '../../hooks/useTheme';
import { COLORS, BORDERS, SPACING } from '../../constants/theme';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';

export default function CreateMomentScreen() {
  const { addMoment } = useMoments();
  const { colors, borders } = useTheme();
  const router = useRouter();
  const [backPressed, setBackPressed] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surfaceContainerLowest }]}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: colors.accentYellow, borderColor: colors.border, shadowColor: borders.shadowColor }, backPressed && styles.backBtnPressed]}
          onPress={() => router.back()}
          onPressIn={() => setBackPressed(true)}
          onPressOut={() => setBackPressed(false)}
        >
          <ArrowLeftIcon size={20} color={colors.onSurface} weight="bold" />
        </Pressable>

        <Text style={[styles.title, { color: colors.onSurface }]}>CREATE NEW{'\n'}MOMENT</Text>

        <View style={[styles.stepTag, { backgroundColor: colors.onSurface }]}>
          <Text style={[styles.stepText, { color: colors.onPrimary }]}>STEP{'\n'}01/01</Text>
        </View>
      </View>

      {/* Form (includes its own submit button) */}
      <MomentForm
        submitLabel="Save Moment"
        onSubmit={async (values) => {
          await addMoment(values);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.page,
    paddingVertical: SPACING.md,
    borderBottomWidth: BORDERS.width,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentYellow,
    borderWidth: BORDERS.width,
    borderColor: COLORS.border,
    shadowColor: BORDERS.shadowColor,
    shadowOffset: BORDERS.shadowOffset,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  backBtnPressed: {
    shadowOffset: BORDERS.pressedOffset,
    transform: [
      { translateX: BORDERS.pressedTranslate.x },
      { translateY: BORDERS.pressedTranslate.y },
    ],
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    letterSpacing: -0.5,
    color: COLORS.onSurface,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepTag: {
    backgroundColor: COLORS.onSurface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  stepText: {
    fontFamily: FONTS.monoBold,
    fontSize: 10,
    color: COLORS.onPrimary,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 14,
  },
});
