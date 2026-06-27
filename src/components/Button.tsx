import { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  PressableProps,
  Text,
} from 'react-native';

export type ButtonProps = {
  onClick: PressableProps['onPress'];
  className?: string;
  textClassName?: string;
  buttonText: string;
  disabled?: boolean;
  isLoading?: boolean;
};

const Button = ({
  onClick,
  className,
  textClassName,
  buttonText,
  isLoading,
  disabled,
}: ButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const animatePress = (
    scaleTo: number,
    easing: (value: number) => number,
    duration: number
  ) =>
    Animated.timing(scale, {
      toValue: scaleTo,
      duration,
      easing,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], alignSelf: 'stretch' }}>
      <Pressable
        onPress={onClick}
        onPressIn={() => animatePress(0.96, Easing.out(Easing.quad), 90)}
        onPressOut={() => animatePress(1, Easing.out(Easing.cubic), 160)}
        className={`${className ?? ''} self-stretch min-h-12 items-center justify-center rounded-full ${disabled ? 'opacity-50' : ''}`}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size={16} color={'gray'} />
        ) : (
          <Text
            numberOfLines={1}
            className={`font-inter-medium text-label ${textClassName ?? 'text-cream'}`}
          >
            {buttonText}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default Button;
