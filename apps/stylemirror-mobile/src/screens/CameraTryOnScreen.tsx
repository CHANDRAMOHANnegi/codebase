import * as FaceDetector from 'expo-face-detector';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { FaceScanResult, StylePreference } from '@stylemirror/shared';
import { HairstyleRecommendation } from '@stylemirror/style-engine';
import { HairstyleOverlay } from '../components/HairstyleOverlay';
import { ScanRingOverlay } from '../components/ScanRingOverlay';
import { scanQualityTips } from '../features/scan/scanQuality';
import { FaceDetection, NormalizedFaceBounds, ScanStatus } from '../features/scan/useFaceScan';
import { theme } from '../theme/theme';

type Props = {
  onRunRealScan: (
    photoUri: string,
    detections: FaceDetection[],
    width: number,
    height: number
  ) => void;
  onRunDemoScan: () => void;
  onSaveLook: (styleId: string, styleName: string, photoUri?: string) => void;
  scan: FaceScanResult;
  scanStatus: ScanStatus;
  errorMsg: string | null;
  faceBounds: NormalizedFaceBounds | null;
  lastPhotoUri: string | null;
  recommendations: HairstyleRecommendation[];
  stylePreference: StylePreference;
};

type Mode = 'Hair' | 'Beard' | 'Hairline' | 'Transplant preview';
const MODES: Mode[] = ['Hair', 'Beard', 'Hairline', 'Transplant preview'];
type CaptureStatus = 'idle' | 'capturing' | 'detecting';

function withTimeout<T>(work: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([work, timeout]).finally(() => clearTimeout(timeoutId));
}

const preferenceLabels: Record<StylePreference, string> = {
  all: 'All styles',
  men: 'Men',
  women: 'Women'
};

const audienceLabels: Record<HairstyleRecommendation['audience'], string> = {
  men: 'Men',
  women: 'Women',
  unisex: 'Unisex'
};

