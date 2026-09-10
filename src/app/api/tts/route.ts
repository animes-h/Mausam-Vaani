import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

/**
 * Server-side TTS Route for High-Fidelity Audio Synthesis
 * Provides seamless fallback when the client browser or OS has no native Hindi TTS voice installed.
 * Supports Hindi ('hi') and English ('en').
 */

function fetchTtsChunk(text: string, lang: string = 'hi'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const cleanChunk = text.trim();
    if (!cleanChunk) {
      return resolve(Buffer.alloc(0));
    }
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
      lang
    )}&q=${encodeURIComponent(cleanChunk)}`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`TTS provider returned HTTP ${res.statusCode}`));
        }
        const data: Buffer[] = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => resolve(Buffer.concat(data)));
      }
    );

    req.on('error', (err) => reject(err));
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('TTS request timed out'));
    });
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawText = searchParams.get('text') || '';
  const langParam = searchParams.get('lang') || 'hi';

  // Strip Markdown, hashtags, asterisks, URLs, and excessive whitespace
  const cleanText = rawText
    .replace(/[*#_`~]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    return new NextResponse('Text parameter is required', { status: 400 });
  }

  // Normalize language code
  const isHindi =
    langParam === 'hi' ||
    langParam === 'hi-IN' ||
    /[\u0900-\u097F]/.test(cleanText);
  const lang = isHindi ? 'hi' : 'en';

  try {
    // Split into natural sentence chunks respecting Hindi danda (।) and Western punctuation
    const rawSentences = cleanText.match(/[^।?!.\n]+[।?!.\n]?/g) || [cleanText];
    const chunks: string[] = [];

    for (const sent of rawSentences) {
      const s = sent.trim();
      if (!s) continue;
      // Google TTS URL limit is ~180 chars per chunk
      if (s.length > 180) {
        const subChunks = s.match(/.{1,180}(\s|$)/g) || [s];
        for (const sub of subChunks) {
          const sc = sub.trim();
          if (sc) chunks.push(sc);
        }
      } else {
        chunks.push(s);
      }
    }

    if (chunks.length === 0) {
      return new NextResponse('No valid text to synthesize', { status: 400 });
    }

    // Limit to reasonable duration (first 10 chunks max ~50-60 sec)
    const activeChunks = chunks.slice(0, 10);
    const audioBuffers: Buffer[] = [];

    // Fetch sequentially to preserve exact audio order
    for (const chunk of activeChunks) {
      const buf = await fetchTtsChunk(chunk, lang);
      if (buf.length > 0) {
        audioBuffers.push(buf);
      }
    }

    const combined = Buffer.concat(audioBuffers);

    if (combined.length === 0) {
      return new NextResponse('Failed to synthesize speech', { status: 502 });
    }

    return new NextResponse(combined, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combined.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.warn('[TTS API] Audio generation error:', error?.message || error);
    return new NextResponse(error?.message || 'TTS generation failed', { status: 500 });
  }
}
