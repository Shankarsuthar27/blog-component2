import { NewsSourceAdapter } from '../types/news';
import { BhaskarJaloreAdapter } from './bhaskar';
import { PatrikaJaloreAdapter } from './patrika';
import { GoogleNewsJaloreAdapter } from './googleNews';

export const REGISTERED_SOURCES: NewsSourceAdapter[] = [
  new BhaskarJaloreAdapter(),
  new PatrikaJaloreAdapter(),
  new GoogleNewsJaloreAdapter(),
];

export { BhaskarJaloreAdapter, PatrikaJaloreAdapter, GoogleNewsJaloreAdapter };


