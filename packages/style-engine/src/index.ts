import { FaceScanResult, FaceShape, HairlineStage } from '@stylemirror/shared';

export type HairstyleRecommendation = {
  id: string;
  name: string;
  category: 'classic' | 'modern' | 'hairline' | 'long' | 'short' | 'transplant_preview';
  length: 'short' | 'medium' | 'long';
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
    category: 'transplant_preview',
    length: 'short',
    faceShapes: ['oval', 'round', 'square', 'rectangle', 'diamond', 'heart', 'triangle'],
    hairlineStages: ['mature', 'mild_temples', 'receding_hairline'],
    reason: 'Shows a natural mature hairline direction rather than an unrealistically low, dense front line.',
    barberNote: 'Use this only as a visual consultation reference. A dermatologist or hair-restoration surgeon should assess medical options.',
    caution: 'Educational preview only. This is not a diagnosis or treatment plan.'
  }
];

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

export function recommendHairstyles(scan: FaceScanResult): HairstyleRecommendation[] {
  return catalog
    .map((style) => {
      const faceScore = style.faceShapes.includes(scan.faceShape) ? 2 : 0;
      const hairlineScore = style.hairlineStages.includes(scan.hairlineStage) ? 1 : 0;
      return { style, score: faceScore + hairlineScore };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.style);
}
