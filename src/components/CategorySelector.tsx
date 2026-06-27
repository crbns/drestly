import FilledButton from '@/components/FilledButton';
import InputField from '@/components/InputField';
import PressableScale from '@/components/PressableScale';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const DEFAULT_CATEGORIES = ['Tops', 'Bottoms', 'Outerwear', 'Shoes'];

const STORAGE_KEY = '@drestly/custom-categories';

type CategorySelectorProps = {
  value: string | null;
  onChange: (category: string) => void;
  className?: string;
};

const Pill = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <PressableScale
    onPress={onPress}
    className={`rounded-full px-lg py-sm items-center justify-center ${selected ? 'bg-sage' : 'bg-surface'}`}
  >
    <Text
      className={`font-inter-medium text-label ${selected ? 'text-on-sage' : 'text-body'}`}
    >
      {label}
    </Text>
  </PressableScale>
);

const CategorySelector = ({
  value,
  onChange,
  className,
}: CategorySelectorProps) => {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const categories = [...DEFAULT_CATEGORIES, ...customCategories];
  const [modalVisible, setModalVisible] = useState(false);
  const [draftName, setDraftName] = useState('');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCustomCategories(parsed);
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
  };

  const addCategory = () => {
    const name = draftName.trim();
    if (!name) return;
    if (!categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      const next = [...customCategories, name];
      setCustomCategories(next);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    }
    onChange(name);
    closeModal();
  };

  return (
    <View className={className}>
      <Text className="font-inter text-caption text-body mb-sm">Category</Text>
      <View className="flex-row flex-wrap gap-sm">
        {categories.map((category) => (
          <Pill
            key={category}
            label={category}
            selected={value === category}
            onPress={() => onChange(category)}
          />
        ))}
        <PressableScale
          onPress={() => setModalVisible(true)}
          className="rounded-full px-md py-sm bg-surface items-center justify-center"
        >
          <Icons.PlusIcon size={16} color="#5c6a5b" weight="bold" />
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
                  New category
                </Text>
                <InputField
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholderText="Dresses"
                  title="Name"
                  autoComplete="off"
                />
                <FilledButton
                  fillColor="primary"
                  buttonText="Add Category"
                  onClick={addCategory}
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

export default CategorySelector;
