// Dictionary loader

import type { Language } from '../config';
import { en } from './en';
import { ko } from './ko';
import { zh } from './zh';
import { ja } from './ja';
import { es } from './es';
import { pt } from './pt';
import { fr } from './fr';
import { th } from './th';
import { vi } from './vi';

const dictionaries = {
  en,
  ko,
  zh,
  ja,
  es,
  pt,
  fr,
  th,
  vi,
};

export async function getDictionary(lang: Language) {
  return dictionaries[lang] ?? en;
}
