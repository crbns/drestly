import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

// createAnimatedComponent yields a custom component that doesn't natively
// support className, so wrap it with withUniwind to restore it.
const AnimatedPressable = withUniwind(Animated.createAnimatedComponent(Pressable));

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  className?: string;
  scaleTo?: number;
  style?: ViewStyle;
};

// Pressable that scales down on press for tactile feedback: a snappy press-in
// and a slightly eased release, matching Button.tsx's fast-in / eased-out feel.
const PressableScale = ({
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: PressableScaleProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, {
          duration: 90,
          easing: Easing.out(Easing.quad),
        });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, {
          duration: 160,
          easing: Easing.out(Easing.cubic),
        });
        onPressOut?.(e);
      }}
      style={[animatedStyle, style]}
    />
  );
};

export default PressableScale;
