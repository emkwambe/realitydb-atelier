// Client-safe rubric axis metadata (display name + max score per axis).
// Identical across all six company rubrics, so it lives here as a single
// constant. Crucially this carries NO hiddenStory / passCriteria / failCriteria,
// so client components (e.g. the results page) can render the per-axis table
// without importing the full rubric object — which would ship hiddenStory (the
// grading answer key) to the browser.

export interface AxisMeta {
  name: string;
  maxScore: number;
}

export const RUBRIC_AXIS_META: Record<string, AxisMeta> = {
  segmentation: { name: "Segmentation", maxScore: 20 },
  causal_reasoning: { name: "Causal reasoning", maxScore: 20 },
  quantification: { name: "Quantification", maxScore: 20 },
  recommendation: { name: "Recommendation", maxScore: 20 },
  epistemic_honesty: { name: "Epistemic honesty", maxScore: 20 },
};
