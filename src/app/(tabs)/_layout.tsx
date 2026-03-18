import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: { fontFamily: FONTS.bodySemiBold, fontSize: 12 },
        tabBarStyle: { borderTopWidth: 3, borderTopColor: COLORS.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Moments', tabBarIcon: () => <Text style={{ fontSize: 24 }}>💝</Text> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: () => <Text style={{ fontSize: 24 }}>⚙️</Text> }} />
    </Tabs>
  );
}
