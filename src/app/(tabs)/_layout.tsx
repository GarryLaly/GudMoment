import { Tabs } from 'expo-router';
import { SparkleIcon, GearSixIcon } from 'phosphor-react-native';
import { BORDERS } from '../../constants/theme';
import { FONTS } from '../../constants/fonts';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout() {
  const { colors, borders } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.onPrimary,
        tabBarInactiveTintColor: colors.onSurface,
        tabBarLabelStyle: { fontFamily: FONTS.monoBold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
        tabBarStyle: {
          borderTopWidth: BORDERS.width,
          borderTopColor: colors.border,
          backgroundColor: colors.surfaceContainerLowest,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarActiveBackgroundColor: colors.primaryContainer,
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
