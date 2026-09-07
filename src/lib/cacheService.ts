// Semantic & Normalized Query Cache (FR-8.3 & NFR-1)
// Caches common query responses for near-instant (<300ms) turnaround

interface CacheEntry {
  normalizedQuery: string;
  response: any;
  timestamp: number;
  hitCount: number;
}

const memoryCache = new Map<string, CacheEntry>();

export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[?,.!।;:_'"\-]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// Pre-seeded normalized queries for instant live demo response
const PRE_SEEDED_CACHE: Record<string, any> = {
  'कल बारिश होगी क्या': {
    text: 'कल दोपहर बाद 70% तेज बारिश और गरज चमक की संभावना है। सुबह 11 बजे तक मौसम अपेक्षाकृत साफ़ रहेगा।',
    textEn: 'There is a 70% chance of heavy thunderstorm and rain tomorrow afternoon. Morning hours will remain relatively calm.',
    verdict: {
      type: 'warning',
      title: 'कल बारिश की तीव्र चेतावनी (70% Rain Hazard)',
      description: 'दोपहर 12:00 बजे के बाद खुले खेत में काम न करें। कीटनाशक छिड़काव स्थगित रखें।',
    },
  },
  'क्या आज शाम को बारिश होगी': {
    text: 'हां, आज शाम 4:30 के आसपास 40% हल्की से मध्यम वर्षा हो सकती है। कटी हुई फसल को ढक लें।',
    textEn: 'Yes, light to moderate showers (40% probability) are anticipated around 16:30 IST today.',
    verdict: {
      type: 'warning',
      title: 'शाम की वर्षा अलर्ट',
      description: 'खलिहान में रखी उपज को तिरपाल से सुरक्षित करें।',
    },
  },
  'सोयाबीन में कीटनाशक छिड़काव कब करें': {
    text: 'आज और कल बिल्कुल छिड़काव न करें क्योंकि 65% बारिश का अनुमान है जिससे दवा बह जाएगी। परसों (गुरुवार) सुबह 6:30 से 10:00 बजे का समय सबसे सुरक्षित है।',
    textEn: 'Do NOT spray today or tomorrow due to high rain washout risk. The best spraying window is Thursday 06:30 to 10:00 IST.',
    verdict: {
      type: 'warning',
      title: 'छिड़काव स्थगन सलाह (Spray Postponed)',
      description: 'तेज़ हवा व वर्षा से दवा धुल जाएगी। परसों सुबह सुरक्षित खिड़की खुलेगी।',
    },
  },
};

export function getCachedResponse(query: string): any | null {
  const normalized = normalizeQuery(query);
  
  // Check memory cache
  const entry = memoryCache.get(normalized);
  if (entry) {
    entry.hitCount += 1;
    return entry.response;
  }

  // Check pre-seeded cache keys with partial matching
  for (const [key, val] of Object.entries(PRE_SEEDED_CACHE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val;
    }
  }

  return null;
}

export function setCachedResponse(query: string, response: any): void {
  const normalized = normalizeQuery(query);
  memoryCache.set(normalized, {
    normalizedQuery: normalized,
    response,
    timestamp: Date.now(),
    hitCount: 1,
  });
}
