import { FaceMeasurements, FaceScanResult, FaceShape } from '@stylemirror/shared';

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

export function mockAnalyzeFace(): FaceScanResult {
  const measurements: FaceMeasurements = {
    faceLength: 1.42,
    foreheadWidth: 0.92,
    cheekboneWidth: 1,
    jawWidth: 0.88,
    chinRoundness: 0.52
  };

  return {
    confidence: 0.82,
    faceShape: classifyFaceShape(measurements),
    hairlineStage: 'mature',
    measurements,
    signals: [
      {
        id: 'cheekbone_width',
        label: 'Cheekbone width',
        value: 'Most prominent',
        description: 'Cheekbones measure wider than forehead and jaw, which points toward a diamond face profile.'
      },
      {
        id: 'jaw_balance',
        label: 'Jaw balance',
        value: 'Tapered',
        description: 'A slightly narrower jaw benefits from styles with controlled volume rather than heavy side bulk.'
      },
      {
        id: 'hairline',
        label: 'Hairline',
        value: 'Mature',
        description: 'The app should recommend natural styles and optional hairline previews without medical claims.'
      }
    ]
  };
}
