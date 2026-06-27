import { SessionProvider, useSession, useSessionLoading } from '@/ctx/session';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { Roboto_500Medium } from '@expo-google-fonts/roboto';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastivaProvider } from 'toastiva';
import { useResolveClassNames } from 'uniwind';
import '../global.css';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
});

// Toastiva toasts, themed to the Drestly design system (see src/global.css):
// a flat cream-light card with a line border and pine ink text. iOS blur is
// disabled so the toast reads as a raised surface like the rest of the app
// rather than a translucent overlay.
const TOAST_THEME = {
  // Per-state accent (icon tint). Success leans on the brand forest; error /
  // warning / info are desaturated so they stay distinguishable without
  // breaking the calm cream-and-green palette.
  colors: {
    success: '#2e5c40', // forest
    error: '#a8443a', // muted terracotta
    warning: '#c08a3e', // muted ochre
    info: '#557a86', // muted slate-teal
  },
  // Neutral surface tile behind every icon — the colored glyph carries the
  // state cue, so the badge stays a consistent flat chip.
  surfaceColors: {
    success: '#e7e1d3',
    error: '#e7e1d3',
    warning: '#e7e1d3',
    info: '#e7e1d3',
  },
};

const TOAST_STYLES = {
  title: { color: '#1c2b22', fontFamily: 'Inter-SemiBold' }, // ink
  description: { color: '#5c6a5b', fontFamily: 'Inter-Regular' }, // body
  meta: { color: '#8a9483', fontFamily: 'Inter-Regular' }, // muted
  badge: { backgroundColor: '#e7e1d3' }, // surface tile
  action: { backgroundColor: '#1c2b22' }, // primary (ink) button
  actionText: { color: '#fbf8f1', fontFamily: 'Inter-Medium' }, // cream on ink
  progressTrack: { backgroundColor: '#e2dac9' }, // line
  progressFill: { backgroundColor: '#2e5c40' }, // forest
};

export default function RootLayout() {
  // Keys must match the --font-* family names in global.css.
  const [loaded, error] = useFonts({
    'PlayfairDisplay-Medium': PlayfairDisplay_500Medium,
    'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Roboto-Medium': Roboto_500Medium,
  });

  // Splash is hidden inside RootNavigator once BOTH fonts and the first auth
  // check are ready — see below. Holding it here on fonts alone would paint the
  // landing screen before the persisted session resolves, then slide to /home.
  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <SafeAreaProvider>
          <ToastivaProvider
            position="top-center"
            fill="#fbf8f1"
            stroke="#e2dac9"
            disableIOSBlur
            theme={TOAST_THEME}
            styles={TOAST_STYLES}
          >
            <RootNavigator />
          </ToastivaProvider>
        </SafeAreaProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
}

const RootNavigator = () => {
  const session = useSession();
  const isLoading = useSessionLoading();
  const contentStyle = useResolveClassNames('bg-cream');
  const addItemContentStyle = useResolveClassNames('bg-ink');

  // Keep the splash up until the persisted session check resolves, then hide it
  // on the same frame the correct screen mounts — so a cold-started signed-in
  // user lands on /home with no landing flash and no slide.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        {/* animation could be "fade" but currently seeing it to "none" since
        I am not sure how many places actually trigger this animation */}
        <Stack.Screen name="(app)" options={{ animation: 'none' }} />
        <Stack.Screen
          name="add-item"
          options={{
            animation: 'simple_push',
            headerShown: false,
            contentStyle: addItemContentStyle,
          }}
        />
        <Stack.Screen
          name="image-processing"
          options={{
            animation: 'simple_push',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-to-closet"
          options={{
            animation: 'fade',
            headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
};
