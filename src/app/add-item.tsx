import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import OutlineButton from '../components/OutlineButton';

// CameraView is a native third-party component; uniwind doesn't apply
// className to it automatically. Wrap it so Tailwind classes take effect.
const StyledCameraView = withUniwind(CameraView);
const StyledImage = withUniwind(Image);

const add = () => {
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);

  const handleGrantPermission = () => {
    // After the first denial iOS won't re-prompt (canAskAgain === false);
    // requestPermission() becomes a no-op, so send the user to Settings.
    if (permission?.canAskAgain) {
      requestPermission();
    } else {
      Linking.openSettings();
    }
  };

  const handleTakePhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) setUri(photo.uri);
  };

  const handleSubmission = () => {
    if (!uri) return;
    router.push({ pathname: '/image-processing', params: { uri } });
  };

  const renderCamera = () => {
    return (
      <View className="h-full px-2xl">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => {
              router.back();
            }}
            hitSlop={50}
          >
            <Icons.XIcon color="#f3eee4" size={25} weight="regular" />
          </Pressable>
          <Text className="text-base text-cream font-body flex-1 text-center">
            New item
          </Text>
          <Pressable
            onPress={() => {
              setTorchEnabled(!torchEnabled);
            }}
            hitSlop={50}
          >
            <Icons.LightningIcon
              size={25}
              color="#f3eee4"
              weight={torchEnabled ? 'fill' : 'regular'}
            />
          </Pressable>
        </View>

        <View
          className={`bg-sage/25 my-2xl flex-1 rounded-card overflow-clip ${permission && permission.granted && 'p-xs'}`}
        >
          {!permission ? (
            <View className="flex-1 px-2xl items-center justify-center">
              <ActivityIndicator color="#1c2b22" />
            </View>
          ) : !permission.granted ? (
            <View className="flex-1 px-2xl items-center justify-center">
              <Text className="text-cream font-body text-base text-center">
                {permission.canAskAgain
                  ? 'Enable camera permissions'
                  : 'Camera access is off.\nEnable it in Settings to continue.'}
              </Text>
              <OutlineButton
                buttonText={
                  permission.canAskAgain ? 'Grant Permissions' : 'Open Settings'
                }
                onClick={handleGrantPermission}
                outlineColor="secondary"
                className="mt-xl"
              />
            </View>
          ) : (
            <View className="flex-1 rounded-lg overflow-hidden items-center justify-center aspect-3/5">
              <StyledCameraView
                className="absolute inset-0"
                facing={facing}
                enableTorch={torchEnabled}
                ref={ref}
              />
              <View className="aspect-3/4 self-stretch rounded border border-dashed border-cream mx-4">
                <Text className="absolute bottom-full left-0 right-0 mb-md text-center text-cream font-body">
                  Good, even lighting works best
                </Text>
                <Text className="absolute top-full left-0 right-0 mt-md text-center text-cream font-body">
                  Lay the item flat and fill the frame
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="items-center justify-center mb-xl">
          <View className="bg-transparent border-5 border-cream/25 w-20 h-20 rounded-full">
            <TouchableOpacity
              onPress={handleTakePhoto}
              activeOpacity={0.8}
              className="bg-cream flex-1 rounded-full"
            />
          </View>
        </View>
      </View>
    );
  };

  const renderPicture = (uri: string) => {
    return (
      <View className="h-full px-2xl">
        <View className="items-center">
          <Text className="text-base text-cream font-body">
            Does this look right?
          </Text>
        </View>

        <View
          className={`bg-sage/25 my-2xl flex-1 rounded-card overflow-clip ${permission && permission.granted && 'p-xs'}`}
        >
          <StyledImage
            source={{ uri }}
            contentFit="contain"
            className="flex-1 rounded-lg overflow-hidden items-center justify-center"
          />
        </View>

        <View className="flex-row items-center justify-evenly gap-20 mb-xl">
          <View className="bg-transparent border-5 border-error/25 w-20 h-20 rounded-full">
            <TouchableOpacity
              onPress={() => {
                setUri(null);
              }}
              activeOpacity={0.8}
              className="bg-error flex-1 rounded-full items-center justify-center"
            >
              <Icons.XIcon size={25} color="#f3eee4" />
            </TouchableOpacity>
          </View>
          <View className="bg-transparent border-5 border-success/25 w-20 h-20 rounded-full">
            <TouchableOpacity
              onPress={handleSubmission}
              activeOpacity={0.8}
              className="bg-success flex-1 rounded-full items-center justify-center"
            >
              <Icons.CheckIcon size={25} color="#f3eee4" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="h-full">
      {uri ? renderPicture(uri) : renderCamera()}
    </SafeAreaView>
  );
};

export default add;
