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
  const opacity = useRef(new Animated.Value(1)).current;
  const fadeTo = (
    toValue: number,
    easing: (value: number) => number,
    duration: number
  ) =>
    Animated.timing(opacity, {
      toValue,
      duration,
      easing,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ opacity, alignSelf: 'stretch' }}>
      <Pressable
        onPress={onClick}
        onPressIn={() => fadeTo(0.8, Easing.linear, 15)}
        onPressOut={() => fadeTo(1, Easing.out(Easing.ease), 150)}
        className={`${className ?? ''} self-stretch min-h-12 items-center justify-center rounded-full ${disabled && 'opacity-50'}`}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size={16} color={'gray'} />
        ) : (
          <Text
            numberOfLines={1}
            className={`font-inter-semibold text-label ${textClassName ?? 'text-cream'}`}
          >
            {buttonText}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default Button;
