import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GudMoment</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontFamily: FONTS.heading, fontSize: 32, color: COLORS.text },
});
