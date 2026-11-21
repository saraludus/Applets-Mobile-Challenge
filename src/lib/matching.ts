// ───────── E03-01: Compatibility criteria ─────────
// Five criteria, each scored 0..1 for a pair of people.
//   budget       do their monthly budget ranges overlap?
//   cleanliness  how close are their cleanliness levels (1-5)?
//   sleep        early / night / flexible
//   preferences  smoking and pets: what each person does vs. what the other accepts
//   lifestyle    overlap of tags like 'quiet', 'social', 'cooks'

export type Sleep = 'early' | 'night' | 'flexible';

export type Profile = {
  id: string;
  name: string;
  age: number | null;
  budget_min: number | null;
  budget_max: number | null;
  cleanliness: number | null;      // 1 = relaxed ... 5 = spotless
  sleep: Sleep | null;
  smoking: boolean | null;         // I smoke
  accepts_smoking: boolean | null; // I'm fine living with a smoker
  has_pets: boolean | null;        // I have pets
  accepts_pets: boolean | null;    // I'm fine living with pets
  lifestyle: string[] | null;
  bio?: string | null;
};

// ───────── E03-02: Scoring weights (sum to 100) ─────────
export const WEIGHTS = {
  budget: 30,
  cleanliness: 20,
  sleep: 20,
  preferences: 20,
  lifestyle: 10,
} as const;

export type Criterion = keyof typeof WEIGHTS;

