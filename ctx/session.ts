import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toastiva } from 'toastiva';
import { exchangeDeepLinkSession } from '../utils/auth';
import { supabase } from '../utils/supabase';

type SessionState = { session: Session | null; isLoading: boolean };

const SessionContext = createContext<SessionState>({
  session: null,
  isLoading: true,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // True until Supabase has restored (or confirmed the absence of) a persisted
  // session. The root layout holds the splash screen up while this is true so
  // the first painted frame already routes to the correct screen — no landing
  // flash, no slide into /home on cold start.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // The first callback is INITIAL_SESSION — the persisted check is done.
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const url = Linking.useLinkingURL();
  const handledUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!url || handledUrl.current === url) return;
    handledUrl.current = url;

    const handleDeepLink = async () => {
      const result = await exchangeDeepLinkSession(url);
      if (!result) return; // not an auth deep link

      const { type, error } = result;
      if (error) {
        // if there is already a session, the user is logged in.
        // token in email is likely invalid.
        //
        // should not trigger during a failed password recovery since
        // user likely doesn't have an active session
        const {
          data: { session: current },
        } = await supabase.auth.getSession();

        if (current) {
          router.replace('/home');
          return;
        }

        toastiva.error(
          type === 'recovery' ? 'Reset link expired' : 'Could not confirm email'
        );
        router.replace('/sign-in');
        return;
      }

      // Recovery: the https callback path no longer matches the reset-password
      // route, so navigate to the form explicitly (verifyOtp already set the
      // recovery session above). Signup: land on /home.
      if (type === 'recovery') {
        router.replace('/reset-password');
      } else {
        toastiva.success('Email confirmed');
        router.replace('/home');
      }
    };

    handleDeepLink();
  }, [url]);

  return createElement(
    SessionContext.Provider,
    { value: { session, isLoading } },
    children
  );
}

export function useSession(): Session | null {
  return useContext(SessionContext).session;
}

// True until the first persisted-session check resolves. Used by the root
// layout to gate the splash screen.
export function useSessionLoading(): boolean {
  return useContext(SessionContext).isLoading;
}
