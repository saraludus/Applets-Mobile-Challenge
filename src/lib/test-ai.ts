
import {
    analyserCompatibilite,
    type ProfilColoc,
} from './ai-compatibility';

// Profil de référence
const alice: ProfilColoc = {
  id: '1',
  nom: 'Alice',
  budgetMin: 600,
  budgetMax: 900,
  proprete: 4,
  sommeil: 'soir',
  fumeur: false,
  accepteFumeur: false,
  animaux: false,
  accepteAnimaux: true,
};

// Profil compatible
const sarah: ProfilColoc = {
  ...alice,
  id: '2',
  nom: 'Sarah',
};

// Profil moins compatible
const lea: ProfilColoc = {
  id: '3',
  nom: 'Léa',
  budgetMin: 1200,
  budgetMax: 1600,
  proprete: 1,
  sommeil: 'matin',
  fumeur: true,
  accepteFumeur: true,
  animaux: true,
  accepteAnimaux: true,
};

export type ResultatTest = {
  nom: string;
  reussi: boolean;
};

export function testerIA() {
  const tests: ResultatTest[] = [];

  function verifier(nom: string, condition: boolean) {
    tests.push({ nom, reussi: condition });

    if (condition) {
      console.log(`✅ PASS : ${nom}`);
    } else {
      console.error(`❌ FAIL : ${nom}`);
    }
  }

  // E09-18 : Vérifier les scores
  const debut = performance.now();

  const compatible = analyserCompatibilite(
    alice,
    sarah,
    'fr'
  );

  const incompatible = analyserCompatibilite(
    alice,
    lea,
    'fr'
  );

  const duree = performance.now() - debut;

  verifier(
    'E09-18 : profils identiques = 100 %',
    compatible.score === 100
  );

  verifier(
    'E09-18 : score entre 0 et 100',
    incompatible.score >= 0 &&
      incompatible.score <= 100
  );

  verifier(
    'E09-18 : profils compatibles mieux notés',
    compatible.score > incompatible.score
  );

  verifier(
    'E09-18 : score symétrique',
    analyserCompatibilite(alice, lea).score ===
      analyserCompatibilite(lea, alice).score
  );

  // E09-19 : Explications
  verifier(
    'E09-19 : explication générée',
    compatible.explication.length > 10
  );

  verifier(
    'E09-19 : points forts présents',
    compatible.pointsForts.length > 0
  );

  verifier(
    'E09-19 : points attention présents',
    incompatible.pointsAttention.length > 0
  );

  // E09-23 : Français et anglais
  const resultatFR = analyserCompatibilite(
    alice,
    sarah,
    'fr'
  );

  const resultatEN = analyserCompatibilite(
    alice,
    sarah,
    'en'
  );

  verifier(
    'E09-23 : explication française',
    resultatFR.explication.includes('compatibilité')
  );

  verifier(
    'E09-23 : explication anglaise',
    resultatEN.explication.includes('compatibility')
  );

  verifier(
    'E09-23 : même score dans les deux langues',
    resultatFR.score === resultatEN.score
  );

  // E09-24 : Performance du calcul local
  verifier(
    'E09-24 : calcul inférieur à 1000 ms',
    duree < 1000
  );

  // Résumé
  const reussis = tests.filter(
    (test) => test.reussi
  ).length;

  const echoues = tests.length - reussis;

  console.log('-----------------------------');
  console.log('RÉSULTATS DES TESTS IA');
  console.log(`Tests réussis : ${reussis}`);
  console.log(`Tests échoués : ${echoues}`);
  console.log(`Durée : ${duree.toFixed(2)} ms`);
  console.log('-----------------------------');

  return {
    tests,
    reussis,
    echoues,
    duree,
  };
}
