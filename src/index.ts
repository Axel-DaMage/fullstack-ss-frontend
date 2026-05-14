export { PetCard, type Pet, type PetCardProps } from './components/PetCard';
export { PetsList, type PetsListProps } from './components/PetsList';
export { Dashboard, type DashboardProps } from './components/Dashboard';
export { MatchesList, type MatchesListProps } from './components/MatchesList';

export { eventEmitter } from './lib/EventEmitter';
export { Events } from './lib/events';
export { useEvent } from './lib/useEvent';

export interface AppConfig {
  apiUrl: string;
  enableLogging: boolean;
}

export const createAppConfig = (options?: Partial<AppConfig>): AppConfig => ({
  apiUrl: options?.apiUrl || '/api',
  enableLogging: options?.enableLogging || false,
});

export default {
  PetCard,
  PetsList,
  Dashboard,
  MatchesList,
};