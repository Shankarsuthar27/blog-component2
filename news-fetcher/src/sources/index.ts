import { NewsSourceAdapter } from '../types/news';
import { BhaskarJaloreAdapter } from './bhaskar';
import { PatrikaJaloreAdapter } from './patrika';
import { AmarUjalaJaloreAdapter } from './amarUjala';

export const REGISTERED_SOURCES: NewsSourceAdapter[] = [
  new BhaskarJaloreAdapter(),
  new PatrikaJaloreAdapter(),
  new AmarUjalaJaloreAdapter(),
];

export { BhaskarJaloreAdapter, PatrikaJaloreAdapter, AmarUjalaJaloreAdapter };
