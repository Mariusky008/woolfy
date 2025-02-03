export type GamePhaseType = 'DAY' | 'NIGHT' | 'VOTE' | 'DUSK' | 'DAWN';

export interface GamePhase {
  type: GamePhaseType;
  remainingTime: number;
  startTime: Date;
  endTime: Date;
}

export const PHASE_NAMES: Record<GamePhaseType, string> = {
  DAY: 'Phase Diurne',
  NIGHT: 'Phase Nocturne',
  VOTE: 'Phase de Vote',
  DUSK: 'Crépuscule',
  DAWN: 'Aube'
};

export const PHASE_DESCRIPTIONS: Record<GamePhaseType, string> = {
  DAY: 'Les villageois débattent pour démasquer les loups-garous.',
  NIGHT: 'Les créatures de la nuit se réveillent pour accomplir leurs sombres desseins.',
  VOTE: 'Le village doit décider qui sera exécuté.',
  DUSK: 'Le soleil se couche, la nuit approche...',
  DAWN: 'Le soleil se lève, révélant les événements de la nuit.'
}; 