import * as Icons from 'phosphor-react-native';
import { useState } from 'react';
import { Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

type InputFieldProps = {
  icon?: React.ComponentType<Icons.IconProps>;
  iconRight?: React.ComponentType<Icons.IconProps>;
  title?: string;
  placeholderText?: string;
  inputType?: 'email' | 'password';
  className?: string;
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
  value: string;
  onChangeText: (text: string) => void;
};

const InputField = ({
  icon: IconComponent,
  iconRight: RightIconComponent,
  inputType,
  title,
  placeholderText,
  className,
  autoComplete,
  value,
  onChangeText,
}: InputFieldProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View className={`w-full ${className}`}>
      {title && (
        <Text className="font-body text-body text-left text-caption mb-sm ml-xs">
          {title}
        </Text>
      )}
      <View
        className={`flex-row gap-2 bg-field rounded-field border-2 border-line`}
      >
        <View className="justify-center ml-2">
          {inputType == 'email' && <Icons.EnvelopeSimpleIcon color="#5c6a5b" />}
          {IconComponent && <IconComponent color="#5c6a5b" />}
        </View>
        <TextInput
          className="flex-1 min-h-12"
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholderText ?? ''}
          autoComplete={autoComplete}
          secureTextEntry={inputType === 'password' && !passwordVisible}
        />
        {RightIconComponent && (
          <View className="mr-2">
            <RightIconComponent color="#5c6a5b" />
          </View>
        )}
        {inputType == 'password' && (
          <View className="justify-center mr-2">
            <TouchableWithoutFeedback
              onPress={() => {
                setPasswordVisible(!passwordVisible);
              }}
            >
              {passwordVisible ? (
                <Icons.EyeIcon color="#5c6a5b" />
              ) : (
                <Icons.EyeSlashIcon color="#5c6a5b" />
              )}
            </TouchableWithoutFeedback>
          </View>
        )}
      </View>
    </View>
  );
};

export default InputField;
