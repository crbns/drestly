import ClosetItem from '@/components/ClosetItem';
import FilledButton from '@/components/FilledButton';
import { useSession } from '@/ctx/session';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toastiva } from 'toastiva';

const closet = () => {
  const session = useSession();
  const [numItems, setNumItems] = useState(0);
  const [data, setData] = useState<any[] | null>(null);
  const [itemWidth, setItemWidth] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const userId = session?.user.id;

  const numColumns = 2;
  const COLUMN_GAP = 16; // gap-lg — keep in sync with the gap classNames below

  const fetchData = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('clothing_items')
      .select()
      .eq('user_id', userId);

    if (error) {
      toastiva.error('There was an error getting your items');
      console.error(error);
      return;
    }

    setData(data);
    setNumItems(data.length);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const EmptyState = () => {
    return (
      <View className="flex-1 items-center justify-center">
        <View className="aspect-3/4 bg-cream-light border-dotted border-2 border-line rounded-card w-45 items-center justify-center">
          <Icons.TShirtIcon weight="fill" size={50} color="#e2dac9" />
          <View className="w-13 h-13 rounded-full bg-forest items-center justify-center absolute -right-3 -bottom-3">
            <Icons.PlusIcon color="#f3eee4" size={20} weight="regular" />
          </View>
        </View>
        <Text className="text-h2 text-ink font-heading mt-2xl">
          Your closet is empty
        </Text>
        <Text className="text-base text-body font-body mt-2 text-center">
          Photograph your first item, we'll cut out the background
          automatically.
        </Text>

        <FilledButton
          buttonText="Add your first item"
          onClick={() => router.push('/add-item')}
          fillColor="primary"
          className="mt-2xl"
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="h-full" edges={['top', 'left', 'right']}>
      <View className="h-full px-2xl">
        <View className="flex-row justify-between items-center">
          <Text className="text-h2 text-ink font-heading">Closet</Text>
          <Text className="text-body text-label font-body mt-1">
            {numItems} item{(numItems > 1 || numItems === 0) && 's'}
          </Text>
        </View>

        {numItems === 0 ? (
          <EmptyState />
        ) : (
          <View
            className="mt-2xl flex-1"
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              setItemWidth((w - COLUMN_GAP * (numColumns - 1)) / numColumns);
            }}
          >
            {itemWidth > 0 && (
              <FlatList
                data={data ?? []}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#2e5c40"
                  />
                }
                columnWrapperClassName="gap-lg"
                contentContainerClassName="gap-lg pb-2xl"
                renderItem={({ item }) => (
                  <ClosetItem
                    id={item.id}
                    cutout_path={item.cutout_path}
                    color_hex={item.color_hex}
                    category_name={item.category_name}
                    name={item.name}
                    width={itemWidth}
                  />
                )}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default closet;
