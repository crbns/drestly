import { EmailOtpType } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

// Universal-link landing for Supabase auth emails. The OS opens the app on this
// https URL (registered in app.json associatedDomains / android intentFilters)
// rather than a drestly:// scheme — custom schemes get stripped by email
// clients (Gmail) and Supabase's template engine (ZgotmplZ). SessionProvider
// reads token_hash off the URL and calls verifyOtp; the per-template `type`
// (signup | recovery) drives where it navigates afterward.
const authCallbackUrl = 'https://drestly.com/auth/callback';

export const signUpNewUser = async (
  email: string,
  password: string,
  options?: any
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: authCallbackUrl, ...options },
  });
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Exchanges a Supabase email deep link for a session on-device (PKCE: token_hash
// → verifyOtp).
export const exchangeDeepLinkSession = async (url: string) => {
  const { queryParams } = Linking.parse(url);
  const tokenHash = queryParams?.token_hash;
  const type = queryParams?.type;
  if (!tokenHash || !type) return null;

  const { error } = await supabase.auth.verifyOtp({
    token_hash: String(tokenHash),
    type: type as EmailOtpType,
  });
  return { type: type as EmailOtpType, error };
};

export const requestPasswordReset = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authCallbackUrl,
  });
  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};
