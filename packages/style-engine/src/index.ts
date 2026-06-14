import { FaceScanResult, FaceShape, HairlineStage, StylePreference } from '@stylemirror/shared';

export type HairstyleRecommendation = {
  id: string;
  name: string;
  category: 'classic' | 'modern' | 'hairline' | 'long' | 'short' | 'transplant_preview';
  length: 'short' | 'medium' | 'long';
  audience: 'men' | 'women' | 'unisex';
  faceShapes: FaceShape[];
  hairlineStages: HairlineStage[];
  reason: string;
  barberNote: string;
  caution?: string;
};

const catalog: HairstyleRecommendation[] = [
  {
    id: 'textured_crop',
    name: 'Textured Crop',
    audience: 'men',
    category: 'hairline',
    length: 'short',
    faceShapes: ['oval', 'round', 'square', 'heart'],
    hairlineStages: ['mature', 'mild_temples', 'receding_hairline'],
    reason: 'Keeps the top controlled and uses texture to soften a mature or slightly receded hairline.',
    barberNote: 'Ask for short textured layers on top with a low or mid fade. Keep the fringe irregular, not blunt.'
  },
  {
    id: 'clean_side_fade',
    name: 'Clean Side Fade',
    audience: 'men',
    category: 'modern',
    length: 'short',
    faceShapes: ['oval', 'round', 'square', 'diamond'],
    hairlineStages: ['none', 'mature', 'mild_temples'],
    reason: 'Clean sides add structure and make the face look sharper without hiding natural proportions.',
    barberNote: 'Keep the sides tight and blend softly into a textured top. Avoid making the top too tall.'
  },
  {
    id: 'medium_layered',
    name: 'Medium Layers',
    audience: 'unisex',
    category: 'long',
    length: 'medium',
    faceShapes: ['oval', 'rectangle', 'diamond', 'heart'],
    hairlineStages: ['none', 'mature'],
    reason: 'Layering adds movement and balances longer or more angular face shapes.',
    barberNote: 'Use medium layers with light side movement. Keep weight near the temples for face balance.'
  },
  {
    id: 'side_swept_fringe',
    name: 'Side-Swept Fringe',
    audience: 'unisex',
    category: 'hairline',
    length: 'medium',
    faceShapes: ['rectangle', 'diamond', 'heart', 'oval'],
    hairlineStages: ['mature', 'mild_temples', 'receding_hairline'],
    reason: 'A controlled fringe can reduce forehead emphasis while keeping the result natural.',
    barberNote: 'Cut a soft, side-swept fringe with texture. Keep the hairline coverage natural and lightweight.'
  },
  {
    id: 'classic_side_part',
    name: 'Classic Side Part',
    audience: 'men',
    category: 'classic',
    length: 'short',
    faceShapes: ['oval', 'square', 'rectangle'],
    hairlineStages: ['none', 'mature', 'mild_temples'],
    reason: 'A timeless shape that works well with strong jawlines and professional styling.',
    barberNote: 'Ask for a classic taper and a natural side part. Use matte product for a softer finish.'
  },
  {
    id: 'conservative_hairline_preview',
    name: 'Conservative Hairline Preview',
    audience: 'unisex',
    category: 'transplant_preview',
    length: 'short',
    faceShapes: ['oval', 'round', 'square', 'rectangle', 'diamond', 'heart', 'triangle'],
    hairlineStages: ['mature', 'mild_temples', 'receding_hairline'],
    reason: 'Shows a natural mature hairline direction rather than an unrealistically low, dense front line.',
    barberNote: 'Use this only as a visual consultation reference. A dermatologist or hair-restoration surgeon should assess medical options.',
    caution: 'Educational preview only. This is not a diagnosis or treatment plan.'
  },
  {
    id: 'soft_pixie',
    name: 'Soft Pixie',
    audience: 'women',
    category: 'short',
    length: 'short',
    faceShapes: ['oval', 'heart', 'diamond', 'square'],
    hairlineStages: ['none', 'mature'],
    reason: 'A soft pixie highlights cheekbones and keeps the sides controlled without adding too much width.',
    barberNote: 'Ask for a soft pixie with feathered texture around the temples and light volume at the crown.'
  },
  {
    id: 'collarbone_lob',
    name: 'Collarbone Lob',
    audience: 'women',
    category: 'modern',
    length: 'medium',
    faceShapes: ['oval', 'round', 'square', 'heart'],
    hairlineStages: ['none', 'mature', 'mild_temples'],
    reason: 'A collarbone-length lob frames the jaw and cheekbones while staying easy to style day to day.',
    barberNote: 'Ask for a collarbone lob with soft face-framing pieces and light internal layers.'
  },
  {
    id: 'curtain_bangs_layers',
    name: 'Curtain Bangs + Layers',
    audience: 'women',
    category: 'long',
    length: 'long',
    faceShapes: ['rectangle', 'diamond', 'heart', 'oval'],
    hairlineStages: ['none', 'mature', 'mild_temples'],
    reason: 'Curtain bangs reduce forehead emphasis and layers add movement around longer or angular face shapes.',
    barberNote: 'Ask for long layers with curtain bangs starting near the cheekbone, blended softly into the sides.'
  },
  {
    id: 'low_volume_bun',
    name: 'Low Volume Bun',
    audience: 'women',
    category: 'classic',
    length: 'long',
    faceShapes: ['oval', 'diamond', 'square', 'rectangle'],
    hairlineStages: ['none', 'mature', 'mild_temples', 'receding_hairline'],
    reason: 'A softer low bun keeps the crown neat and avoids pulling the hairline too tightly.',
    barberNote: 'Keep face-framing pieces loose and avoid very tight tension near the temples.'
  }
];

function matchesPreference(style: HairstyleRecommendation, preference: StylePreference): boolean {
  if (preference === 'all') return true;
  return style.audience === preference || style.audience === 'unisex';
}

export function getHairlineGuidance(scan: FaceScanResult): string[] {
  const common = [
    'Use style language like mature hairline or temple recession, not negative labels.',
    'Prefer matte texture and controlled volume for natural density.'
  ];

  if (scan.hairlineStage === 'none') {
    return ['Most styles are open. Choose based on face balance and maintenance level.', ...common];
  }

  if (scan.hairlineStage === 'crown_thinning' || scan.hairlineStage === 'diffuse_thinning') {
    return [
      'Shorter textured styles usually look fuller than long flat styles.',
      'Avoid heavy shine products because they can reveal scalp contrast.',
      ...common
    ];
  }

  return [
    'Textured crop, side-swept fringe, and clean fade options can soften temple visibility.',
    'Avoid very high slick-back styles if the goal is to reduce hairline emphasis.',
    ...common
  ];
}

export function recommendHairstyles(
  scan: FaceScanResult,
  preference: StylePreference = 'all'
): HairstyleRecommendation[] {
  return catalog
    .filter((style) => matchesPreference(style, preference))
    .map((style) => {
      const faceScore = style.faceShapes.includes(scan.faceShape) ? 2 : 0;
      const hairlineScore = style.hairlineStages.includes(scan.hairlineStage) ? 1 : 0;
      return { style, score: faceScore + hairlineScore };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.style);
}
