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
    confidence: 0.82,
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
