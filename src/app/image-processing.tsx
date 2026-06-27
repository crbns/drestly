import { AnimatedProgressBar } from '@/components/Progress';
import { addItem, triggerProcessing } from '@/utils/imageProcessing';
import { supabase } from '@/utils/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Icons from 'phosphor-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { toastiva } from 'toastiva';
import { withUniwind } from 'uniwind';
import FilledButton from '../components/FilledButton';

const StyledImage = withUniwind(Image);
const StyledLinearGradient = withUniwind(LinearGradient);

const FOREST = '#2e5c40';
const SAGE_25 = 'rgba(156,194,166,0.25)'; // bg-sage/25
const ERROR_25 = 'rgba(168,68,58,0.25)'; // bg-error/25
const BEAM_H = 32; // h-3xl

type Phase = 'processing' | 'done' | 'failed';

// The image box: the original photo sits on top of the transparent-background
// cutout, with a forest "printer scan" beam sweeping while we wait. On `done`
// the original cross-fades out, revealing the cutout underneath — the
// background disappears while the item stays put — then onReveal fires. On
// `failed` the box tints from sage to the error color.
const ScanImage = ({
  originalUri,
  cutoutUri,
  phase,
  onReveal,
}: {
  originalUri: string;
  cutoutUri: string | null;
  phase: Phase;
  onReveal: () => void;
}) => {
  const [boxH, setBoxH] = useState(0);
  const [cutoutLoaded, setCutoutLoaded] = useState(false);

  const sweep = useSharedValue(0); // 0..1 beam position
  const scanOpacity = useSharedValue(1);
  const originalOpacity = useSharedValue(1);
  const tint = useSharedValue(0); // 0 sage/25 -> 1 error/25

  // Beam sweeps top<->bottom forever; opacity gates whether it shows.
  useEffect(() => {
    sweep.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  // A fresh cutout (or a retry that clears it) resets the load flag.
  useEffect(() => {
    if (!cutoutUri) setCutoutLoaded(false);
  }, [cutoutUri]);

  // Phase-driven states. Reveal lives in its own effect (waits on the cutout).
  useEffect(() => {
    if (phase === 'processing') {
      scanOpacity.value = withTiming(1, { duration: 300 });
      originalOpacity.value = withTiming(1, { duration: 300 });
      tint.value = withTiming(0, { duration: 300 });
    } else if (phase === 'failed') {
      scanOpacity.value = withTiming(0, { duration: 300 });
      tint.value = withTiming(1, { duration: 500 });
    }
  }, [phase]);

  // Cross-fade once the cutout is decoded: original fades out, cutout shows
  // through, navigation fires when the fade lands.
  useEffect(() => {
    if (phase !== 'done' || !cutoutLoaded) return;
    scanOpacity.value = withTiming(0, { duration: 400 });
    originalOpacity.value = withTiming(
      0,
      { duration: 1000, easing: Easing.inOut(Easing.ease) },
      (finished) => {
        if (finished) scheduleOnRN(onReveal);
      }
    );
  }, [phase, cutoutLoaded]);

  // Safety net: if the cutout never loads, don't strand the user.
  useEffect(() => {
    if (phase !== 'done') return;
    const fb = setTimeout(() => {
      if (!cutoutLoaded) onReveal();
    }, 4000);
    return () => clearTimeout(fb);
  }, [phase, cutoutLoaded]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(tint.value, [0, 1], [SAGE_25, ERROR_25]),
  }));

  const originalStyle = useAnimatedStyle(() => ({
    opacity: originalOpacity.value,
  }));

  const beamStyle = useAnimatedStyle(() => ({
    opacity: scanOpacity.value,
    transform: [{ translateY: sweep.value * Math.max(boxH - BEAM_H, 0) }],
  }));

  return (
    <Animated.View
      onLayout={(e) => setBoxH(e.nativeEvent.layout.height)}
      className="rounded-card overflow-hidden aspect-3/4 w-50"
      style={boxStyle}
    >
      {/* cutout (bottom) — revealed as the original fades out */}
      {cutoutUri && (
        <StyledImage
          source={{ uri: cutoutUri }}
          contentFit="contain"
          onLoad={() => setCutoutLoaded(true)}
          className="absolute inset-0"
        />
      )}

      {/* original photo (top) — fades out on done */}
      <Animated.View className="absolute inset-0" style={originalStyle}>
        <StyledImage
          source={{ uri: originalUri }}
          contentFit="contain"
          className="flex-1"
        />
      </Animated.View>

      {/* printer scan beam — soft forest glow with a bright core line */}
      <Animated.View
        pointerEvents="none"
        className="absolute left-0 right-0 h-3xl justify-center"
        style={beamStyle}
      >
        <StyledLinearGradient
          colors={['rgba(46,92,64,0)', 'rgba(46,92,64,.5)', 'rgba(46,92,64,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute inset-0"
        />
        <View className="h-0.5 bg-forest opacity-50" />
      </Animated.View>
    </Animated.View>
  );
};

const imageProcessing = () => {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [itemId, setItemId] = useState<string | null>(null);
  const [status, setStatus] = useState<Phase | null>(null);
  const [cutoutUri, setCutoutUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const navigated = useRef(false);

  // Read the original, upload it and create the row. Returns the id we then
  // subscribe to. Wrapped in useCallback so Retry can re-run the same flow.
  const upload = useCallback(async () => {
    if (!uri) return;
    setStatus('processing');
    try {
      const file = new FileSystem.File(uri);
      const base64 = file.base64Sync();
      const id = await addItem(decode(base64));
      setItemId(id);
    } catch {
      setErrorMsg('We could not upload your photo.');
      setStatus('failed');
    }
  }, [uri]);

  // Apply a row from realtime or the reconcile select: resolve the cutout's
  // signed URL on done, capture the message on failure. Stable (setters only).
  const applyRow = useCallback(
    async (row: {
      status: Phase;
      cutout_path: string | null;
      error: string | null;
    }) => {
      if (row.status === 'done') {
        if (row.cutout_path) {
          const { data } = await supabase.storage
            .from('cutouts')
            .createSignedUrl(row.cutout_path, 3600);
          if (data?.signedUrl) setCutoutUri(data.signedUrl);
        }
        setProgress(1);
        setStatus('done');
      } else if (row.status === 'failed') {
        setErrorMsg(row.error ?? 'We could not cut out your item.');
        setStatus('failed');
      }
    },
    []
  );

  // Kick off on mount (and whenever a fresh uri arrives).
  useEffect(() => {
    upload();
  }, [upload]);

  // Fictitious progress: creep linearly toward 90% over ~20s (about how long a
  // real cutout takes) while we wait. The real 100% only lands when the
  // database confirms the cutout is done.
  useEffect(() => {
    if (status !== 'processing') return;
    const TICK = 600;
    const step = 0.9 * (TICK / 20000); // reach 90% at ~20s
    const id = setInterval(() => {
      setProgress((p) => Math.min(0.9, p + step));
    }, TICK);
    return () => clearInterval(id);
  }, [status]);

  // Toast once on each transition into failure.
  useEffect(() => {
    if (status === 'failed') {
      toastiva.error(errorMsg ?? 'Something went wrong.');
    }
  }, [status]);

  // Subscribe to the row, then trigger processing. Subscribing before the
  // trigger means we can't miss the UPDATE; the reconcile select covers the
  // case where the cutout finishes during the subscription handshake.
  useEffect(() => {
    if (!itemId) return;

    const channel = supabase
      .channel(`item:${itemId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clothing_items',
          filter: `id=eq.${itemId}`,
        },
        ({ new: row }) => applyRow(row as any)
      )
      .subscribe(async (s) => {
        if (s !== 'SUBSCRIBED') return;
        try {
          await triggerProcessing(itemId);
        } catch {
          setErrorMsg('We could not start processing.');
          setStatus('failed');
          return;
        }
        const { data } = await supabase
          .from('clothing_items')
          .select('status, cutout_path, error')
          .eq('id', itemId)
          .single();
        if (data) applyRow(data as any);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, applyRow]);

  const handleReveal = () => {
    if (navigated.current) return;
    navigated.current = true;
    // Hand off the same signed URL we already loaded — expo-image has it cached
    // (memory + disk), so add-to-closet renders it instantly with no re-fetch.
    router.replace({
      pathname: '/add-to-closet',
      params: { itemId: itemId ?? '', cutoutUri: cutoutUri ?? '' },
    });
  };

  const handleRetry = () => {
    setErrorMsg(null);
    setCutoutUri(null);
    setProgress(0);
    setStatus('processing');
    // The channel is still subscribed from the first attempt, so re-triggering
    // is enough; if we never got a row, re-run the full upload.
    if (itemId) {
      triggerProcessing(itemId).catch(() => {
        setErrorMsg('We could not start processing.');
        setStatus('failed');
      });
    } else {
      upload();
    }
  };

  const phase: Phase =
    status === 'done' || status === 'failed' ? status : 'processing';
  const failed = status === 'failed';

  return (
    <SafeAreaView className="h-full">
      <View className="h-full px-2xl items-center justify-center">
        <Pressable
          onPress={() => router.replace('/home')}
          hitSlop={50}
          className="absolute left-2xl top-0"
        >
          <Icons.XIcon color={FOREST} size={25} weight="regular" />
        </Pressable>

        <View className="w-full items-center">
          <ScanImage
            originalUri={uri}
            cutoutUri={cutoutUri}
            phase={phase}
            onReveal={handleReveal}
          />

          <Text className="font-heading text-h1 text-ink mt-10 text-center">
            {failed ? 'Something went wrong' : 'Removing background'}
          </Text>
          <Text className="font-body text-base text-body mt-2 text-center">
            {failed
              ? (errorMsg ?? 'We could not cut out your item.')
              : 'Cutting out your item...'}
          </Text>

          {failed ? (
            <FilledButton
              buttonText="Try again"
              onClick={handleRetry}
              fillColor="primary"
              className="mt-2xl"
            />
          ) : (
            <AnimatedProgressBar
              progress={progress}
              animationDuration={600}
              progressColor={FOREST}
              trackColor="#e2dac9"
              containerStyle={{ marginTop: 24, width: '100%' }}
              height={5}
              width={'50%'}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default imageProcessing;
