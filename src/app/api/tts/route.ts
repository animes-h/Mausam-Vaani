import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

/**
 * Server-side TTS Route for High-Fidelity Audio Synthesis
 * Provides crystal-clear Hindi ('hi') and English ('en') neural audio.
 * Includes parallel chunk synthesis, in-memory caching, Range requests, and dual GET/POST support.
 */

const audioCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 120;

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

async function synthesizeAudio(cleanText: string, lang: 'hi' | 'en'): Promise<Buffer> {
  const cacheKey = `${lang}:${cleanText}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

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
    throw new Error('No valid text to synthesize');
  }

  // Limit to reasonable duration (first 10 chunks max ~50-60 sec)
  const activeChunks = chunks.slice(0, 10);

  // Fetch in parallel for lightning-fast latency
  const audioBuffers = await Promise.all(
    activeChunks.map((chunk) => fetchTtsChunk(chunk, lang))
  );

  const combined = Buffer.concat(audioBuffers.filter((buf) => buf.length > 0));

  if (combined.length === 0) {
    throw new Error('Failed to synthesize speech audio');
  }

  // Store in cache
  if (audioCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = audioCache.keys().next().value;
    if (firstKey) audioCache.delete(firstKey);
  }
  audioCache.set(cacheKey, combined);

  return combined;
}

function respondWithAudio(req: NextRequest, audioBuffer: Buffer) {
  const rangeHeader = req.headers.get('range');

  if (rangeHeader && rangeHeader.startsWith('bytes=')) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10) || 0;
    const end = parts[1] ? parseInt(parts[1], 10) : audioBuffer.length - 1;

    if (start >= audioBuffer.length || end >= audioBuffer.length) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          'Content-Range': `bytes */${audioBuffer.length}`,
        },
      });
    }

    const chunk = new Uint8Array(audioBuffer.subarray(start, end + 1));
    return new NextResponse(chunk, {
      status: 206,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Range': `bytes ${start}-${end}/${audioBuffer.length}`,
        'Content-Length': chunk.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  }

  return new NextResponse(new Uint8Array(audioBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawText = searchParams.get('text') || '';
  const langParam = searchParams.get('lang') || 'hi';

  const cleanText = rawText
    .replace(/[*#_`~]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    return new NextResponse('Text parameter is required', { status: 400 });
  }

  const isHindi =
    langParam === 'hi' ||
    langParam === 'hi-IN' ||
    /[\u0900-\u097F]/.test(cleanText);
  const lang: 'hi' | 'en' = isHindi ? 'hi' : 'en';

  try {
    const audioBuffer = await synthesizeAudio(cleanText, lang);
    return respondWithAudio(req, audioBuffer);
  } catch (error: any) {
    console.warn('[TTS API GET] Audio generation error:', error?.message || error);
    return new NextResponse(error?.message || 'TTS generation failed', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.text || '';
    const langParam = body.lang || 'hi';

    const cleanText = rawText
      .replace(/[*#_`~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      return new NextResponse('Text is required in body', { status: 400 });
    }

    const isHindi =
      langParam === 'hi' ||
      langParam === 'hi-IN' ||
      /[\u0900-\u097F]/.test(cleanText);
    const lang: 'hi' | 'en' = isHindi ? 'hi' : 'en';

    const audioBuffer = await synthesizeAudio(cleanText, lang);
    return respondWithAudio(req, audioBuffer);
  } catch (error: any) {
    console.warn('[TTS API POST] Audio generation error:', error?.message || error);
    return new NextResponse(error?.message || 'TTS generation failed', { status: 500 });
  }
}
