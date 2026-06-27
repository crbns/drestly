import { type Icon, type IconWeight } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

const DEFAULT_ICON_SIZE = 25;
const DEFAULT_ICON_COLOR = '#f3eee4';

export type IconHeaderAction = {
  icon: Icon;
  onPress: () => void;
  color?: string;
  size?: number;
  weight?: IconWeight;
  hitSlop?: number;
};

export type TextHeaderAction = {
  label: string;
  onPress: () => void;
  className?: string;
  hitSlop?: number;
};

export type HeaderAction = IconHeaderAction | TextHeaderAction;

export type ScreenHeaderProps = {
  title: string;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  className?: string;
  titleClassName?: string;
};

const isTextAction = (action: HeaderAction): action is TextHeaderAction =>
  'label' in action;

const HeaderSlot = ({ action }: { action?: HeaderAction }) => {
  // Reserve equal space on either side so the title stays centered when a
  // slot is empty.
  if (!action) return <View style={{ width: DEFAULT_ICON_SIZE }} />;

  if (isTextAction(action)) {
    return (
      <Pressable onPress={action.onPress} hitSlop={action.hitSlop ?? 50}>
        <Text
          className={`text-base text-cream font-body ${action.className ?? ''}`}
        >
          {action.label}
        </Text>
      </Pressable>
    );
  }

  const IconComponent = action.icon;
  return (
    <Pressable onPress={action.onPress} hitSlop={action.hitSlop ?? 50}>
      <IconComponent
        size={action.size ?? DEFAULT_ICON_SIZE}
        color={action.color ?? DEFAULT_ICON_COLOR}
        weight={action.weight ?? 'regular'}
      />
    </Pressable>
  );
};

const ScreenHeader = ({
  title,
  showLeftIcon = false,
  showRightIcon = false,
  leftAction,
  rightAction,
  className,
  titleClassName,
}: ScreenHeaderProps) => {
  return (
    <View className={`flex-row items-center ${className ?? ''}`}>
      <HeaderSlot action={showLeftIcon ? leftAction : undefined} />
      <Text
        className={`text-base text-cream font-body flex-1 text-center ${titleClassName ?? ''}`}
      >
        {title}
      </Text>
      <HeaderSlot action={showRightIcon ? rightAction : undefined} />
    </View>
  );
};

export default ScreenHeader;
