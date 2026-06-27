import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, Tabs } from 'expo-router';
import { PlatformPressable } from 'expo-router/build/react-navigation';
import { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';
import * as Icons from 'phosphor-react-native';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useResolveClassNames } from 'uniwind';

const HapticTab = (props: BottomTabBarButtonProps) => {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
    />
  );
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AddButton = () => {
  const pressed = useSharedValue(0);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/add-item');
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(pressed.value ? 0.88 : 1, {
          duration: 90,
          easing: Easing.out(Easing.quad),
        }),
      },
    ],
  }));

  return (
    <View className="flex-1 items-center justify-center">
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => (pressed.value = 1)}
        onPressOut={() => (pressed.value = 0)}
        style={[
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          },
          buttonStyle,
        ]}
        className="w-14 h-14 rounded-full bg-ink items-center justify-center bottom-2"
      >
        <Icons.PlusIcon color="#f3eee4" size={20} weight="bold" />
      </AnimatedPressable>
    </View>
  );
};

export default function AppLayout() {
  const contentStyle = useResolveClassNames('bg-cream');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: contentStyle,
        tabBarActiveTintColor: '#2e5c40', // forest
        tabBarInactiveTintColor: '#8a9483', // muted
        tabBarStyle: {
          backgroundColor: '#fbf8f1', // cream-light
          borderTopColor: '#e2dac9', // line
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
        },
        animation: 'none',
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Icons.HouseIcon
              color={color as string}
              size={size}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          title: 'Closet',
          tabBarIcon: ({ color, size, focused }) => (
            <Icons.CoatHangerIcon
              color={color as string}
              size={size}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size, focused }) => (
            <Icons.PlusCircleIcon
              color={color as string}
              size={size}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
          tabBarButton: AddButton,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size, focused }) => (
            <Icons.CalendarBlankIcon
              color={color as string}
              size={size}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color, size, focused }) => (
            <Icons.UserIcon
              color={color as string}
              size={size}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
