import { Link } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import { useState } from 'react';
import { Keyboard, Text, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toastiva } from 'toastiva';
import AuthStack from '../../../components/AuthStack';
import FilledButton from '../../../components/FilledButton';
import HorizontalTextSplit from '../../../components/HorizontalTextSplit';
import InputField from '../../../components/InputField';
import { signUpNewUser } from '../../../utils/auth';
import { authErrorMessage } from '../../../utils/authErrors';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (submitting) return;
    if (!fullName || !email || !password) {
      toastiva.error('Enter your name, email, and password');
      return;
    }
    setSubmitting(true);
    const { data, error } = await signUpNewUser(email, password, {
      data: { full_name: fullName },
    });
    setSubmitting(false);
    if (error) {
      toastiva.error(authErrorMessage(error));
      return;
    }
    if (!data.session) {
      // Email confirmation is on: no session yet. Prompt the user to verify.
      toastiva.success('Confirm your email to finish');
    }
    // If a session is returned (confirmation off), the route guard navigates.
  };

  return (
    <SafeAreaView className="h-full">
      {/* FIXME: This TouchableWithoutFeedback only fires onPress when clicking in area around its child components. It doesn't fire when clicking on the empty space below them. */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} className="h-full">
        {/* Email / Password Section */}
        <View className="items-center mx-2xl">
          <Text className="font-display text-display text-ink">Drestly</Text>
          <Text className="font-medium text-body text-base mt-2 text-center">
            Create your curated wardrobe account.
          </Text>

          <InputField
            className="mt-10"
            title="Full name"
            placeholderText="John Smith"
            autoComplete="name"
            icon={Icons.UserIcon}
            value={fullName}
            onChangeText={setFullName}
          />
          <InputField
            className="mt-lg"
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
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />
          <FilledButton
            className="mt-2xl"
            fillColor="primary"
            buttonText="Get Started"
            onClick={handleSignUp}
            isLoading={submitting}
          />
          <HorizontalTextSplit text="Or" className="my-xl" />

          <AuthStack type="SIGN_UP" />
          <Text className="mt-xl text-body text-center">
            Already have an account?{' '}
            <Link href="/sign-in" replace>
              Log In
            </Link>
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignUp;
