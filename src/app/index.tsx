import { LinearGradient } from 'expo-linear-gradient';
import { Href, Redirect, router } from 'expo-router';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '@/ctx/session';
import FilledButton from '../components/FilledButton';
import OutlineButton from '../components/OutlineButton';

export default function Index() {
  const session = useSession();
  const insets = useSafeAreaInsets();

  // `/` is shared: the marketing landing for logged-out visitors, but signed-in
  // users (cold start with a persisted session, or the guard bouncing them here
  // after auth) belong in the app.
  if (session) {
    // DX: a full JS reload restarts the router at `/`, so you always get bounced
    // to /home no matter which screen you were editing. In dev, point
    // EXPO_PUBLIC_DEV_INITIAL_ROUTE (e.g. "/add-item") at the screen you're
    // working on to land there on reload instead. No-op in production.
    const devRoute = __DEV__ && process.env.EXPO_PUBLIC_DEV_INITIAL_ROUTE;
    return <Redirect href={(devRoute || '/home') as Href} />;
  }

  return (
    <ImageBackground
      source={require('@/assets/images/index/closet.jpg')}
      resizeMode="cover"
      className="flex-1 px-2xl"
    >
      {/* Cream overlay: dims image 50% at top, fades to 0% (full image) at 2/3 down */}
      <LinearGradient
        colors={['rgba(243,238,228,0.6)', 'rgba(243,238,228,1)']}
        locations={[0.4, 0.9]}
        style={StyleSheet.absoluteFill}
      />
      <View
        className="flex-1 items-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="font-display text-display text-ink">Drestly</Text>

        <View className="w-full items-center mt-auto mb-10">
          <Text className="font-heading text-h1 mt-4 text-center">
            You already own your next outfit.
          </Text>
          <Text className="font-medium text-body text-base mt-2 text-center">
            Elevate your daily style with a personalized, curated digital
            wardrobe experience.
          </Text>
          <View className="w-full mt-15">
            <FilledButton
              fillColor="primary"
              buttonText="Get Started"
              onClick={() => {
                router.push('/sign-up');
              }}
            />
            <OutlineButton
              outlineColor="primary"
              buttonText="Log In"
              onClick={() => {
                router.push('/sign-in');
              }}
              className="mt-2"
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
