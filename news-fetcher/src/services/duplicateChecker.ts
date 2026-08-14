import { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export function calculateContentHash(title: string, excerpt?: string | null, content?: string | null): string {
  const payload = `${title.trim()}|${(excerpt || '').trim()}|${(content || '').trim()}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export async function isDuplicate(
  supabase: SupabaseClient,
  sourceUrl: string,
  slug: string,
  contentHash: string
): Promise<{ isDuplicate: boolean; existingId?: string; reason?: string }> {
  try {
    // 1. Check source_url
    const { data: byUrl } = await supabase
      .from('news_articles')
      .select('id, source_url, content_hash')
      .eq('source_url', sourceUrl)
      .maybeSingle();

    if (byUrl) {
      return { isDuplicate: true, existingId: byUrl.id, reason: 'Matching source_url' };
    }

    // 2. Check slug
    const { data: bySlug } = await supabase
      .from('news_articles')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle();

    if (bySlug) {
      return { isDuplicate: true, existingId: bySlug.id, reason: 'Matching slug' };
    }

    // 3. Check content_hash
    if (contentHash) {
      const { data: byHash } = await supabase
        .from('news_articles')
        .select('id, content_hash')
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (byHash) {
        return { isDuplicate: true, existingId: byHash.id, reason: 'Matching content_hash' };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Error checking duplicate article:', error);
    return { isDuplicate: false };
  }
}
