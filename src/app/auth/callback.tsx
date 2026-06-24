import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AuthCallback = () => {
  return (
    <SafeAreaView className="h-full">
      <View className="flex-1 items-center justify-center mx-2xl">
        <Text className="font-display text-display text-ink">Drestly</Text>
        <Text className="font-medium text-body text-base mt-2 text-center">
          Confirming your email…
        </Text>
        <View className="mt-lg">
          <ActivityIndicator color="#1c2b22" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AuthCallback;
