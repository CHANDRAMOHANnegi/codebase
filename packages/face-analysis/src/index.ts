import { FaceLandmarks, FaceMeasurements, FaceScanResult, FaceShape, Point2D } from '@stylemirror/shared';

function distance(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function classifyFaceShape(measurements: FaceMeasurements): FaceShape {
  const { faceLength, foreheadWidth, cheekboneWidth, jawWidth, chinRoundness } = measurements;
  const width = Math.max(foreheadWidth, cheekboneWidth, jawWidth);
  const lengthRatio = faceLength / width;
  const jawToCheek = jawWidth / cheekboneWidth;
  const foreheadToJaw = foreheadWidth / jawWidth;

  if (lengthRatio > 1.55) return 'rectangle';
  if (cheekboneWidth > foreheadWidth * 1.08 && cheekboneWidth > jawWidth * 1.08) return 'diamond';
  if (foreheadToJaw > 1.18) return 'heart';
  if (jawToCheek > 1.12) return 'triangle';
  if (jawToCheek > 0.94 && chinRoundness < 0.45) return 'square';
  if (lengthRatio < 1.22 && chinRoundness > 0.55) return 'round';
  return 'oval';
}

export function measurementsFromLandmarks(landmarks: FaceLandmarks): FaceMeasurements {
  const faceLength = distance(landmarks.hairlineCenter, landmarks.chin);
  const foreheadWidth = distance(landmarks.foreheadLeft, landmarks.foreheadRight);
  const cheekboneWidth = distance(landmarks.cheekLeft, landmarks.cheekRight);
  const jawWidth = distance(landmarks.jawLeft, landmarks.jawRight);
  const jawMidpoint: Point2D = {
    x: (landmarks.jawLeft.x + landmarks.jawRight.x) / 2,
    y: (landmarks.jawLeft.y + landmarks.jawRight.y) / 2
  };
  const chinDepth = distance(jawMidpoint, landmarks.chin);
  const chinRoundness = Math.min(1, Math.max(0, chinDepth / Math.max(jawWidth, 0.01)));

  return {
    cheekboneWidth,
    chinRoundness,
    faceLength,
    foreheadWidth,
    jawWidth
  };
}

export function analyzeFaceLandmarks(landmarks: FaceLandmarks): FaceScanResult {
  const measurements = measurementsFromLandmarks(landmarks);
  const hairlineHeight = distance(landmarks.hairlineCenter, landmarks.browCenter);
  const faceLength = Math.max(measurements.faceLength, 0.01);
  const hairlineRatio = hairlineHeight / faceLength;
  const hairlineStage = hairlineRatio > 0.28 ? 'mature' : 'none';
  const faceShape = classifyFaceShape(measurements);

  return {
    confidence: 0.88,
    faceShape,
    hairlineStage,
    measurements,
    signals: [
      {
        id: 'cheekbone_width',
        label: 'Cheekbone width',
        value: measurements.cheekboneWidth >= measurements.foreheadWidth ? 'Most prominent' : 'Balanced',
        description: 'Cheekbone, forehead, and jaw proportions are used to estimate the face type.'
      },
      {
        id: 'jaw_balance',
        label: 'Jaw balance',
        value: measurements.jawWidth < measurements.cheekboneWidth ? 'Tapered' : 'Strong',
        description: 'Jaw width helps decide whether styles should add softness, height, or side balance.'
      },
      {
        id: 'hairline',
        label: 'Hairline',
        value: hairlineStage === 'mature' ? 'Mature' : 'Balanced',
        description: 'Hairline distance is treated as style guidance only, not as a medical diagnosis.'
      }
    ]
  };
}

export function mockAnalyzeFace(): FaceScanResult {
  const landmarks: FaceLandmarks = {
    browCenter: { x: 0.5, y: 0.34 },
    cheekLeft: { x: 0.22, y: 0.48 },
    cheekRight: { x: 0.78, y: 0.48 },
    chin: { x: 0.5, y: 0.86 },
    foreheadLeft: { x: 0.3, y: 0.24 },
    foreheadRight: { x: 0.7, y: 0.24 },
    hairlineCenter: { x: 0.5, y: 0.16 },
    jawLeft: { x: 0.29, y: 0.68 },
    jawRight: { x: 0.71, y: 0.68 }
  };

  return analyzeFaceLandmarks(landmarks);
}

/**
 * Convert raw expo-face-detector FaceFeature output into normalized FaceLandmarks.
 * All coordinates are normalized to [0..1] relative to image dimensions.
 *
 * @param detection  - The face object from FaceDetector.detectFacesAsync()
 * @param imageWidth - Width of the captured image in pixels
 * @param imageHeight - Height of the captured image in pixels
 */
export function landmarksFromFaceDetection(
  detection: {
    bounds: { origin: { x: number; y: number }; size: { width: number; height: number } };
    leftEarPosition?: { x: number; y: number } | null;
    rightEarPosition?: { x: number; y: number } | null;
    leftEyePosition?: { x: number; y: number } | null;
    rightEyePosition?: { x: number; y: number } | null;
    leftCheekPosition?: { x: number; y: number } | null;
    rightCheekPosition?: { x: number; y: number } | null;
    mouthPosition?: { x: number; y: number } | null;
    noseBasePosition?: { x: number; y: number } | null;
    bottomMouthPosition?: { x: number; y: number } | null;
    rightMouthPosition?: { x: number; y: number } | null;
    leftMouthPosition?: { x: number; y: number } | null;
  },
  imageWidth: number,
  imageHeight: number
): FaceLandmarks {
  const norm = (pt: { x: number; y: number } | null | undefined, axis: 'x' | 'y'): number => {
    if (!pt) return axis === 'x' ? 0.5 : 0.5;
    return axis === 'x'
      ? Math.min(1, Math.max(0, pt.x / imageWidth))
      : Math.min(1, Math.max(0, pt.y / imageHeight));
  };

  const { bounds } = detection;

  // Face bounding box corners (normalized)
  const faceTop = bounds.origin.y / imageHeight;
  const faceBottom = (bounds.origin.y + bounds.size.height) / imageHeight;
  const faceLeft = bounds.origin.x / imageWidth;
  const faceRight = (bounds.origin.x + bounds.size.width) / imageWidth;
  const faceCenterX = (faceLeft + faceRight) / 2;

  // Estimate hairline: 15% above the eye level
  const eyeY = detection.leftEyePosition
    ? detection.leftEyePosition.y / imageHeight
    : faceTop + (faceBottom - faceTop) * 0.33;

  const hairlineY = Math.max(faceTop - (eyeY - faceTop) * 0.25, faceTop);
  const foreheadY = faceTop + (eyeY - faceTop) * 0.4;

  // Cheeks: use ML Kit cheek positions if available, else estimate from bounds
  const cheekLeftX = norm(detection.leftCheekPosition, 'x');
  const cheekRightX = norm(detection.rightCheekPosition, 'x');
  const cheekY =
    detection.leftCheekPosition
      ? norm(detection.leftCheekPosition, 'y')
      : faceTop + (faceBottom - faceTop) * 0.55;

  // Jaw: 80% down the face from top
  const jawY = faceTop + (faceBottom - faceTop) * 0.80;
  const jawLeftX = faceLeft + (faceRight - faceLeft) * 0.15;
  const jawRightX = faceRight - (faceRight - faceLeft) * 0.15;

  // Chin: bottom of bounds
  const chinY = faceBottom - (faceBottom - faceTop) * 0.04;

  // Brow center: between eyes
  const browY = detection.leftEyePosition
    ? norm(detection.leftEyePosition, 'y') - (eyeY - faceTop) * 0.18
    : faceTop + (faceBottom - faceTop) * 0.30;

  return {
    browCenter: { x: faceCenterX, y: browY },
    cheekLeft: { x: cheekLeftX, y: cheekY },
    cheekRight: { x: cheekRightX, y: cheekY },
    chin: { x: norm(detection.bottomMouthPosition, 'x') || faceCenterX, y: chinY },
    foreheadLeft: { x: faceLeft + (faceRight - faceLeft) * 0.18, y: foreheadY },
    foreheadRight: { x: faceRight - (faceRight - faceLeft) * 0.18, y: foreheadY },
    hairlineCenter: { x: faceCenterX, y: hairlineY },
    jawLeft: { x: jawLeftX, y: jawY },
    jawRight: { x: jawRightX, y: jawY }
  };
}
