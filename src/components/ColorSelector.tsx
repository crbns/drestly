import FilledButton from '@/components/FilledButton';
import InputField from '@/components/InputField';
import PressableScale from '@/components/PressableScale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import ColorPicker, {
  HueSlider,
  Panel1,
  Preview,
} from 'reanimated-color-picker';

export type ColorKind = 'solid' | 'multicolor' | 'patterned';
export type ColorOption = { name: string; value: string; kind?: ColorKind };

const STORAGE_KEY = '@drestly/custom-colors';

// Sentinel values for the non-solid options so selection identity stays stable.
const MULTICOLOR_VALUE = '__multicolor__';
const PATTERNED_VALUE = '__patterned__';

// Diagonal rainbow used to render the multicolor swatch.
const MULTICOLOR_STOPS = [
  '#D6362B',
  '#E8A33D',
  '#E8C84D',
  '#3F8F4E',
  '#1E3A8A',
  '#6B32CF',
] as const;

// Common clothing colors, vibrant and saturated.
const DEFAULT_COLORS: ColorOption[] = [
  { name: 'Black', value: '#1C1C1C' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Gray', value: '#9A9A95' },
  { name: 'Navy', value: '#1E3A8A' },
  { name: 'Green', value: '#3F8F4E' },
  { name: 'Red', value: '#D6362B' },
  { name: 'Purple', value: '#6B32CF' },
];

// Special options that aren't a single hex; rendered with custom fills.
const SPECIAL_COLORS: ColorOption[] = [
  { name: 'Multicolor', value: MULTICOLOR_VALUE, kind: 'multicolor' },
  { name: 'Patterned', value: PATTERNED_VALUE, kind: 'patterned' },
];

type ColorSelectorProps = {
  value: ColorOption | null;
  onChange: (color: ColorOption) => void;
  className?: string;
};

const SwatchFill = ({ color }: { color: ColorOption }) => {
  const base = 'w-8 h-8 rounded-full border border-black/8 overflow-hidden';

  if (color.kind === 'multicolor') {
    return (
      <View className={base}>
        <LinearGradient
          colors={MULTICOLOR_STOPS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  if (color.kind === 'patterned') {
    // Checkerboard sized larger than the swatch so the squares bleed past the
    // edges and get clipped by the rounded-full container.
    const tile = 8;
    const starts = [-4, 4, 12, 20, 28];
    return (
      <View className={base}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 32 32"
          preserveAspectRatio="none"
        >
          <Rect width={32} height={32} fill="#FFFFFF" />
          {starts.map((y, row) =>
            starts.map((x, col) =>
              (row + col) % 2 === 0 ? (
                <Rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={tile}
                  height={tile}
                  fill="#1C1C1C"
                />
              ) : null
            )
          )}
        </Svg>
      </View>
    );
  }

  // Hoist to a local so `.value` doesn't appear inside the inline `style`
  // object — reanimated's babel plugin warns on any `*.value` there, even
  // though this is a plain hex string, not a shared value.
  const hex = color.value;
  return <View className={base} style={{ backgroundColor: hex }} />;
};

const Swatch = ({
  color,
  selected,
  onPress,
}: {
  color: ColorOption;
  selected: boolean;
  onPress: () => void;
}) => (
  <PressableScale
    onPress={onPress}
    className={`rounded-pill border-2 p-0.75 ${
      selected ? 'border-forest' : 'border-transparent'
    }`}
  >
    <SwatchFill color={color} />
  </PressableScale>
);

const ColorSelector = ({ value, onChange, className }: ColorSelectorProps) => {
  const [customColors, setCustomColors] = useState<ColorOption[]>([]);
  const colors = [...DEFAULT_COLORS, ...customColors];
  const [modalVisible, setModalVisible] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftHex, setDraftHex] = useState('#7A8A6E');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCustomColors(parsed);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const cardScale = useSharedValue(0.96);
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  useEffect(() => {
    if (!modalVisible) return;
    cardScale.value = 0.96;
    cardScale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [modalVisible]);

  const closeModal = () => {
    setModalVisible(false);
    setDraftName('');
    setDraftHex('#7A8A6E');
  };

  const addColor = () => {
    const name = draftName.trim();
    if (!name) return;
    const newColor = { name, value: draftHex };
    const next = [...customColors, newColor];
    setCustomColors(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    onChange(newColor);
    closeModal();
  };

  return (
    <View className={className}>
      <Text className="font-inter text-caption text-body mb-sm">Color</Text>
      <View className="flex-row flex-wrap gap-sm items-center">
        {[...colors, ...SPECIAL_COLORS].map((color) => (
          <Swatch
            key={color.value + color.name}
            color={color}
            selected={
              value?.value === color.value && value?.name === color.name
            }
            onPress={() => onChange(color)}
          />
        ))}
        <PressableScale
          onPress={() => setModalVisible(true)}
          className="rounded-pill border-2 border-transparent p-0.75"
        >
          <View className="w-8 h-8 rounded-full bg-surface border border-line items-center justify-center">
            <Icons.PlusIcon size={16} color="#5c6a5b" weight="bold" />
          </View>
        </PressableScale>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          onPress={closeModal}
          className="flex-1 items-center justify-center px-2xl bg-ink/40"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full"
          >
            <Animated.View style={[cardAnimatedStyle, { width: '100%' }]}>
              {/* Stop taps inside the card from closing the modal. */}
              <Pressable
                onPress={() => {}}
                className="bg-cream-light rounded-card border-2 border-line p-2xl w-full"
              >
                <Text className="font-heading text-h2 text-ink mb-lg">
                  New color
                </Text>
                <InputField
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholderText="Burgundy"
                  title="Name"
                  autoComplete="off"
                  className="mb-lg"
                />
                <ColorPicker
                  value={draftHex}
                  onCompleteJS={({ hex }) => setDraftHex(hex)}
                  style={{ gap: 16 }}
                >
                  <Preview
                    hideInitialColor
                    hideText
                    style={{ borderRadius: 10 }}
                  />
                  <Panel1 style={{ borderRadius: 10, height: 160 }} />
                  <HueSlider style={{ borderRadius: 999 }} />
                </ColorPicker>
                <FilledButton
                  fillColor="primary"
                  buttonText="Add Color"
                  onClick={addColor}
                  disabled={!draftName.trim()}
                  className="mt-xl"
                />
                <Pressable onPress={closeModal} className="items-center mt-md">
                  <Text className="font-inter-medium text-label text-body">
                    Cancel
                  </Text>
                </Pressable>
              </Pressable>
            </Animated.View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ColorSelector;
