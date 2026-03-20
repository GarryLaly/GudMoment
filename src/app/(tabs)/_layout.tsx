import { Tabs } from 'expo-router';
import { SparkleIcon, GearSixIcon } from 'phosphor-react-native';
import { COLORS, BORDERS } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.onPrimary,
        tabBarInactiveTintColor: COLORS.onSurface,
        tabBarLabelStyle: { fontFamily: FONTS.monoBold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
        tabBarStyle: {
          borderTopWidth: BORDERS.width,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.surfaceContainerLowest,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarActiveBackgroundColor: COLORS.primaryContainer,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Moments',
          tabBarAccessibilityLabel: 'Moments tab',
          tabBarIcon: ({ color }) => <SparkleIcon size={24} color={color} weight="fill" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings tab',
          tabBarIcon: ({ color }) => <GearSixIcon size={24} color={color} weight="regular" />,
        }}
      />
    </Tabs>
  );
}
