import { StyleSheet, View } from 'react-native';
import { theme } from '../theme/theme';

type StyleId =
  | 'textured_crop'
  | 'clean_side_fade'
  | 'medium_layered'
  | 'side_swept_fringe'
  | 'classic_side_part'
  | 'conservative_hairline_preview';

type Props = {
  styleId: StyleId | string;
  /** Normalized face bounds (0..1 relative to preview container) */
  faceBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Width of the camera preview container in px */
  containerWidth: number;
  /** Height of the camera preview container in px */
  containerHeight: number;
};

/** Returns a simple color-coded label for each style category */
function styleColor(styleId: string): string {
  if (styleId.includes('fade') || styleId.includes('crop')) return '#D8A85B';
  if (styleId.includes('fringe') || styleId.includes('swept')) return '#7EC8E3';
  if (styleId.includes('medium') || styleId.includes('layer')) return '#A8EDBE';
  if (styleId.includes('classic') || styleId.includes('part')) return '#C8A8ED';
  if (styleId.includes('transplant') || styleId.includes('hairline')) return '#EDC8A8';
  return theme.colors.accent;
}

/**
 * HairstyleOverlay – draws a stylized hair silhouette on top of the camera preview.
 * Positioned using detected face bounds. Falls back to a centred default if no bounds.
 */
export function HairstyleOverlay({ styleId, faceBounds, containerWidth, containerHeight }: Props) {
  // Convert normalized bounds to pixel coords
  const fb = faceBounds ?? { x: 0.2, y: 0.1, width: 0.6, height: 0.65 };
  const left = fb.x * containerWidth;
  const top = fb.y * containerHeight;
  const faceW = fb.width * containerWidth;
  const faceH = fb.height * containerHeight;

  // Hair sits above and around the face
  const hairTop = top - faceH * 0.22;
  const hairLeft = left - faceW * 0.08;
  const hairWidth = faceW * 1.16;
  const hairHeight = faceH * 0.48;

  const color = styleColor(styleId);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          left: hairLeft,
          top: hairTop,
          width: hairWidth,
          height: hairHeight
        }
      ]}
    >
      {/* Main hair mass */}
      <View
        style={[
          styles.hairMass,
          {
            backgroundColor: `${color}55`,
            borderColor: `${color}CC`,
            borderRadius: hairWidth * 0.5,
            height: hairHeight * 0.85,
            width: hairWidth
          }
        ]}
      />

      {/* Side pieces */}
      {(styleId === 'medium_layered' || styleId === 'side_swept_fringe') && (
        <>
          <View
            style={[
              styles.sidepiece,
              {
                backgroundColor: `${color}44`,
                borderColor: `${color}AA`,
                height: faceH * 0.5,
                left: -faceW * 0.08,
                top: hairHeight * 0.4,
                width: faceW * 0.2,
                borderRadius: 10
              }
            ]}
          />
          <View
            style={[
              styles.sidepiece,
              {
                backgroundColor: `${color}44`,
                borderColor: `${color}AA`,
                height: faceH * 0.5,
                right: -faceW * 0.08,
                top: hairHeight * 0.4,
                width: faceW * 0.2,
                borderRadius: 10
              }
            ]}
          />
        </>
      )}

      {/* Fringe for fringe/crop styles */}
      {(styleId === 'side_swept_fringe' || styleId === 'textured_crop') && (
        <View
          style={[
            styles.fringe,
            {
              backgroundColor: `${color}66`,
              borderColor: `${color}CC`,
              height: faceH * 0.1,
              width: hairWidth * (styleId === 'side_swept_fringe' ? 0.65 : 0.8),
              alignSelf: styleId === 'side_swept_fringe' ? 'flex-start' : 'center',
              marginLeft: styleId === 'side_swept_fringe' ? hairWidth * 0.1 : 0,
              borderRadius: 8
            }
          ]}
        />
      )}

      {/* Hairline preview: add a gentle forehead gradient */}
      {(styleId === 'conservative_hairline_preview') && (
        <View
          style={[
            styles.hairlineBar,
            {
              borderColor: `${color}BB`,
              width: hairWidth * 0.6,
              alignSelf: 'center'
            }
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    position: 'absolute'
  },
  hairMass: {
    borderWidth: 2,
    position: 'absolute',
    top: 0
  },
  sidepiece: {
    borderWidth: 1.5,
    position: 'absolute'
  },
  fringe: {
    borderWidth: 1.5,
    bottom: -4,
    position: 'absolute'
  },
  hairlineBar: {
    borderBottomWidth: 2.5,
    borderStyle: 'dashed',
    bottom: -8,
    position: 'absolute'
  }
});
