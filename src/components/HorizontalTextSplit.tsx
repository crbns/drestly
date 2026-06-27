import { Text, View } from 'react-native';

type HorizontalTextSplitProps = {
  text: string;
  className: string;
};

const HorizontalTextSplit = ({ text, className }: HorizontalTextSplitProps) => {
  return (
    <View className={`w-full flex-row items-center gap-2 ${className}`}>
      {/* TODO: See if there is a way to use hairline width instead since h-px seems to be the only workaround */}
      <View className="flex-1 h-px bg-body" />
      <Text className="font-body text-caption text-body">{text}</Text>
      <View className="flex-1 h-px bg-body" />
    </View>
  );
};

export default HorizontalTextSplit;