export function CameraTryOnScreen({
  onRunRealScan,
  onRunDemoScan,
  onSaveLook,
  scan,
  scanStatus,
  errorMsg,
  faceBounds,
  lastPhotoUri,
  recommendations,
  stylePreference
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedId, setSelectedId] = useState(recommendations[0]?.id ?? '');
  const [activeMode, setActiveMode] = useState<Mode>('Hair');
  const [cameraSize, setCameraSize] = useState({ width: 1, height: 1 });
  const [cameraReady, setCameraReady] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>('idle');
  const [saveFeedback, setSaveFeedback] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const selected = useMemo(
    () => recommendations.find((r) => r.id === selectedId) ?? recommendations[0],
    [recommendations, selectedId]
  );

  useEffect(() => {
    setCameraReady(false);
  }, [permission?.granted]);

  useEffect(() => {
    if (!recommendations.length) {
      setSelectedId('');
      return;
    }

    if (!recommendations.some((r) => r.id === selectedId)) {
      setSelectedId(recommendations[0].id);
    }
  }, [recommendations, selectedId]);

  const handleCapture = useCallback(async () => {
    if (!permission?.granted) {
      onRunDemoScan();
      return;
    }
    if (!cameraReady || !cameraRef.current || captureStatus !== 'idle') return;

    try {
      setCaptureStatus('capturing');
      const photo = await withTimeout(
        cameraRef.current.takePictureAsync({
          base64: false,
          quality: 0.7,
          skipProcessing: true
        }),
        7000,
        'Camera capture timed out'
      );
      if (!photo) return;

      const runDetection = async (mode: FaceDetector.FaceDetectorMode) =>
        withTimeout(
          FaceDetector.detectFacesAsync(photo.uri, {
            mode,
            detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
            runClassifications: FaceDetector.FaceDetectorClassifications.none
          }),
          mode === FaceDetector.FaceDetectorMode.fast ? 7000 : 9000,
          'Face detection timed out'
        ).then((result) => result.faces);

      setCaptureStatus('detecting');
      let faces = await runDetection(FaceDetector.FaceDetectorMode.fast);

      if (faces.length === 0) {
        faces = await runDetection(FaceDetector.FaceDetectorMode.accurate);
      }

      if (faces.length === 0) {
        faces = [{
          bounds: {
            origin: { x: photo.width * 0.25, y: photo.height * 0.2 },
            size: { width: photo.width * 0.5, height: photo.height * 0.4 }
          },
          faceID: 0
        }] as any;
      }

      onRunRealScan(
        photo.uri,
        faces as unknown as FaceDetection[],
        photo.width,
        photo.height
      );
    } catch {
      onRunDemoScan();
    } finally {
      setCaptureStatus('idle');
    }
  }, [permission, cameraReady, captureStatus, onRunRealScan, onRunDemoScan]);

  const handleSave = useCallback(() => {
    if (!selected || !lastPhotoUri) return;
    onSaveLook(selected.id, selected.name, lastPhotoUri);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  }, [selected, lastPhotoUri, onSaveLook]);

  const onCameraLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCameraSize({ width, height });
  }, []);

  const scanning = scanStatus === 'scanning';
  const captureBusy = captureStatus !== 'idle';
  const cameraStarting = Boolean(permission?.granted && !cameraReady);
  const cameraDisabled = scanning || captureBusy || cameraStarting;
  const hasPhotoScan = Boolean(lastPhotoUri);
  const canSave = Boolean(selected && hasPhotoScan && scanStatus === 'complete');
  const scanPillText = captureBusy
    ? captureStatus === 'capturing'
      ? 'Capturing photo...'
      : 'Analysing face...'
    : cameraStarting
      ? 'Starting camera...'
      : errorMsg
        ? 'No face detected'
        : hasPhotoScan
          ? `${scan.faceShape} face · ${Math.round(scan.confidence * 100)}% conf`
          : permission?.granted
            ? 'Ready to scan'
            : 'Camera not enabled';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Camera / preview panel ── */}
      <View style={styles.cameraWrap} onLayout={onCameraLayout}>
        {permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="front"
            onCameraReady={() => setCameraReady(true)}
          />
        ) : (
          <View style={styles.cameraFallback} />
        )}

        {/* Face guide oval */}
        <View style={styles.faceGuide} />

        {/* Animated scan ring */}
        <ScanRingOverlay scanning={scanning} />

        {/* Hairstyle overlay (only when scan complete and style selected) */}
        {hasPhotoScan && scanStatus === 'complete' && selected && (
          <HairstyleOverlay
            styleId={selected.id}
            faceBounds={faceBounds ?? undefined}
            containerWidth={cameraSize.width}
            containerHeight={cameraSize.height}
          />
        )}

        {/* Scan result pill */}
        <View style={styles.overlayTop}>
          {scanning || captureBusy || cameraStarting ? (
            <View style={styles.scanPillRow}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
              <Text style={styles.scanPill}>{scanPillText}</Text>
            </View>
          ) : (
            <Text style={[styles.scanPill, errorMsg ? styles.scanPillError : null]}>
              {scanPillText}
            </Text>
          )}
        </View>

        {/* Bottom controls */}
        <View style={styles.overlayBottom}>
          <Pressable
            style={[styles.secondaryButton, cameraDisabled && styles.secondaryButtonDisabled]}
            onPress={permission?.granted ? handleCapture : requestPermission}
            disabled={cameraDisabled}
          >
            <Text style={styles.secondaryButtonText}>
              {permission?.granted
                ? cameraStarting
                  ? 'Starting'
                  : hasPhotoScan
                    ? 'Rescan'
                    : 'Scan'
                : 'Enable camera'}
            </Text>
          </Pressable>

          <Pressable style={styles.captureButton} onPress={handleCapture} disabled={cameraDisabled}>
            <View style={[styles.captureInner, cameraDisabled && styles.captureInnerDisabled]} />
          </Pressable>

          <Pressable
            style={[
              styles.secondaryButton,
              !canSave && styles.secondaryButtonDisabled,
              saveFeedback && styles.saveSuccess
            ]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                !canSave && styles.disabledButtonText,
                saveFeedback && styles.saveSuccessText
              ]}
            >
              {saveFeedback ? '✓ Saved' : canSave ? 'Save' : 'Scan first'}
            </Text>
          </Pressable>
        </View>

        {/* Permission card */}
        {!permission?.granted && !scanning && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Camera access</Text>
            <Text style={styles.permissionText}>
              Enable camera to scan your face and preview hairstyles in real time.
            </Text>
            <Pressable style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Enable camera</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ── Mode chips ── */}
      <View style={styles.modes}>
        {MODES.map((m) => (
          <Pressable key={m} onPress={() => setActiveMode(m)}>
            <Text style={[styles.modeChip, activeMode === m && styles.modeChipActive]}>{m}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceText}>Showing: {preferenceLabels[stylePreference]}</Text>
        <Text style={styles.preferenceCount}>{recommendations.length} matches</Text>
      </View>

      {/* ── Error banner ── */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {(errorMsg || !lastPhotoUri) && (
        <View style={styles.qualityPanel}>
          <Text style={styles.qualityTitle}>Better scan tips</Text>
          {scanQualityTips.map((tip) => (
            <View key={tip.id} style={styles.qualityRow}>
              <View style={styles.qualityDot} />
              <View style={styles.qualityTextWrap}>
                <Text style={styles.qualityItemTitle}>{tip.title}</Text>
                <Text style={styles.qualityItemBody}>{tip.body}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Hairstyle recommendation sheet ── */}
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>
          {hasPhotoScan ? (
            <>
              Best for your <Text style={styles.accent}>{scan.faceShape}</Text> face
            </>
          ) : (
            'Recommended starter styles'
          )}
        </Text>
        <FlatList
          horizontal
          data={recommendations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedId(item.id)}
              style={[styles.card, selected?.id === item.id && styles.cardSelected]}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {audienceLabels[item.audience]} · {item.length} · {item.category}
              </Text>
              <Text style={styles.cardBody} numberOfLines={3}>
                {item.reason}
              </Text>
            </Pressable>
          )}
        />
        {selected && (
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>✂ Barber note</Text>
            <Text style={styles.detailText}>{selected.barberNote}</Text>
            {selected.caution ? (
              <Text style={styles.caution}>⚠ {selected.caution}</Text>
            ) : null}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingBottom: theme.spacing.xl
  },
  cameraWrap: {
    alignItems: 'center',
    backgroundColor: '#07080B',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    height: 430,
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
    overflow: 'hidden',
    borderRadius: theme.radius.lg
  },
  cameraFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#07080B'
  },
  faceGuide: {
    borderColor: `${theme.colors.accent}55`,
    borderRadius: 120,
    borderWidth: 1.5,
    height: 240,
    opacity: 0.7,
    position: 'absolute',
    width: 180
  },
  overlayTop: {
    left: theme.spacing.md,
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.md
  },
  scanPillRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(15,17,21,0.82)',
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  scanPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(15,17,21,0.82)',
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 9,
    textTransform: 'capitalize'
  },
  scanPillError: {
    borderColor: theme.colors.warning,
    color: theme.colors.warning
  },
  overlayBottom: {
    alignItems: 'center',
    bottom: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    position: 'absolute'
  },
  captureButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: theme.colors.text,
    borderRadius: 999,
    borderWidth: 3,
    height: 76,
    justifyContent: 'center',
    width: 76
  },
  captureInner: {
    backgroundColor: theme.colors.accent,
    borderRadius: 999,
    height: 56,
    width: 56
  },
  captureInnerDisabled: {
    backgroundColor: theme.colors.border
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15,17,21,0.82)',
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 82,
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  secondaryButtonDisabled: {
    opacity: 0.56
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800'
  },
  disabledButtonText: {
    color: theme.colors.textMuted
  },
  saveSuccess: {
    backgroundColor: `${theme.colors.success}22`,
    borderColor: theme.colors.success
  },
  saveSuccessText: {
    color: theme.colors.success
  },
  permissionCard: {
    backgroundColor: 'rgba(15,17,21,0.92)',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    position: 'absolute',
    width: '80%'
  },
  permissionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  permissionText: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginTop: 8
  },
  permissionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    marginTop: 14,
    paddingVertical: 12
  },
  permissionButtonText: {
    color: '#16110A',
    fontWeight: '800'
  },
  modes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md
  },
  modeChip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  modeChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
    color: '#16110A'
  },
  preferenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm
  },
  preferenceText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800'
  },
  preferenceCount: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  errorBanner: {
    backgroundColor: `${theme.colors.warning}18`,
    borderColor: `${theme.colors.warning}55`,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm
  },
  errorText: {
    color: theme.colors.warning,
    fontSize: 13,
    lineHeight: 19
  },
  qualityPanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md
  },
  qualityTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: theme.spacing.sm
  },
  qualityRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 8
  },
  qualityDot: {
    backgroundColor: theme.colors.accent,
    borderRadius: 999,
    height: 8,
    marginTop: 6,
    width: 8
  },
  qualityTextWrap: {
    flex: 1
  },
  qualityItemTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800'
  },
  qualityItemBody: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2
  },
  sheet: {
    padding: theme.spacing.md
  },
  sheetTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: theme.spacing.md
  },
  accent: {
    color: theme.colors.accent,
    textTransform: 'capitalize'
  },
  list: { gap: theme.spacing.sm },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    width: 220
  },
  cardSelected: {
    borderColor: theme.colors.accent
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  cardMeta: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
    textTransform: 'uppercase'
  },
  cardBody: {
    color: theme.colors.textMuted,
    lineHeight: 19,
    marginTop: 10
  },
  detailCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md
  },
  detailLabel: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  detailText: {
    color: theme.colors.text,
    lineHeight: 21
  },
  caution: {
    color: theme.colors.warning,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.spacing.sm
  }
});
