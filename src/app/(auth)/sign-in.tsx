import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toastiva } from 'toastiva';
import { requestPasswordReset, signInWithEmail } from '@/utils/auth';
import { authErrorMessage } from '@/utils/authErrors';
import AuthStack from '../../components/AuthStack';
import FilledButton from '../../components/FilledButton';
import HorizontalTextSplit from '../../components/HorizontalTextSplit';
import InputField from '../../components/InputField';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (submitting) return;
    if (!email || !password) {
      toastiva.error('Enter your email and password');
      return;
    }
    setSubmitting(true);
    const { error } = await signInWithEmail(email, password);
    setSubmitting(false);
    if (error) {
      toastiva.error(authErrorMessage(error));
    }
    // On success, onAuthStateChange updates the session and the protected
    // route guard navigates into (app); no manual navigation needed.
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toastiva.error('Enter your email');
      return;
    }
    const { error } = await requestPasswordReset(email);
    if (error) {
      toastiva.error(authErrorMessage(error));
      return;
    }
    toastiva.success('Password reset link sent');
  };

  return (
    <SafeAreaView className="h-full">
      {/* FIXME: This TouchableWithoutFeedback only fires onPress when clicking in area around its child components. It doesn't fire when clicking on the empty space below them. */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} className="h-full">
        {/* Email / Password Section */}
        <View className="items-center mx-2xl">
          <Text className="font-display text-display text-ink">Drestly</Text>
          <Text className="font-medium text-body text-base mt-2 text-center">
            Welcome back.
          </Text>
          <InputField
            className="mt-10"
            title="Email address"
            inputType="email"
            placeholderText="hello@drestly.com"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            className="mt-lg"
            title="Password"
            inputType="password"
            placeholderText="Password"
            autoComplete="current-password"
            value={password}
            onChangeText={setPassword}
          />
          <View className="w-full items-end mt-sm">
            <Pressable onPress={handleForgotPassword}>
              <Text className="text-caption text-body">Forgot password?</Text>
            </Pressable>
          </View>
          <FilledButton
            className="mt-2xl"
            fillColor="primary"
            buttonText="Sign In"
            onClick={handleSignIn}
            isLoading={submitting}
          />
          <HorizontalTextSplit text="Or" className="my-xl" />
          <AuthStack type="SIGN_IN" />
          <Text className="mt-xl text-body text-center">
            Don&apos;t have an account yet?{' '}
            <Link href="/sign-up" replace>
              Sign Up
            </Link>
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignIn;
