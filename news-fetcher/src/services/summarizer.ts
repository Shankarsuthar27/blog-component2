export interface SummarizerOutput {
  summary: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  keywords: string[];
}

/**
 * AI Summarizer Service
 * Strictly respects truthfulness: does NOT invent fake quotes, fake numbers, or fake claims.
 */
export async function generateAISummary(
  title: string,
  content: string,
  sourceName: string
): Promise<SummarizerOutput> {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  // 1. If an AI API Key is configured, attempt calling Gemini API endpoint
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a professional Hindi news editor for a Jalore local news platform. 
Summarize the following article strictly based on the provided text.
CRITICAL RULES:
- Do NOT invent quotes, fake statistics, fake names, or unsupported facts.
- Remain 100% faithful to the provided text.
- Output JSON format ONLY with keys: summary, excerpt, seoTitle, seoDescription, tags, keywords.

Title: ${title}
Source: ${sourceName}
Content: ${content}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return {
            summary: parsed.summary || title,
            excerpt: parsed.excerpt || title,
            seoTitle: parsed.seoTitle || `${title} | ${sourceName}`,
            seoDescription: parsed.seoDescription || parsed.excerpt || title,
            tags: Array.isArray(parsed.tags) ? parsed.tags : ['Jalore', 'Jalore News'],
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : ['Jalore News', sourceName],
          };
        }
      }
    } catch (err) {
      console.warn('AI Summarizer API call failed, falling back to clean factual summarizer:', err);
    }
  }

  // 2. Factual Fallback Summarizer (100% faithful, no AI API key required)
  const cleanTitle = title.trim();
  const cleanContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Extract first 2-3 key sentences
  const sentences = cleanContent.split(/(?<=[।!?.\n])\s+/).filter((s) => s.length > 10);
  const summarySentences = sentences.slice(0, 3).join(' ');
  
  const summary = summarySentences.length > 20
    ? summarySentences
    : `${cleanTitle} — ${sourceName} द्वारा जालोर की ताज़ा खबर।`;
    
  const excerpt = summarySentences.length > 20
    ? (summarySentences.length > 150 ? summarySentences.substring(0, 150) + '...' : summarySentences)
    : cleanTitle;

  return {
    summary,
    excerpt,
    seoTitle: `${cleanTitle} - जालोर समाचार | ${sourceName}`,
    seoDescription: excerpt.slice(0, 160),
    tags: ['Jalore', 'Jalore News', sourceName],
    keywords: ['Jalore', 'Jalore News', 'Rajasthan', sourceName, 'जालोर समाचार'],
  };
}
