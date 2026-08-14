import crypto from 'crypto';

// Mapping for Hindi devanagari characters to English phonetics
const HINDI_TRANSLITERATION_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h', 'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gya',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h',
  '्': '', '़': '', '।': '', '॥': '', 'जालोर': 'jalore', 'राजस्थान': 'rajasthan', 'खबर': 'khabar', 'समाचार': 'samachar'
};

export function generateSlug(title: string, sourceUrl?: string): string {
  if (!title || typeof title !== 'string') {
    const randomHash = crypto.createHash('md5').update(sourceUrl || Date.now().toString()).digest('hex').slice(0, 8);
    return `news-jalore-${randomHash}`;
  }

  let text = title;

  // Perform Hindi transliteration character by character
  let transliterated = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (HINDI_TRANSLITERATION_MAP[char] !== undefined) {
      transliterated += HINDI_TRANSLITERATION_MAP[char];
    } else {
      transliterated += char;
    }
  }

  // Sanitize to lowercase alphanumeric hyphens
  let slug = transliterated
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-'); // collapse multiple hyphens

  // Ensure minimum length & fallback if title is empty or unparseable
  if (!slug || slug.length < 3) {
    const hash = crypto.createHash('md5').update(title + (sourceUrl || '')).digest('hex').slice(0, 8);
    slug = `jalore-news-${hash}`;
  }

  // Truncate long slugs gracefully at 80 chars
  if (slug.length > 80) {
    slug = slug.substring(0, 80).replace(/-[^-]*$/, '');
  }

  return slug;
}