type Part = {
  key: Criterion;
  score: number | null;   // 0..1, or null when we lack the data (E03-10)
  note: string;           // shown to the user as a reason
  dealbreaker?: boolean;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const missing = (key: Criterion): Part => ({ key, score: null, note: '' });

// ───────── E03-03: Budget compatibility ─────────
export function budgetCompat(a: Profile, b: Profile): Part {
  const vals = [a.budget_min, a.budget_max, b.budget_min, b.budget_max];
  if (vals.some((v) => v == null)) return missing('budget');

  const overlap = Math.min(a.budget_max!, b.budget_max!) - Math.max(a.budget_min!, b.budget_min!);
  if (overlap >= 0) {
    // ranges overlap: 0.6 for a single shared point, up to 1.0 for a large shared range
    const narrowest = Math.max(Math.min(a.budget_max! - a.budget_min!, b.budget_max! - b.budget_min!), 1);
    return { key: 'budget', score: 0.6 + 0.4 * clamp01(overlap / narrowest), note: 'Your budgets overlap' };
  }
  // no overlap: lose score as the gap grows, reaching 0 at a $500 gap
  return { key: 'budget', score: clamp01(0.5 + overlap / 1000), note: `Budgets are $${Math.abs(overlap)} apart` };
}

// ───────── E03-05: Cleanliness compatibility ─────────
export function cleanlinessCompat(a: Profile, b: Profile): Part {
  if (a.cleanliness == null || b.cleanliness == null) return missing('cleanliness');
  const diff = Math.abs(a.cleanliness - b.cleanliness);          // 0..4
  return {
    key: 'cleanliness',
    score: 1 - diff / 4,
    note: diff <= 1 ? 'Similar cleanliness standards' : 'Different cleanliness standards',
  };
}

// ───────── E03-06: Sleep schedule compatibility ─────────
export function sleepCompat(a: Profile, b: Profile): Part {
  if (!a.sleep || !b.sleep) return missing('sleep');
  if (a.sleep === b.sleep) return { key: 'sleep', score: 1, note: 'Same sleep schedule' };
  if (a.sleep === 'flexible' || b.sleep === 'flexible')
    return { key: 'sleep', score: 0.75, note: 'One of you is flexible about sleep' };
  return { key: 'sleep', score: 0.2, note: 'Opposite sleep schedules (early vs. night)' };
}

// ───────── E03-07: Preference compatibility (smoking, pets) ─────────
// A mismatch here is a dealbreaker: e.g. I smoke and you don't accept smoking.
export function preferencesCompat(a: Profile, b: Profile): Part {
  const checks: { ok: boolean; note: string }[] = [];

  const smoke = (smoker: Profile, other: Profile) => {
    if (smoker.smoking == null || other.accepts_smoking == null) return;
    const ok = !smoker.smoking || other.accepts_smoking;
    checks.push({ ok, note: ok ? '' : `${smoker.name} smokes and ${other.name} does not accept smoking` });
  };
  const pets = (owner: Profile, other: Profile) => {
    if (owner.has_pets == null || other.accepts_pets == null) return;
    const ok = !owner.has_pets || other.accepts_pets;
    checks.push({ ok, note: ok ? '' : `${owner.name} has pets and ${other.name} does not accept pets` });
  };
  smoke(a, b); smoke(b, a); pets(a, b); pets(b, a);

  if (!checks.length) return missing('preferences');
  const failed = checks.filter((c) => !c.ok);
  return {
    key: 'preferences',
    score: (checks.length - failed.length) / checks.length,
    note: failed.length ? failed[0].note : 'Smoking and pet preferences fit',
    dealbreaker: failed.length > 0,
  };
}

// ───────── E03-04: Lifestyle compatibility ─────────
export function lifestyleCompat(a: Profile, b: Profile): Part {
  if (!a.lifestyle?.length || !b.lifestyle?.length) return missing('lifestyle');
  const setA = new Set(a.lifestyle);
  const shared = b.lifestyle.filter((t) => setA.has(t));
  const union = new Set([...a.lifestyle, ...b.lifestyle]).size;     // Jaccard similarity
  return {
    key: 'lifestyle',
    score: shared.length / union,
    note: shared.length ? `You both like: ${shared.join(', ')}` : 'No shared lifestyle tags',
  };
}

// ───────── E03-08 / E03-09 / E03-10: Combine, normalize, handle missing data ─────────
const NEUTRAL = 50;          // what we assume about information we don't have
const DEALBREAKER_CAP = 40;  // a dealbreaker can never produce a "good" match

export type MatchResult = {
  score: number;                                   // integer 0..100
  reasons: string[];                               // human-readable, shown on the card
  breakdown: Partial<Record<Criterion, number>>;   // per-criterion 0..100, for debugging/UI
  completeness: number;                            // 0..1 share of weight we could score
  dealbreaker: boolean;
};

export function compatibility(a: Profile, b: Profile): MatchResult {
  const parts = [
    budgetCompat(a, b),
    cleanlinessCompat(a, b),
    sleepCompat(a, b),
    preferencesCompat(a, b),
    lifestyleCompat(a, b),
  ];
  const known = parts.filter((p) => p.score !== null);
  const knownWeight = known.reduce((s, p) => s + WEIGHTS[p.key], 0);
  const totalWeight = Object.values(WEIGHTS).reduce((s, w) => s + w, 0); // 100

  // E03-10: no data at all -> neutral score, not 0 and not 100
  if (knownWeight === 0) {
    return { score: NEUTRAL, reasons: ['Not enough profile information yet'], breakdown: {}, completeness: 0, dealbreaker: false };
  }

  // E03-08: weighted average over the criteria we can score
  const weighted = known.reduce((s, p) => s + WEIGHTS[p.key] * (p.score as number), 0) / knownWeight; // 0..1

  // E03-10: with little data, pull the score toward neutral so one matching field can't show "100%"
  const completeness = knownWeight / totalWeight;
  let raw = 100 * (completeness * weighted + (1 - completeness) * (NEUTRAL / 100));

  const dealbreaker = known.some((p) => p.dealbreaker);
  if (dealbreaker) raw = Math.min(raw, DEALBREAKER_CAP);

  // E03-09: normalize to an integer in 0..100
  const score = Math.round(clamp01(raw / 100) * 100);

  const breakdown: MatchResult['breakdown'] = {};
  known.forEach((p) => { breakdown[p.key] = Math.round((p.score as number) * 100); });

  return {
    score,
    reasons: known.map((p) => p.note).filter(Boolean),
    breakdown,
    completeness,
    dealbreaker,
  };
}

// ───────── E03-12: Sort recommendations by compatibility ─────────
export type Ranked = MatchResult & { profile: Profile };

export function rankCandidates(me: Profile, others: Profile[]): Ranked[] {
  return others
    .filter((p) => p.id !== me.id)
    .map((p) => ({ profile: p, ...compatibility(me, p) }))
    .sort((x, y) =>
      y.score - x.score ||                         // best score first
      y.completeness - x.completeness ||           // tie: the more complete profile first
      x.profile.name.localeCompare(y.profile.name) // tie: stable alphabetical order
    );
}