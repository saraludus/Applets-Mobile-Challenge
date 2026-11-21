
export type ProfilColoc = {
  id: string;
  nom: string;
  budgetMin: number;
  budgetMax: number;
  proprete: number; // 1 à 5
  sommeil: 'matin' | 'soir' | 'flexible';
  fumeur: boolean;
  accepteFumeur: boolean;
  animaux: boolean;
  accepteAnimaux: boolean;
};

export type ResultatCompatibilite = {
  score: number;
  niveau: 'excellent' | 'bon' | 'moyen' | 'faible';
  explication: string;
  pointsForts: string[];
  pointsAttention: string[];
};

export function analyserCompatibilite(
  a: ProfilColoc,
  b: ProfilColoc,
  langue: 'fr' | 'en' = 'fr'
): ResultatCompatibilite {
  const fr = langue === 'fr';
  const pointsForts: string[] = [];
  const pointsAttention: string[] = [];

  // Budget : 30 points
  const intersection = Math.max(
    0,
    Math.min(a.budgetMax, b.budgetMax) -
      Math.max(a.budgetMin, b.budgetMin)
  );

  const amplitude = Math.max(
    a.budgetMax - a.budgetMin,
    b.budgetMax - b.budgetMin,
    1
  );

  const budgetScore = Math.round(
    (intersection / amplitude) * 30
  );

  if (intersection > 0) {
    pointsForts.push(
      fr ? 'Vos budgets sont compatibles.' :
      'Your budgets are compatible.'
    );
  } else {
    pointsAttention.push(
      fr ? 'Vos budgets ne se chevauchent pas.' :
      'Your budgets do not overlap.'
    );
  }

  // Propreté : 20 points
  const ecartProprete = Math.abs(
    a.proprete - b.proprete
  );

  const propreteScore = Math.max(
    0, 20 - ecartProprete * 5
  );

  if (ecartProprete <= 1) {
    pointsForts.push(
      fr ? 'Vous avez des habitudes de propreté similaires.' :
      'You have similar cleanliness habits.'
    );
  } else {
    pointsAttention.push(
      fr ? 'Vos attentes concernant la propreté diffèrent.' :
      'Your cleanliness expectations differ.'
    );
  }

  // Sommeil : 20 points
  const memeSommeil = a.sommeil === b.sommeil;
  const flexible =
    a.sommeil === 'flexible' ||
    b.sommeil === 'flexible';

  const sommeilScore = memeSommeil
    ? 20
    : flexible
      ? 15
      : 0;

  if (sommeilScore >= 15) {
    pointsForts.push(
      fr ? 'Vos horaires de sommeil sont compatibles.' :
      'Your sleep schedules are compatible.'
    );
  } else {
    pointsAttention.push(
      fr ? 'Vos rythmes de sommeil sont différents.' :
      'Your sleep schedules are different.'
    );
  }

  // Tabac : 15 points
  const tabacCompatible =
    (!a.fumeur || b.accepteFumeur) &&
    (!b.fumeur || a.accepteFumeur);

  const tabacScore = tabacCompatible ? 15 : 0;

  if (!tabacCompatible) {
    pointsAttention.push(
      fr ? 'Il existe une incompatibilité concernant le tabac.' :
      'There is a smoking preference conflict.'
    );
  } else {
    pointsForts.push(
      fr ? 'Vos préférences concernant le tabac sont compatibles.' :
      'Your smoking preferences are compatible.'
    );
  }

  // Animaux : 15 points
  const animauxCompatibles =
    (!a.animaux || b.accepteAnimaux) &&
    (!b.animaux || a.accepteAnimaux);

  const animauxScore = animauxCompatibles ? 15 : 0;

  if (!animauxCompatibles) {
    pointsAttention.push(
      fr ? 'Vos préférences concernant les animaux diffèrent.' :
      'Your pet preferences differ.'
    );
  } else {
    pointsForts.push(
      fr ? 'Vos préférences concernant les animaux sont compatibles.' :
      'Your pet preferences are compatible.'
    );
  }

  const score = Math.min(
    100,
    Math.max(
      0,
      budgetScore +
      propreteScore +
      sommeilScore +
      tabacScore +
      animauxScore
    )
  );

  const niveau =
    score >= 85 ? 'excellent' :
    score >= 65 ? 'bon' :
    score >= 40 ? 'moyen' : 'faible';

  const introduction = fr
    ? `Votre compatibilité est de ${score} %.`
    : `Your compatibility score is ${score}%.`;

  const conclusion = fr
    ? score >= 65
      ? 'Vous pourriez bien vous entendre en colocation.'
      : 'Discutez de vos différences avant de décider de vivre ensemble.'
    : score >= 65
      ? 'You could be a good roommate match.'
      : 'Discuss your differences before deciding to live together.';

  return {
    score,
    niveau,
    explication: `${introduction} ${conclusion}`,
    pointsForts,
    pointsAttention,
  };
}
