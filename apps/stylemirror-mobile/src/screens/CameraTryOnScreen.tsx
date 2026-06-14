import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { FaceScanResult } from '@stylemirror/shared';
import { HairstyleRecommendation } from '@stylemirror/style-engine';
import { theme } from '../theme/theme';

type Props = {
  onRunScan: () => void;
  scan: FaceScanResult;
  scanStatus: 'ready' | 'scanning' | 'complete';
  recommendations: HairstyleRecommendation[];
};

export function CameraTryOnScreen({ onRunScan, scan, scanStatus, recommendations }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedId, setSelectedId] = useState(recommendations[0]?.id);
  const selected = useMemo(
    () => recommendations.find((item) => item.id === selectedId) ?? recommendations[0],
    [recommendations, selectedId]
  );

  const startScan = () => {
    onRunScan();
  };

  return (
    <View style={styles.root}>
      <View style={styles.cameraMock}>
        {permission?.granted ? (
          <CameraView style={StyleSheet.absoluteFill} facing="front" />
        ) : null}
        {!permission?.granted ? <View style={styles.cameraFallback} /> : null}
        <View style={styles.faceGuide} />
        <View style={styles.overlayTop}>
          <Text style={styles.scanPill}>
            {scanStatus === 'scanning' ? 'Scanning face structure...' : `${scan.faceShape} face / ${Math.round(scan.confidence * 100)}%`}
          </Text>
        </View>
        <View style={styles.overlayBottom}>
          <Pressable style={styles.secondaryButton} onPress={permission?.granted ? startScan : requestPermission}>
            <Text style={styles.secondaryButtonText}>{permission?.granted ? 'Rescan' : 'Enable camera'}</Text>
          </Pressable>
          <Pressable style={styles.captureButton} onPress={startScan}>
            <View style={styles.captureInner} />
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Save</Text>
          </Pressable>
        </View>
        {!permission?.granted ? (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Camera access</Text>
            <Text style={styles.permissionText}>Enable camera to preview hairstyles on your face.</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.modes}>
        <Text style={[styles.modeChip, styles.modeChipActive]}>Hair</Text>
        <Text style={styles.modeChip}>Beard</Text>
        <Text style={styles.modeChip}>Hairline</Text>
        <Text style={styles.modeChip}>Transplant preview</Text>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Best for your {scan.faceShape} face</Text>
        <FlatList
          horizontal
          data={recommendations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedId(item.id)}
              style={[styles.card, selected?.id === item.id && styles.cardSelected]}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.length} / {item.category}</Text>
              <Text style={styles.cardBody}>{item.reason}</Text>
            </Pressable>
          )}
        />
        {selected ? (
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Barber note</Text>
            <Text style={styles.detailText}>{selected.barberNote}</Text>
            {selected.caution ? <Text style={styles.caution}>{selected.caution}</Text> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  cameraMock: {
    alignItems: 'center',
    backgroundColor: '#07080B',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flex: 1,
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
    borderColor: theme.colors.accent,
    borderRadius: 120,
    borderWidth: 2,
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
  scanPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(15,17,21,0.78)',
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
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15,17,21,0.78)',
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 82,
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800'
  },
  permissionCard: {
    backgroundColor: 'rgba(15,17,21,0.88)',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    position: 'absolute',
    width: '78%'
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
  modes: {
    flexDirection: 'row',
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
    color: '#16110A'
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
  list: {
    gap: theme.spacing.sm
  },
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
    fontSize: 12,
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
