import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import 'expo-sqlite/localStorage/install';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      flowType: 'pkce',
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      // React Native has no URL to read a session from; deep links are handled
      // manually via verifyOtp, so URL detection must stay off.
      detectSessionInUrl: false,
    },
  }
);

// autoRefreshToken only ticks while the app is foregrounded. Drive it from
// AppState so the token refreshes on resume and pauses in the background
// (Supabase's recommended React Native setup).
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
