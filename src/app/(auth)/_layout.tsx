import { Stack } from "expo-router";
import { useResolveClassNames } from "uniwind";

export default function AuthLayout() {
  const contentStyle = useResolveClassNames("bg-cream");
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
