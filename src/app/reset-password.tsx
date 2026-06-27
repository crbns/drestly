import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Text, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toastiva } from 'toastiva';
import { updatePassword } from '@/utils/auth';
import { authErrorMessage } from '@/utils/authErrors';
import FilledButton from '../components/FilledButton';
import InputField from '../components/InputField';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleResetPassword = async () => {
    if (submitting) return;
    if (!password || !confirmPassword) {
      toastiva.error('Enter and confirm your new password');
      return;
    }
    if (password !== confirmPassword) {
      toastiva.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) {
      toastiva.error(authErrorMessage(error));
      return;
    }
    toastiva.success('Password updated');
    router.replace('/home');
  };

  return (
    <SafeAreaView className="h-full">
      {/* FIXME: This TouchableWithoutFeedback only fires onPress when clicking in area around its child components. It doesn't fire when clicking on the empty space below them. */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} className="h-full">
        {/* New Password Section */}
        <View className="items-center mx-2xl">
          <Text className="font-display text-display text-ink">Drestly</Text>
          <Text className="font-medium text-body text-base mt-2 text-center">
            Set a new password.
          </Text>
          <InputField
            className="mt-10"
            title="New password"
            inputType="password"
            placeholderText="Password"
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />
          <InputField
            className="mt-lg"
            title="Confirm password"
            inputType="password"
            placeholderText="Confirm password"
            autoComplete="new-password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <FilledButton
            className="mt-2xl"
            fillColor="primary"
            buttonText="Reset Password"
            onClick={handleResetPassword}
            isLoading={submitting}
          />
          <Text className="mt-xl text-body text-center">
            Remembered your password?{' '}
            <Link href="/sign-in" replace>
              Log In
            </Link>
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ResetPassword;
