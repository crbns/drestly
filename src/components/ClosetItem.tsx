import { supabase } from '@/utils/supabase';
import { Image } from 'expo-image';
import * as Icons from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { toastiva } from 'toastiva';
import { withUniwind } from 'uniwind';

// expo-image's Image is a third-party component; uniwind ignores className on
// it unless wrapped, so `w-full h-full` was a no-op and the image rendered at
// zero size. Wrap it so the Tailwind classes actually apply.
const StyledImage = withUniwind(Image);

type ClosetItemProps = {
  id: string;
  cutout_path: string;
  color_hex: string;
  category_name: string;
  name: string;
  width?: number;
};

const ClosetItem = ({
  id,
  cutout_path,
  color_hex = '#000000',
  category_name,
  name,
  width,
}: ClosetItemProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const getImageUrl = async () => {
      const { data, error } = await supabase.storage
        .from('cutouts')
        .createSignedUrl(cutout_path, 3600);

      if (error) {
        toastiva.error('Failed to get item image');
        console.error(error);
        return;
      }
      setImageUrl(data.signedUrl);
    };

    getImageUrl();
  }, []);

  return (
    <View style={{ width }}>
      <View className="bg-cream-light border-2 border-line rounded-card overflow-hidden w-full items-center justify-center aspect-3/4">
        {imageUrl ? (
          <StyledImage
            source={imageUrl}
            className="w-full h-full"
            contentFit="contain"
            contentPosition={'center'}
          />
        ) : (
          // TODO: replace with some sort of loading animation or have the entire thing just be a skeleton until image loads
          <Icons.TShirtIcon weight="fill" size={50} color="#e2dac9" />
        )}
        <View
          className="rounded-full w-4 h-4 absolute right-2 top-2 border border-line"
          style={{ backgroundColor: color_hex }}
        />
      </View>

      <Text
        className="text-label font-inter-medium text-ink mt-3"
        numberOfLines={1}
      >
        {name}
      </Text>
      {/* TODO: implement this feature */}
      <Text className="text-caption font-body text-body mt-1">0 wears</Text>
    </View>
  );
};

export default ClosetItem;
