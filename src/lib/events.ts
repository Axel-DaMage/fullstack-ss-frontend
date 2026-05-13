export const Events = {
  PET_CREATED: 'pet:created',
  PET_UPDATED: 'pet:updated',
  PET_DELETED: 'pet:deleted',
  MATCH_CREATED: 'match:created',
  MATCH_UPDATED: 'match:updated',
  SECTION_CHANGED: 'app:section-changed',
} as const;

export interface PetEvent {
  id: string;
  name: string;
  type: string;
}

export interface MatchEvent {
  id: string;
  petId: string;
  adopterId: string;
}