import CategorySelector from '@/components/CategorySelector';
import ColorSelector, { ColorOption } from '@/components/ColorSelector';
import FilledButton from '@/components/FilledButton';
import InputField from '@/components/InputField';
import ScreenHeader from '@/components/ScreenHeader';
import { supabase } from '@/utils/supabase';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toastiva } from 'toastiva';
import { withUniwind } from 'uniwind';

const StyledImage = withUniwind(Image);

const AddToCloset = () => {
  const { itemId, cutoutUri } = useLocalSearchParams<{
    itemId: string;
    cutoutUri: string;
  }>();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [color, setColor] = useState<ColorOption | null>(null);

  const handleAdd = async () => {
    if (!category || !color) {
      // toastiva.error('Select a Category and Color');
      return;
    }
    if (name === '') {
      toastiva.error('Give your item a name');
      return;
    }

    // const { data, error } = await supabase
    //   .from('clothing_items')
    //   .select(`*`)
    //   .eq('id', itemId)
    //   .single();

    const { data, error } = await supabase
      .from('clothing_items')
      .update({ color_hex: color.value, category_name: category, name: name })
      .eq('id', itemId)
      .single();

    // no need for !data since .single() errors when 0 or >1 rows returned
    if (error) {
      toastiva.error('Error adding item to closet');
    } else {
      toastiva.success('Successfully added to closet');
      router.replace('/home');
    }
  };

  return (
    <SafeAreaView className="h-full">
      <View className="h-full px-2xl">
        <ScreenHeader
          title="Review"
          titleClassName="text-base text-body"
          // showLeftIcon
          // leftAction={{
          //   icon: Icons.XIcon,
          //   onPress: () => {
          //     // TODO: add some popup saying that the image will be deleted
          //     // if this page is navigated away from
          //     router.replace('/home');
          //   },
          //   color: '#5c6a5b',
          // }}
        />

        <ScrollView
          className="flex-1 mt-2xl"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-xl"
        >
          <View className="bg-cream-light w-full h-60 rounded-card border-line border-2 overflow-hidden">
            <StyledImage
              source={cutoutUri}
              contentFit="contain"
              contentPosition={'center'}
              className="flex-1"
            />
          </View>

          <InputField
            value={name}
            onChangeText={setName}
            placeholderText="Shirt"
            title="Name"
            className="mt-xl"
          />

          <CategorySelector
            value={category}
            onChange={setCategory}
            className="mt-xl"
          />

          <ColorSelector value={color} onChange={setColor} className="mt-xl" />
        </ScrollView>

        <View className="items-end">
          <FilledButton
            buttonText="Add to closet"
            fillColor="primary"
            onClick={handleAdd}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddToCloset;
