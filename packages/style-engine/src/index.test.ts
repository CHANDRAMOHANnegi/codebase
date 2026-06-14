import assert from 'node:assert/strict';
import { FaceScanResult } from '@stylemirror/shared';
import { getHairlineGuidance, recommendHairstyles } from './index';

const baseScan: FaceScanResult = {
  faceShape: 'oval',
  hairlineStage: 'none',
  confidence: 0.88,
  measurements: {
    faceLength: 1.25,
    foreheadWidth: 0.9,
    cheekboneWidth: 1,
    jawWidth: 0.86,
    chinRoundness: 0.55
  },
  signals: []
};

function withScan(overrides: Partial<FaceScanResult>): FaceScanResult {
  return { ...baseScan, ...overrides };
}

const menResults = recommendHairstyles(baseScan, 'men');
assert.ok(menResults.length > 0, 'men preference should return recommendations');
assert.ok(
  menResults.every((style) => style.audience !== 'women'),
  'men preference should not include women-only styles'
);

const womenResults = recommendHairstyles(baseScan, 'women');
assert.ok(womenResults.length > 0, 'women preference should return recommendations');
assert.ok(
  womenResults.every((style) => style.audience !== 'men'),
  'women preference should not include men-only styles'
);

const recedingResults = recommendHairstyles(
  withScan({ faceShape: 'round', hairlineStage: 'receding_hairline' }),
  'all'
);
assert.ok(
  recedingResults.some((style) => style.category === 'transplant_preview'),
  'receding hairline scans should include a conservative transplant preview'
);

const guidance = getHairlineGuidance(withScan({ hairlineStage: 'diffuse_thinning' }));
assert.ok(
  guidance.some((item) => item.includes('shine products')),
  'diffuse thinning guidance should mention scalp contrast from shine products'
);
