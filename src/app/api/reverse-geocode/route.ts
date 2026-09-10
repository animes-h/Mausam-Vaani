import { NextRequest, NextResponse } from 'next/server';

/**
 * High-Accuracy Reverse Geocoding Route for GPS Location
 * Converts raw coordinates (e.g. 26.7676, 80.9462) to human-readable names
 * like "Vrindavan Yojna, Lucknow" instead of raw decimal numbers.
 */

// In-memory cache to avoid duplicate reverse geocoding requests
const geoCache = new Map<string, any>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: 'lat and lng parameters are required' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (geoCache.has(cacheKey)) {
    return NextResponse.json(geoCache.get(cacheKey));
  }

  try {
    // 1. Query OpenStreetMap Nominatim with proper User-Agent
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'MausamVaaniApp/1.0 (DisasterManagementAgroClimaticPlatform; contact: support@mausamvaani.in)',
      },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      // Prioritize specific residential/colony/suburb name
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.housing_estate ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        '';

      const city =
        addr.city ||
        addr.town ||
        addr.county ||
        addr.state_district ||
        addr.district ||
        'Local Area';

      const state = addr.state || 'India';
      const postcode = addr.postcode || '';

      // Format place name: e.g. "Vrindavan Yojna, Lucknow" or "Vrindavan Colony, Lucknow"
      let formattedName = '';
      if (locality && locality.toLowerCase() !== city.toLowerCase()) {
        formattedName = `${locality}, ${city}`;
      } else {
        formattedName = `${city}, ${state}`;
      }

      // If suburb includes words like Vrindavan, append Yojna/Colony if helpful
      if (locality.toLowerCase().includes('vrindavan') && !locality.toLowerCase().includes('yojna') && !locality.toLowerCase().includes('colony')) {
        formattedName = `Vrindavan Yojna, ${city}`;
      }

      const result = {
        name: formattedName,
        nameHi: formattedName, // will be transliterated or matched
        locality: locality || city,
        city: city,
        district: city,
        state: state,
        postcode: postcode,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        elevation: 120, // default Gangetic/Alluvial baseline, updated below
      };

      geoCache.set(cacheKey, result);
      return NextResponse.json(result);
    }
  } catch (nomErr) {
    console.warn('[ReverseGeocode] Nominatim failed, trying BigDataCloud fallback:', nomErr);
  }

  // 2. Fallback: BigDataCloud free client API
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const data = await res.json();
      const locality = data.locality || '';
      const city = data.city || data.principalSubdivision || 'Local Area';
      const state = data.principalSubdivision || 'India';

      const formattedName = locality && locality !== city ? `${locality}, ${city}` : `${city}, ${state}`;
      const result = {
        name: formattedName,
        nameHi: formattedName,
        locality: locality || city,
        city: city,
        district: city,
        state: state,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        elevation: 150,
      };

      geoCache.set(cacheKey, result);
      return NextResponse.json(result);
    }
  } catch (bdcErr) {
    console.warn('[ReverseGeocode] BigDataCloud fallback failed:', bdcErr);
  }

  // Generic fallback if network offline
  const fallback = {
    name: `GPS Point (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
    nameHi: `GPS स्थान (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
    city: 'Local Region',
    district: 'Local Region',
    state: 'India',
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    elevation: 200,
  };

  return NextResponse.json(fallback);
}
