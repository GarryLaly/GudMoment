import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { FONTS } from '../constants/fonts';

export function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📅</Text>
      <Text style={styles.title}>No moments yet!</Text>
      <Text style={styles.subtitle}>Tap + to add your first special date</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emoji: { fontSize: 64, marginBottom: SPACING.md },
  title: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.textLight, textAlign: 'center' },
});
