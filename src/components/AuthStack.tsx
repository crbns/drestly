import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { Platform, Pressable, Text, View } from 'react-native';
import { supabase } from '@/utils/supabase';

type AuthStackProps = {
  type: 'SIGN_IN' | 'SIGN_UP';
};

const BUTTON_TYPE_MAP = {
  SIGN_IN: AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN,
  SIGN_UP: AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP,
} as const;

const AppleSignIn = ({ type }: AuthStackProps) => {
  return (
    <View className="w-full">
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={BUTTON_TYPE_MAP[type]}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={999}
        style={{ width: '100%', height: 48 }}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });

            // Sign in with Supabase Auth
            if (credential.identityToken) {
              const {
                error,
                data: { user },
              } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken,
              });
              console.log(JSON.stringify({ error, user }, null, 2));
              if (!error) {
                if (credential.fullName) {
                  const nameParts = [];
                  if (credential.fullName.givenName)
                    nameParts.push(credential.fullName.givenName);
                  if (credential.fullName.middleName)
                    nameParts.push(credential.fullName.middleName);
                  if (credential.fullName.familyName)
                    nameParts.push(credential.fullName.familyName);
                  const fullName = nameParts.join(' ');
                  await supabase.auth.updateUser({
                    data: {
                      full_name: fullName,
                      given_name: credential.fullName.givenName,
                      family_name: credential.fullName.familyName,
                    },
                  });
                }
                // We are now signed in
              }
            } else {
              throw new Error('No identityToken.');
            }
          } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELLED') {
              return;
            }
            if (error instanceof Error) {
              throw new Error(error.message);
            } else {
              throw new Error('An unknown error occured.');
            }
          }
        }}
      />
    </View>
  );
};

const GOOGLE_LABEL_MAP = {
  SIGN_IN: 'Sign in with Google',
  SIGN_UP: 'Sign up with Google',
} as const;

const GoogleAuthButton = ({ type }: AuthStackProps) => {
  GoogleSignin.configure({
    iosClientId:
      '919510031441-ubvmnhktm85fh2rgedncs49atbu3q05l.apps.googleusercontent.com',
    webClientId:
      '919510031441-ctimgu2l0d8hluhbh2i416kukhont8ug.apps.googleusercontent.com',
  });

  return (
    <Pressable
      className="h-12 w-full flex-row items-center justify-center gap-2.5 rounded-full bg-white"
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const res = await GoogleSignin.signIn();
          if (isSuccessResponse(res)) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: res.data.idToken!,
            });
            console.log(error, data);
          }
        } catch (error: any) {
          if (error.code === statusCodes.IN_PROGRESS) {
            // currently in progress
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            console.error('Play services not available or outdated.');
          } else {
            if (error instanceof Error) {
              console.error('Google Auth Error:', error.message);
            } else {
              throw new Error('An unknown error occured.');
            }
          }
        }
      }}
    >
      <Image
        source={require('@/assets/images/auth/Google_Favicon_2025.svg')}
        style={{ width: 18, height: 18 }}
        contentFit="contain"
      />
      <Text
        className="text-lg text-black"
        style={{ fontFamily: 'Roboto-Regular', transform: [{ translateY: 0 }] }}
      >
        {GOOGLE_LABEL_MAP[type]}
      </Text>
    </Pressable>
  );
};

const AuthStack = ({ type }: AuthStackProps) => {
  return (
    <View className="w-full gap-3">
      <GoogleAuthButton type={type} />
      {Platform.OS === 'ios' && <AppleSignIn type={type} />}
    </View>
  );
};

export default AuthStack;
