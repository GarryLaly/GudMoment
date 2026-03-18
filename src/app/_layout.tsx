import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { FONTS } from '../constants/fonts';
import { MomentsProvider } from '../context/MomentsContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [FONTS.heading]: require('../../assets/fonts/FredokaOne-Regular.ttf'),
    [FONTS.mono]: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    [FONTS.monoBold]: require('../../assets/fonts/SpaceMono-Bold.ttf'),
    [FONTS.body]: require('../../assets/fonts/Nunito-Regular.ttf'),
    [FONTS.bodyBold]: require('../../assets/fonts/Nunito-Bold.ttf'),
    [FONTS.bodySemiBold]: require('../../assets/fonts/Nunito-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <MomentsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </MomentsProvider>
    </>
  );
}
