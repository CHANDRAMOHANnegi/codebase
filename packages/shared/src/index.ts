export type FaceShape =
  | 'oval'
  | 'round'
  | 'square'
  | 'rectangle'
  | 'diamond'
  | 'heart'
  | 'triangle';

export type HairlineStage =
  | 'none'
  | 'mature'
  | 'mild_temples'
  | 'receding_hairline'
  | 'crown_thinning'
  | 'diffuse_thinning';

export type StylePreference = 'men' | 'women' | 'all';

export type ScanSignal = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type FaceMeasurements = {
  faceLength: number;
  foreheadWidth: number;
  cheekboneWidth: number;
  jawWidth: number;
  chinRoundness: number;
};

export type FaceScanResult = {
  faceShape: FaceShape;
  hairlineStage: HairlineStage;
  confidence: number;
  measurements: FaceMeasurements;
  signals: ScanSignal[];
};
