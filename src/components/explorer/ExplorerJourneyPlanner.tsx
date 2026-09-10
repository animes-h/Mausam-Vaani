'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { RouteWaypoint } from '@/types';
import { INDIA_LOCATIONS, IndiaLocation, REGION_CATEGORIES } from '@/lib/indiaLocations';

type VehicleType = 'car' | 'truck' | 'bike';
type ChipTarget = 'destination' | 'origin' | 'waypoint';

interface PresetRoute {
  id: string;
  nameEn: string;
  nameHi: string;
  origin: string;
  destination: string;
  waypoints: string[];
  distanceKm: number;
}

interface Coord {
  lat: number;
  lng: number;
}

// Indian Highway Coordinates for accurate routing and bearings
const CITY_COORDS: Record<string, Coord> = {
  // Delhi NCR
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'greater noida': { lat: 28.4744, lng: 77.5040 },
  'ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'gurugram': { lat: 28.4595, lng: 77.0266 },
  'faridabad': { lat: 28.4089, lng: 77.3178 },

  // Uttar Pradesh
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'vrindavan yojna': { lat: 26.7676, lng: 80.9462 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'unnao': { lat: 26.5458, lng: 80.4878 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'mathura': { lat: 27.4924, lng: 77.6737 },
  'vrindavan': { lat: 27.5806, lng: 77.7006 },
  'firozabad': { lat: 27.1592, lng: 78.3957 },
  'etawah': { lat: 26.7855, lng: 79.0154 },
  'auraiya': { lat: 26.4674, lng: 79.5165 },
  'kannauj': { lat: 27.0543, lng: 79.9199 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'prayagraj': { lat: 25.4358, lng: 81.8463 },
  'allahabad': { lat: 25.4358, lng: 81.8463 },
  'ayodhya': { lat: 26.7922, lng: 82.1998 },
  'gorakhpur': { lat: 26.7606, lng: 83.3732 },
  'jhansi': { lat: 25.4484, lng: 78.5685 },
  'meerut': { lat: 28.9845, lng: 77.7064 },
  'bareilly': { lat: 28.3670, lng: 79.4304 },
  'aligarh': { lat: 27.8974, lng: 78.0880 },
  'moradabad': { lat: 28.8386, lng: 78.7733 },
  'sultanpur': { lat: 26.2648, lng: 82.0727 },
  'jaunpur': { lat: 25.7464, lng: 82.6837 },
  'raebareli': { lat: 26.2303, lng: 81.2409 },

  // Madhya Pradesh
  'indore': { lat: 22.7196, lng: 75.8577 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'ujjain': { lat: 23.1765, lng: 75.7885 },
  'dewas': { lat: 22.9676, lng: 76.0534 },
  'ashta': { lat: 23.0189, lng: 76.7214 },
  'sehore': { lat: 23.2033, lng: 77.0844 },
  'ratlam': { lat: 23.3315, lng: 75.0367 },
  'shajapur': { lat: 23.4285, lng: 76.2755 },
  'sanwer': { lat: 22.9774, lng: 75.8286 },
  'sonkatch': { lat: 22.9818, lng: 76.3687 },
  'maksi': { lat: 23.2625, lng: 76.1475 },
  'dhar': { lat: 22.5975, lng: 75.2974 },
  'khargone': { lat: 21.8228, lng: 75.6111 },
  'khandwa': { lat: 21.8314, lng: 76.3498 },
  'gwalior': { lat: 26.2183, lng: 78.1828 },
  'jabalpur': { lat: 23.1815, lng: 79.9864 },
  'sagar': { lat: 23.8388, lng: 78.7378 },
  'rewa': { lat: 24.5362, lng: 81.3037 },
  'satna': { lat: 24.6005, lng: 80.8322 },
  'narmadapuram': { lat: 22.7519, lng: 77.7289 },
  'pipariya': { lat: 22.7619, lng: 78.3553 },
  'narsinghpur': { lat: 22.9469, lng: 79.1952 },

  // Rajasthan
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'kota': { lat: 25.2138, lng: 75.8648 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'ajmer': { lat: 26.4499, lng: 74.6399 },
  'dausa': { lat: 26.8932, lng: 76.3377 },

  // Punjab, Haryana, Chandigarh, HP, UK
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'ludhiana': { lat: 30.9010, lng: 75.8573 },
  'amritsar': { lat: 31.6340, lng: 74.8723 },
  'jalandhar': { lat: 31.3260, lng: 75.5762 },
  'ambala': { lat: 30.3782, lng: 76.7767 },
  'karnal': { lat: 29.6857, lng: 76.9905 },
  'panipat': { lat: 29.3909, lng: 76.9635 },
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'haridwar': { lat: 29.9457, lng: 78.1642 },
  'shimla': { lat: 31.1048, lng: 77.1734 },

  // Maharashtra, Gujarat, Goa
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'navi mumbai': { lat: 19.0330, lng: 73.0297 },
  'lonavala': { lat: 18.7557, lng: 73.4091 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'dhule': { lat: 20.9042, lng: 74.7749 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },

  // South
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'hosur': { lat: 12.7409, lng: 77.8253 },
  'krishnagiri': { lat: 12.5186, lng: 78.2137 },
  'vellore': { lat: 12.9165, lng: 79.1325 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },

  // East
  'patna': { lat: 25.5941, lng: 85.1376 },
  'buxar': { lat: 25.5647, lng: 83.9777 },
  'ghazipur': { lat: 25.5840, lng: 83.5770 },
  'gaya': { lat: 24.7914, lng: 85.0002 },
  'ranchi': { lat: 23.3441, lng: 85.3096 },
  'jamshedpur': { lat: 22.8046, lng: 86.2029 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'raipur': { lat: 21.2514, lng: 81.6296 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
};

function findCityCoords(cityName: string): Coord {
  if (!cityName) return { lat: 28.6139, lng: 77.2090 };
  const clean = cityName.toLowerCase().trim();
  if (CITY_COORDS[clean]) return CITY_COORDS[clean];

  for (const [key, coord] of Object.entries(CITY_COORDS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coord;
    }
  }

  const found = INDIA_LOCATIONS.find(
    c => c.name.toLowerCase() === clean || c.nameHi === clean || clean.includes(c.name.toLowerCase())
  );
  if (found) {
    if (found.region === 'north') return { lat: 28.5, lng: 77.8 };
    if (found.region === 'mp') return { lat: 23.2, lng: 77.4 };
    if (found.region === 'west') return { lat: 19.5, lng: 73.5 };
    if (found.region === 'south') return { lat: 13.0, lng: 79.5 };
    if (found.region === 'east') return { lat: 23.5, lng: 85.5 };
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i++) hash = (hash * 31 + clean.charCodeAt(i)) % 10000;
  return {
    lat: 22.0 + (hash % 100) * 0.07,
    lng: 76.0 + ((hash * 7) % 100) * 0.08,
  };
}

function getGreatCircleDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const EXACT_HIGHWAY_DISTANCES: Record<string, number> = {
  'delhi-lucknow': 535,
  'lucknow-delhi': 535,
  'new delhi-lucknow': 535,
  'lucknow-new delhi': 535,
  'delhi-mathura': 145,
  'mathura-delhi': 145,
  'new delhi-mathura': 145,
  'mathura-new delhi': 145,
  'mathura-agra': 55,
  'agra-mathura': 55,
  'agra-kannauj': 165,
  'kannauj-agra': 165,
  'kannauj-lucknow': 170,
  'lucknow-kannauj': 170,
  'lucknow-varanasi': 315,
  'varanasi-lucknow': 315,
  'lucknow-sultanpur': 135,
  'sultanpur-lucknow': 135,
  'sultanpur-jaunpur': 95,
  'jaunpur-sultanpur': 95,
  'jaunpur-varanasi': 85,
  'varanasi-jaunpur': 85,
  'delhi-jaipur': 280,
  'jaipur-delhi': 280,
  'new delhi-jaipur': 280,
  'jaipur-new delhi': 280,
  'indore-bhopal': 192,
  'bhopal-indore': 192,
  'indore-dewas': 36,
  'dewas-indore': 36,
  'dewas-ashta': 72,
  'ashta-dewas': 72,
  'ashta-sehore': 46,
  'sehore-ashta': 46,
  'sehore-bhopal': 38,
  'bhopal-sehore': 38,
  'indore-ujjain': 55,
  'ujjain-indore': 55,
  'mumbai-pune': 150,
  'pune-mumbai': 150,
  'mumbai-navi mumbai': 35,
  'navi mumbai-lonavala': 65,
  'lonavala-pune': 50,
  'delhi-chandigarh': 245,
  'chandigarh-delhi': 245,
  'new delhi-chandigarh': 245,
  'chandigarh-new delhi': 245,
  'lucknow-kanpur': 82,
  'kanpur-lucknow': 82,
  'lucknow-unnao': 64,
  'unnao-kanpur': 18,
  'agra-lucknow': 335,
  'lucknow-agra': 335,
  'delhi-agra': 210,
  'agra-delhi': 210,
  'bhopal-delhi': 780,
  'delhi-bhopal': 780,
  'indore-mumbai': 585,
  'mumbai-indore': 585,
  'bhopal-jabalpur': 308,
  'jabalpur-bhopal': 308,
  'bengaluru-chennai': 345,
  'chennai-bengaluru': 345,
  'patna-varanasi': 255,
  'varanasi-patna': 255,
};

function calculateSegmentDistance(fromName: string, toName: string): number {
  const k1 = `${fromName.toLowerCase().trim()}-${toName.toLowerCase().trim()}`;
  if (EXACT_HIGHWAY_DISTANCES[k1]) return EXACT_HIGHWAY_DISTANCES[k1];

  const c1 = findCityCoords(fromName);
  const c2 = findCityCoords(toName);

  const straight = getGreatCircleDistance(c1.lat, c1.lng, c2.lat, c2.lng);
  const roadDistance = Math.round(straight * 1.25);
  return Math.max(22, roadDistance);
}

function calculateBearing(c1: Coord, c2: Coord): number {
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const lat1 = (c1.lat * Math.PI) / 180;
  const lat2 = (c2.lat * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function calculateCrosswind(
  fromCoord: Coord,
  toCoord: Coord,
  baseWindSpeed: number,
  baseWindDir: number
): { crosswind: number; bearing: number } {
  const bearing = calculateBearing(fromCoord, toCoord);
  const angleDiffRad = ((bearing - baseWindDir) * Math.PI) / 180;
  const crosswind = Math.round(Math.abs(baseWindSpeed * Math.sin(angleDiffRad)));
  return { crosswind, bearing: Math.round(bearing) };
}

const PRESET_ROUTES: PresetRoute[] = [
  {
    id: 'delhi-lucknow',
    nameEn: 'New Delhi ⇄ Lucknow (Yamuna / Agra-Lucknow Exp.)',
    nameHi: 'नई दिल्ली ⇄ लखनऊ (यमुना / आगरा-लखनऊ एक्सप्रेसवे)',
    origin: 'New Delhi',
    destination: 'Lucknow',
    waypoints: ['Mathura', 'Agra', 'Kannauj'],
    distanceKm: 535,
  },
  {
    id: 'lucknow-varanasi',
    nameEn: 'Lucknow ⇄ Varanasi (Purvanchal Exp.)',
    nameHi: 'लखनऊ ⇄ वाराणसी (पूर्वांचल एक्सप्रेसवे)',
    origin: 'Lucknow',
    destination: 'Varanasi',
    waypoints: ['Sultanpur', 'Jaunpur'],
    distanceKm: 315,
  },
  {
    id: 'delhi-jaipur',
    nameEn: 'New Delhi ⇄ Jaipur (Delhi-Mumbai Exp.)',
    nameHi: 'नई दिल्ली ⇄ जयपुर (दिल्ली-मुंबई एक्सप्रेसवे)',
    origin: 'New Delhi',
    destination: 'Jaipur',
    waypoints: ['Gurugram', 'Dausa'],
    distanceKm: 280,
  },
  {
    id: 'indore-bhopal',
    nameEn: 'Indore ⇄ Bhopal (NH-46 / SH-18)',
    nameHi: 'इंदौर ⇄ भोपाल (NH-46 / SH-18)',
    origin: 'Indore',
    destination: 'Bhopal',
    waypoints: ['Dewas', 'Ashta', 'Sehore'],
    distanceKm: 192,
  },
  {
    id: 'mumbai-pune',
    nameEn: 'Mumbai ⇄ Pune (Mumbai-Pune Exp.)',
    nameHi: 'मुंबई ⇄ पुणे (मुंबई-पुणे एक्सप्रेसवे)',
    origin: 'Mumbai',
    destination: 'Pune',
    waypoints: ['Navi Mumbai', 'Lonavala'],
    distanceKm: 150,
  },
  {
    id: 'delhi-chandigarh',
    nameEn: 'New Delhi ⇄ Chandigarh (NH-44)',
    nameHi: 'नई दिल्ली ⇄ चंडीगढ़ (NH-44)',
    origin: 'New Delhi',
    destination: 'Chandigarh',
    waypoints: ['Panipat', 'Karnal', 'Ambala'],
    distanceKm: 245,
  },
  {
    id: 'lucknow-kanpur',
    nameEn: 'Lucknow ⇄ Kanpur (NH-27 / Exp.)',
    nameHi: 'लखनऊ ⇄ कानपुर (NH-27)',
    origin: 'Lucknow',
    destination: 'Kanpur',
    waypoints: ['Unnao'],
    distanceKm: 82,
  },
  {
    id: 'bhopal-delhi',
    nameEn: 'Bhopal ⇄ New Delhi (NH-44)',
    nameHi: 'भोपाल ⇄ नई दिल्ली (NH-44)',
    origin: 'Bhopal',
    destination: 'New Delhi',
    waypoints: ['Gwalior', 'Agra', 'Mathura'],
    distanceKm: 780,
  },
  {
    id: 'bhopal-jabalpur',
    nameEn: 'Bhopal ⇄ Jabalpur (NH-45)',
    nameHi: 'भोपाल ⇄ जबलपुर (NH-45)',
    origin: 'Bhopal',
    destination: 'Jabalpur',
    waypoints: ['Narmadapuram', 'Pipariya', 'Narsinghpur'],
    distanceKm: 308,
  },
  {
    id: 'patna-varanasi',
    nameEn: 'Patna ⇄ Varanasi (NH-19)',
    nameHi: 'पटना ⇄ वाराणसी (NH-19)',
    origin: 'Patna',
    destination: 'Varanasi',
    waypoints: ['Buxar', 'Ghazipur'],
    distanceKm: 255,
  },
];

// Highlighted requested key national highway hubs
const KEY_CORRIDOR_CITIES = [
  'New Delhi',
  'Lucknow',
  'Kanpur',
  'Agra',
  'Varanasi',
  'Prayagraj',
  'Jaipur',
  'Bhopal',
  'Indore',
  'Ujjain',
  'Dewas',
  'Chandigarh',
  'Gwalior',
  'Jabalpur',
  'Patna',
  'Mumbai',
  'Pune',
  'Ahmedabad',
  'Ayodhya',
  'Bengaluru',
];

export default function ExplorerJourneyPlanner() {
  const { language, location, weather } = useApp();
  const t = translations[language];

  // Route Input State - Defaulting to New Delhi -> Lucknow with real corridor stops
  const [origin, setOrigin] = useState<string>('New Delhi');
  const [destination, setDestination] = useState<string>('Lucknow');
  const [waypoints, setWaypoints] = useState<string[]>(['Mathura', 'Agra', 'Kannauj']);
  const [vehicle, setVehicle] = useState<VehicleType>('car');
  const [departureOffset, setDepartureOffset] = useState<number>(0); // hours from now
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);

  // Quick Location Chips State
  const [chipTarget, setChipTarget] = useState<ChipTarget>('destination');
  const [activeRegionTab, setActiveRegionTab] = useState<string>('featured');
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [lastInsertedFeedback, setLastInsertedFeedback] = useState<string | null>(null);

  // Autocomplete dropdown state
  const [originSuggestionsOpen, setOriginSuggestionsOpen] = useState(false);
  const [destSuggestionsOpen, setDestSuggestionsOpen] = useState(false);

  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  // Speed config by vehicle (km/h)
  const vehicleSpeed = useMemo(() => {
    switch (vehicle) {
      case 'car':
        return 65;
      case 'truck':
        return 42;
      case 'bike':
        return 48;
      default:
        return 60;
    }
  }, [vehicle]);

  // Filtered cities for the Quick Location Chips section
  const filteredChips = useMemo(() => {
    let list = INDIA_LOCATIONS;

    if (activeRegionTab === 'featured') {
      list = INDIA_LOCATIONS.filter(c => c.isLocalPriority);
    } else if (activeRegionTab !== 'all') {
      list = INDIA_LOCATIONS.filter(c => c.region === activeRegionTab);
    }

    if (citySearchQuery.trim()) {
      const q = citySearchQuery.toLowerCase().trim();
      return INDIA_LOCATIONS.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.nameHi.includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.stateHi.includes(q)
      );
    }

    return list;
  }, [activeRegionTab, citySearchQuery]);

  // Autocomplete suggestions for origin input
  const originSuggestions = useMemo(() => {
    if (!origin || origin.trim().length === 0) return INDIA_LOCATIONS.slice(0, 8);
    const q = origin.toLowerCase().trim();
    return INDIA_LOCATIONS.filter(c => c.name.toLowerCase().includes(q) || c.nameHi.includes(q)).slice(0, 8);
  }, [origin]);

  // Autocomplete suggestions for destination input
  const destSuggestions = useMemo(() => {
    if (!destination || destination.trim().length === 0) return INDIA_LOCATIONS.slice(0, 8);
    const q = destination.toLowerCase().trim();
    return INDIA_LOCATIONS.filter(c => c.name.toLowerCase().includes(q) || c.nameHi.includes(q)).slice(0, 8);
  }, [destination]);

  // Handle clicking a quick location chip
  const handleChipClick = (cityName: string, targetOverride?: ChipTarget) => {
    const target = targetOverride || chipTarget;

    if (target === 'destination') {
      setDestination(cityName);
      setLastInsertedFeedback(
        language === 'hi' ? `गंतव्य (स्थान B) में "${cityName}" जोड़ा गया` : `Destination set to "${cityName}"`
      );
    } else if (target === 'origin') {
      setOrigin(cityName);
      setLastInsertedFeedback(
        language === 'hi' ? `प्रस्थान (स्थान A) में "${cityName}" जोड़ा गया` : `Origin set to "${cityName}"`
      );
    } else {
      // Add as waypoint
      if (!waypoints.includes(cityName) && waypoints.length < 5) {
        setWaypoints([...waypoints, cityName]);
        setLastInsertedFeedback(
          language === 'hi' ? `पड़ाव (Waypoint) में "${cityName}" जोड़ा गया` : `Added "${cityName}" as stop`
        );
      }
    }

    triggerRecalculate();

    // Auto-clear feedback after 3 seconds
    setTimeout(() => {
      setLastInsertedFeedback(null);
    }, 3000);
  };

  // Handle location swap (A <-> B)
  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setWaypoints([...waypoints].reverse());
    triggerRecalculate();
  };

  // Add waypoint
  const handleAddWaypoint = () => {
    if (waypoints.length >= 5) return;
    setWaypoints([...waypoints, `Stop ${waypoints.length + 1}`]);
  };

  // Remove waypoint
  const handleRemoveWaypoint = (idx: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== idx));
    triggerRecalculate();
  };

  // Update waypoint text
  const handleUpdateWaypoint = (idx: number, val: string) => {
    const updated = [...waypoints];
    updated[idx] = val;
    setWaypoints(updated);
  };

  // Load preset
  const handleSelectPreset = (preset: PresetRoute) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setWaypoints(preset.waypoints);
    triggerRecalculate();
  };

  // Trigger calculation
  const triggerRecalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 500);
  };

  // Helper to format time given start hour and elapsed minutes
  const formatETA = (startHourOffset: number, elapsedMinutes: number) => {
    const now = new Date();
    const totalMinutes = (now.getHours() + startHourOffset) * 60 + now.getMinutes() + elapsedMinutes;
    const h = Math.floor((totalMinutes / 60) % 24);
    const m = Math.floor(totalMinutes % 60);
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m} IST`;
  };

  // Build dynamic segments between Origin -> Waypoints -> Destination
  const dynamicSegments = useMemo<RouteWaypoint[]>(() => {
    const validWaypoints = waypoints.filter(w => w && w.trim().length > 0 && !w.startsWith('Stop '));
    const allStops = [origin || 'Origin', ...validWaypoints, destination || 'Destination'];
    const segments: RouteWaypoint[] = [];

    let cumulativeMins = 0;
    const baseWind = weather?.current?.windSpeed ?? 18;
    const baseWindDir = weather?.current?.windDirection ?? 240;
    const baseTemp = weather?.current?.temperature ?? 29;
    const isStormHour = departureOffset >= 0 && departureOffset <= 1.5; // Afternoon squall window simulation
    const isEveningClear = departureOffset >= 2;

    for (let i = 0; i < allStops.length - 1; i++) {
      const fromName = allStops[i];
      const toName = allStops[i + 1];

      // Segment distance calculated dynamically from coordinates & highway curves
      const segDistance = calculateSegmentDistance(fromName, toName);
      const segDurationMins = Math.round((segDistance / vehicleSpeed) * 60);

      const startTimeStr = formatETA(departureOffset, cumulativeMins);
      cumulativeMins += segDurationMins;
      const endTimeStr = formatETA(departureOffset, cumulativeMins);

      const c1 = findCityCoords(fromName);
      const c2 = findCityCoords(toName);

      // Dynamic crosswind based on highway bearing relative to wind direction
      const { crosswind, bearing } = calculateCrosswind(c1, c2, baseWind, baseWindDir);

      // Dynamic squall gust factor
      const windGust = Math.max(14, Math.round(crosswind + (isStormHour ? 22 : 8) + ((i * 3) % 7)));

      // Dynamic temperature based on terrain & time of transit
      const temp = Math.round(baseTemp - (i * 0.7) + (isStormHour ? -3 : isEveningClear ? -2 : 1));

      // Dynamic visibility & surface wetness
      let riskLevel: 'low' | 'moderate' | 'severe' = 'low';
      let condition = 'Clear & Dry';
      let icon = 'wb_sunny';
      let visibility = 10;
      let surfaceStatus: 'Dry' | 'Damp' | 'Waterlogged' = 'Dry';

      if (isStormHour) {
        if (windGust >= 38 || i % 2 === 1) {
          riskLevel = 'severe';
          condition = language === 'hi' ? 'तीव्र आंधी व भारी वर्षा' : 'Severe Convective Squall / Heavy Downpour';
          icon = 'thunderstorm';
          visibility = Math.max(1.8, Number((2.4 - (i * 0.2)).toFixed(1)));
          surfaceStatus = 'Waterlogged';
        } else {
          riskLevel = 'moderate';
          condition = language === 'hi' ? 'घने बादल व तेज हवाएं' : 'Overcast & Strong Cross-Drafts';
          icon = 'cloudy_snowing';
          visibility = 5.2;
          surfaceStatus = 'Damp';
        }
      } else if (isEveningClear) {
        riskLevel = 'low';
        condition = language === 'hi' ? 'शांत शाम, सुगम दृश्यता' : 'Calm Transit Skies';
        icon = 'nights_stay';
        visibility = 9.5;
        surfaceStatus = 'Dry';
      } else {
        if (windGust >= 30) {
          riskLevel = 'moderate';
          condition = language === 'hi' ? 'तेज क्रॉसविंड्स व आंशिक बादल' : 'Moderate Crosswinds & Gusts';
          icon = 'air';
          visibility = 7.0;
          surfaceStatus = 'Dry';
        } else {
          riskLevel = 'low';
          condition = language === 'hi' ? 'साफ़ व शुष्क राजमार्ग' : 'Favorable Transit Conditions';
          icon = 'wb_sunny';
          visibility = 10.0;
          surfaceStatus = 'Dry';
        }
      }

      segments.push({
        name: `${fromName} → ${toName}`,
        distanceKm: segDistance,
        eta: `${startTimeStr} - ${endTimeStr}`,
        temperature: temp,
        condition,
        icon,
        windGustKm: windGust,
        visibilityKm: visibility,
        surfaceStatus,
        riskLevel,
      });
    }

    return segments;
  }, [origin, destination, waypoints, vehicleSpeed, departureOffset, weather, language]);

  // Overall route summary metrics
  const totalDistance = dynamicSegments.reduce((acc, s) => acc + s.distanceKm, 0);
  const totalDurationMins = Math.round((totalDistance / vehicleSpeed) * 60);
  const totalHours = Math.floor(totalDurationMins / 60);
  const totalMinutesRemain = totalDurationMins % 60;
  const maxWindGust = Math.max(...dynamicSegments.map(s => s.windGustKm), 14);
  const minVisibility = Math.min(...dynamicSegments.map(s => s.visibilityKm), 10);
  const hasSevereSegment = dynamicSegments.some(s => s.riskLevel === 'severe');
  const hasModerateSegment = dynamicSegments.some(s => s.riskLevel === 'moderate');

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg">
      {/* Top Header */}
      <section className="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-surface-container-high flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[1.25rem]">route</span>
            <span>All-India & State Corridor Telemetry • National Highway Weather Network</span>
          </div>
          <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight mt-1">
            {language === 'hi' ? 'यात्रा मौसम एवं हाइवे कॉरिडोर मार्गदर्शक' : 'Point-to-Point Journey Weather Planner'}
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl">
            {language === 'hi'
              ? 'प्रस्थान (स्थान A) और गंतव्य (स्थान B) दर्ज करें अथवा त्वरित चिप्स से भारत के किसी भी शहर/राज्य को चुनें।'
              : 'Enter Origin (Point A) and Destination (Point B), or tap quick location chips for Indian cities & states to simulate corridor weather, road conditions, crosswinds, and squall lines.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={triggerRecalculate}
            disabled={isCalculating}
            className="px-4 py-2.5 rounded-2xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:bg-primary-container hover:text-on-primary transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span className={`material-symbols-outlined text-[1.125rem] ${isCalculating ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>
              {isCalculating
                ? language === 'hi'
                  ? 'गणना जारी...'
                  : 'Calculating...'
                : language === 'hi'
                ? 'मार्ग मौसम जांचें'
                : 'Calculate Route'}
            </span>
          </button>
        </div>
      </section>

      {/* Real-time Feedback Toast if user inserted via chip */}
      {lastInsertedFeedback && (
        <div className="bg-primary text-on-primary px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-md animate-fadeIn text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.125rem]">touch_app</span>
            <span>{lastInsertedFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastInsertedFeedback(null)}
            className="text-on-primary/80 hover:text-on-primary ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Corridor Alert Banner based on current route risk */}
      <section
        className={`rounded-2xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-xs border ${
          hasSevereSegment
            ? 'bg-secondary-container/20 border-secondary/30'
            : hasModerateSegment
            ? 'bg-tertiary-fixed/20 border-tertiary/30'
            : 'bg-primary-container/20 border-primary/30'
        }`}
      >
        <div className="flex items-center gap-space-md">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              hasSevereSegment
                ? 'bg-secondary text-on-secondary'
                : hasModerateSegment
                ? 'bg-tertiary text-on-tertiary'
                : 'bg-primary text-on-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[1.5rem]">
              {hasSevereSegment ? 'thunderstorm' : hasModerateSegment ? 'cloudy_snowing' : 'verified'}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-md text-xs font-bold uppercase tracking-wide text-on-surface">
                {hasSevereSegment
                  ? language === 'hi'
                    ? 'गंभीर मौसम चेतावनी: मार्ग में आंधी व जलभराव'
                    : 'Severe Weather Alert: Squall Line Ingress'
                  : hasModerateSegment
                  ? language === 'hi'
                    ? 'सावधानी: मार्ग में तेज हवा व गीली सड़कें'
                    : 'Corridor Advisory: Damp Tarmac & Crosswinds'
                  : language === 'hi'
                  ? 'मार्ग मौसम अनुकूल: सुरक्षित व साफ़ यात्रा'
                  : 'Favorable Transit Conditions'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                  hasSevereSegment
                    ? 'bg-secondary text-on-secondary'
                    : hasModerateSegment
                    ? 'bg-tertiary text-on-tertiary'
                    : 'bg-primary text-on-primary'
                }`}
              >
                {hasSevereSegment ? 'HIGH RISK' : hasModerateSegment ? 'MODERATE RISK' : 'OPTIMAL'}
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              {hasSevereSegment
                ? language === 'hi'
                  ? `अनुशंसित: 2 घंटे बाद प्रस्थान करें ताकि मार्ग के घाट व निचले हिस्सों में भारी बारिश व तेज हवाओं (अधिकतम ${maxWindGust} किमी/घंटा) से बचा जा सके।`
                  : `Departure delay recommended. Convective squall line active with peak gusts up to ${maxWindGust} km/h and reduced visibility down to ${minVisibility} km.`
                : language === 'hi'
                ? `कुल दूरी ${totalDistance} किमी। अनुमानित समय ${totalHours} घंटे ${totalMinutesRemain} मिनट। मार्ग में दृश्यता अच्छी रहेगी।`
                : `Total distance ${totalDistance} km. Estimated transit time ${totalHours}h ${totalMinutesRemain}m. Road surface conditions remain stable.`}
            </p>
          </div>
        </div>

        {/* Departure Window Recommendation Pill */}
        <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/30 shrink-0 self-end md:self-auto text-xs font-semibold">
          <span className="material-symbols-outlined text-primary text-[1rem]">nest_clock_farsight_analog</span>
          <span className="text-on-surface">
            {language === 'hi' ? 'सर्वोत्तम प्रस्थान:' : 'Best Window:'}{' '}
            <strong className="text-primary">{departureOffset === 2 ? 'Current' : '+2h Later (16:30 IST)'}</strong>
          </span>
        </div>
      </section>

      {/* Main Route Inputs Box (Point A -> Point B) */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
        {/* Header & Quick Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {language === 'hi' ? 'मार्ग निर्धारण (स्थान A से स्थान B)' : 'Route Definition (Point A to Point B)'}
            </span>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
              {language === 'hi' ? 'प्रस्थान, पड़ाव एवं गंतव्य स्थान दर्ज करें' : 'Configure Origin, Stops & Destination'}
            </h2>
          </div>

          {/* Quick Presets Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.7rem] font-bold text-on-surface-variant uppercase mr-1">
              {language === 'hi' ? 'लोकप्रिय मार्ग:' : 'Corridor Presets:'}
            </span>
            {PRESET_ROUTES.map(preset => {
              const isCurrent =
                origin.toLowerCase().includes(preset.origin.toLowerCase()) &&
                destination.toLowerCase().includes(preset.destination.toLowerCase());
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    isCurrent
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container-high'
                  }`}
                >
                  {language === 'hi' ? preset.nameHi.split('(')[0] : preset.nameEn.split('(')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-sm items-start bg-surface-container-low p-space-md rounded-2xl border border-outline-variant/30">
          {/* Point A: Origin Input with Autocomplete */}
          <div className="lg:col-span-4 flex flex-col gap-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[1.125rem]">trip_origin</span>
                <span>{language === 'hi' ? 'प्रस्थान स्थान (स्थान A)' : 'Origin Location (Point A)'}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setOrigin(location.district || location.name || 'Lucknow');
                  triggerRecalculate();
                }}
                className="text-[0.7rem] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                title="Use Current Selected District"
              >
                <span className="material-symbols-outlined text-[0.875rem]">my_location</span>
                <span>{language === 'hi' ? 'मेरा स्थान' : 'Current'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                ref={originInputRef}
                type="text"
                value={origin}
                onFocus={() => setOriginSuggestionsOpen(true)}
                onChange={e => {
                  setOrigin(e.target.value);
                  setOriginSuggestionsOpen(true);
                }}
                placeholder="Type Origin (e.g. New Delhi, Lucknow, Bhopal)..."
                className="w-full bg-surface-container-lowest text-on-surface font-semibold text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-8"
              />
              {origin && (
                <button
                  type="button"
                  onClick={() => setOrigin('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Origin Suggestions Popover */}
            {originSuggestionsOpen && originSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                <div className="p-1 flex flex-col gap-0.5">
                  {originSuggestions.map(item => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setOrigin(item.name);
                        setOriginSuggestionsOpen(false);
                        triggerRecalculate();
                      }}
                      className="px-3 py-1.5 text-left text-xs font-semibold hover:bg-primary/10 hover:text-primary rounded-lg flex items-center justify-between cursor-pointer"
                    >
                      <span>
                        {item.name} ({language === 'hi' ? item.nameHi : item.state})
                      </span>
                      <span className="text-[0.65rem] text-outline font-normal">Select</span>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-1 border-t border-surface-container-high flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOriginSuggestionsOpen(false)}
                    className="text-[0.7rem] text-outline hover:text-on-surface font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Quick local mini-chips for Origin */}
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[0.65rem] text-on-surface-variant font-medium">Quick A:</span>
              {['New Delhi', 'Lucknow', 'Indore', 'Bhopal', 'Jaipur', 'Agra'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setOrigin(c);
                    triggerRecalculate();
                  }}
                  className={`px-1.5 py-0.5 rounded text-[0.65rem] font-bold transition-all cursor-pointer ${
                    origin === c ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button (A <-> B) */}
          <div className="lg:col-span-1 flex justify-center py-2 lg:py-6">
            <button
              type="button"
              onClick={handleSwapLocations}
              className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant/40 hover:bg-primary hover:text-on-primary text-on-surface flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
              title="Swap Origin and Destination"
            >
              <span className="material-symbols-outlined text-[1.25rem] lg:rotate-90">swap_calls</span>
            </button>
          </div>

          {/* Point B: Destination Input with Autocomplete */}
          <div className="lg:col-span-4 flex flex-col gap-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[1.125rem]">location_pin</span>
                <span>{language === 'hi' ? 'गंतव्य स्थान (स्थान B)' : 'Destination (Point B)'}</span>
              </label>
              <span className="text-[0.65rem] text-on-surface-variant font-medium">
                {language === 'hi' ? 'अंतिम टर्मिनल' : 'Final Terminal'}
              </span>
            </div>

            <div className="relative">
              <input
                ref={destInputRef}
                type="text"
                value={destination}
                onFocus={() => setDestSuggestionsOpen(true)}
                onChange={e => {
                  setDestination(e.target.value);
                  setDestSuggestionsOpen(true);
                }}
                placeholder="Type Destination (e.g. Bhopal, Ashta, Mumbai)..."
                className="w-full bg-surface-container-lowest text-on-surface font-semibold text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-8"
              />
              {destination && (
                <button
                  type="button"
                  onClick={() => setDestination('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Destination Suggestions Popover */}
            {destSuggestionsOpen && destSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                <div className="p-1 flex flex-col gap-0.5">
                  {destSuggestions.map(item => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setDestination(item.name);
                        setDestSuggestionsOpen(false);
                        triggerRecalculate();
                      }}
                      className="px-3 py-1.5 text-left text-xs font-semibold hover:bg-secondary/10 hover:text-secondary rounded-lg flex items-center justify-between cursor-pointer"
                    >
                      <span>
                        {item.name} ({language === 'hi' ? item.nameHi : item.state})
                      </span>
                      <span className="text-[0.65rem] text-outline font-normal">Set B</span>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-1 border-t border-surface-container-high flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDestSuggestionsOpen(false)}
                    className="text-[0.7rem] text-outline hover:text-on-surface font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Quick local mini-chips for Destination */}
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[0.65rem] text-secondary font-bold">Quick B:</span>
              {['Lucknow', 'Varanasi', 'Kanpur', 'Bhopal', 'Jaipur', 'Pune', 'Agra'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setDestination(c);
                    triggerRecalculate();
                  }}
                  className={`px-1.5 py-0.5 rounded text-[0.65rem] font-bold transition-all cursor-pointer ${
                    destination === c ? 'bg-secondary text-on-secondary' : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Action: Recalculate / Plan Button */}
          <div className="lg:col-span-3 flex flex-col justify-end gap-1.5 pt-2 lg:pt-5">
            <button
              type="button"
              onClick={triggerRecalculate}
              disabled={isCalculating}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span className={`material-symbols-outlined text-[1.125rem] ${isCalculating ? 'animate-spin' : ''}`}>
                alt_route
              </span>
              <span>
                {isCalculating
                  ? language === 'hi'
                    ? 'गणना...'
                    : 'Routing...'
                  : language === 'hi'
                  ? 'मार्ग अपडेट करें'
                  : 'Update Route'}
              </span>
            </button>
          </div>
        </div>

        {/* Intermediate Waypoints (Stops) Section */}
        <div className="flex flex-col gap-2 bg-surface-container-lowest p-space-sm rounded-2xl border border-surface-container-high">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[1.125rem]">add_location_alt</span>
              <span className="text-xs font-bold text-on-surface">
                {language === 'hi' ? 'मध्यवर्ती पड़ाव व चेकपॉइंट (Waypoints):' : 'Intermediate Waypoints & Checkpoints:'}
              </span>
              <span className="text-[0.7rem] bg-surface-container-high px-2 py-0.5 rounded-full font-bold text-on-surface-variant">
                {waypoints.length} {language === 'hi' ? 'पड़ाव' : 'Stops'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddWaypoint}
              disabled={waypoints.length >= 5}
              className={`text-xs font-bold flex items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
                waypoints.length >= 5
                  ? 'text-outline opacity-50 cursor-not-allowed'
                  : 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[1rem]">add</span>
              <span>{language === 'hi' ? '+ पड़ाव जोड़ें' : '+ Add Stop'}</span>
            </button>
          </div>

          {/* Waypoints Input List */}
          {waypoints.length === 0 ? (
            <div className="text-center py-2 text-xs text-on-surface-variant">
              {language === 'hi'
                ? 'कोई मध्यवर्ती पड़ाव नहीं। सीधी यात्रा (स्थान A से स्थान B)।'
                : 'Direct route selected with no intermediate stops. Click "+ Add Stop" to specify highway junctions.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
              {waypoints.map((wp, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-tertiary text-[1rem] shrink-0">pin_drop</span>
                  <input
                    type="text"
                    value={wp}
                    onChange={e => handleUpdateWaypoint(idx, e.target.value)}
                    placeholder={`Waypoint ${idx + 1}`}
                    className="w-full bg-transparent text-xs font-semibold text-on-surface focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveWaypoint(idx)}
                    className="text-outline hover:text-secondary p-0.5 text-xs cursor-pointer"
                    title="Remove Waypoint"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Mode & Departure Simulation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm bg-surface-container-high/30 p-space-sm rounded-2xl">
          {/* Transport Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/30">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[1.125rem]">directions_car</span>
              <span>{language === 'hi' ? 'वाहन प्रकार:' : 'Transit Vehicle:'}</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { id: 'car', labelEn: 'Car / SUV', labelHi: 'कार / जीप', icon: 'directions_car' },
                { id: 'truck', labelEn: 'Truck / Cargo', labelHi: 'ट्रक / मालवाहक', icon: 'local_shipping' },
                { id: 'bike', labelEn: 'Motorbike', labelHi: 'दोपहिया', icon: 'two_wheeler' },
              ].map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicle(v.id as VehicleType)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    vehicle === v.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[0.875rem]">{v.icon}</span>
                  <span>{language === 'hi' ? v.labelHi : v.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Departure Offset Simulation Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/30">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[1.125rem]">schedule</span>
              <span>{language === 'hi' ? 'प्रस्थान समय:' : 'Departure Simulation:'}</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { offset: -0.5, label: '-30m' },
                { offset: 0, label: 'Now' },
                { offset: 1, label: '+1h' },
                { offset: 2, label: '+2h' },
                { offset: 4, label: '+4h' },
              ].map(opt => (
                <button
                  key={opt.offset}
                  type="button"
                  onClick={() => setDepartureOffset(opt.offset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    departureOffset === opt.offset
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE ALL-INDIA QUICK LOCATION CHIPS SECTION */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
        {/* Header & Target Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm">
          <div>
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[1.125rem]">touch_app</span>
              <span>{language === 'hi' ? 'त्वरित स्थान चयनकर्ता' : 'Quick Location Chips Explorer'}</span>
            </div>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface mt-0.5">
              {language === 'hi'
                ? 'चिप्स पर टैप करके गंतव्य (Destination) या प्रस्थान (Origin) चुनें'
                : 'Tap Any Location Chip to Instantly Insert into Route'}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {chipTarget === 'destination'
                ? language === 'hi'
                  ? '🎯 वर्तमान मोड: चिप्स पर क्लिक करने से गंतव्य (स्थान B) सेट होगा।'
                  : '🎯 Mode: Tapping a chip immediately sets it as Destination (Point B).'
                : chipTarget === 'origin'
                ? language === 'hi'
                  ? '🛫 वर्तमान मोड: चिप्स पर क्लिक करने से प्रस्थान (स्थान A) सेट होगा।'
                  : '🛫 Mode: Tapping a chip immediately sets it as Origin (Point A).'
                : language === 'hi'
                ? '➕ वर्तमान मोड: चिप्स पर क्लिक करने से नया पड़ाव (Stop) जुड़ेगा।'
                : '➕ Mode: Tapping a chip adds it as an intermediate waypoint.'}
            </p>
          </div>

          {/* Insertion Target Switcher Pill */}
          <div className="flex flex-wrap items-center gap-1 bg-surface-container p-1 rounded-2xl self-start lg:self-auto text-xs font-bold">
            <span className="text-[0.7rem] text-on-surface-variant px-2 hidden sm:inline">
              {language === 'hi' ? 'चिप लक्ष्य:' : 'Insert into:'}
            </span>
            <button
              type="button"
              onClick={() => setChipTarget('destination')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                chipTarget === 'destination'
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[1rem]">location_pin</span>
              <span>{language === 'hi' ? 'गंतव्य (स्थान B)' : 'Destination (B)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setChipTarget('origin')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                chipTarget === 'origin'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[1rem]">trip_origin</span>
              <span>{language === 'hi' ? 'प्रस्थान (स्थान A)' : 'Origin (A)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setChipTarget('waypoint')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                chipTarget === 'waypoint'
                  ? 'bg-tertiary text-on-tertiary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[1rem]">add_location</span>
              <span>{language === 'hi' ? '+ पड़ाव' : '+ Waypoint'}</span>
            </button>
          </div>
        </div>

        {/* Priority Requested Cities Bar (National & State Highway Corridors) */}
        <div className="bg-surface-container-low p-space-md rounded-2xl border border-primary/20 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[1.125rem]">star</span>
              <span className="text-xs font-extrabold text-on-surface">
                {language === 'hi'
                  ? 'प्रमुख राष्ट्रीय एवं प्रांतीय हाइवे हब्स (त्वरित 1-टैप):'
                  : 'Key National & State Highway Corridors (Fast 1-Tap):'}
              </span>
            </div>
            <span className="text-[0.65rem] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {chipTarget === 'destination' ? 'Inserting into B' : chipTarget === 'origin' ? 'Inserting into A' : 'Adding Stop'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {KEY_CORRIDOR_CITIES.map(city => {
              const isDest = destination.toLowerCase() === city.toLowerCase();
              const isOrig = origin.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleChipClick(city)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs border ${
                    isDest
                      ? 'bg-secondary text-on-secondary border-secondary ring-2 ring-secondary/30'
                      : isOrig
                      ? 'bg-primary text-on-primary border-primary ring-2 ring-primary/30'
                      : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[0.875rem]">
                    {isDest ? 'location_pin' : isOrig ? 'trip_origin' : 'add'}
                  </span>
                  <span>{city}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Region Filter Tabs & City Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-1">
          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-surface-container p-1 rounded-xl text-xs">
            {REGION_CATEGORIES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setActiveRegionTab(r.id);
                  setCitySearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeRegionTab === r.id && !citySearchQuery
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {language === 'hi' ? r.labelHi : r.labelEn}
              </button>
            ))}
          </div>

          {/* Search Across All India Cities */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={citySearchQuery}
              onChange={e => setCitySearchQuery(e.target.value)}
              placeholder="Filter 100+ cities in India..."
              className="w-full bg-surface-container text-on-surface text-xs font-semibold px-3 py-1.5 rounded-xl border border-outline-variant/40 focus:outline-none focus:border-primary pl-8"
            />
            <span className="material-symbols-outlined text-outline text-[1rem] absolute left-2.5 top-1/2 -translate-y-1/2">
              search
            </span>
            {citySearchQuery && (
              <button
                type="button"
                onClick={() => setCitySearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filtered Cities Grid */}
        <div className="bg-surface-container-low/60 p-space-sm rounded-2xl border border-outline-variant/30 flex flex-col gap-2 max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between text-[0.7rem] text-on-surface-variant px-1 font-semibold">
            <span>
              {language === 'hi' ? 'उपलब्ध शहर एवं राज्य:' : 'Available Cities & States:'} ({filteredChips.length})
            </span>
            <span>
              {language === 'hi'
                ? 'टैप करके गंतव्य में जोड़ें'
                : `Tap chip to insert into ${chipTarget.toUpperCase()}`}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filteredChips.map(loc => {
              const isDest = destination.toLowerCase() === loc.name.toLowerCase();
              const isOrig = origin.toLowerCase() === loc.name.toLowerCase();
              return (
                <button
                  key={`${loc.state}-${loc.name}`}
                  type="button"
                  onClick={() => handleChipClick(loc.name)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer border ${
                    isDest
                      ? 'bg-secondary text-on-secondary border-secondary font-bold'
                      : isOrig
                      ? 'bg-primary text-on-primary border-primary font-bold'
                      : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border-outline-variant/20'
                  }`}
                  title={`Insert ${loc.name}, ${loc.state} into ${chipTarget}`}
                >
                  <span className="font-bold">+ {loc.name}</span>
                  <span className="text-[0.65rem] opacity-70">
                    ({loc.state.split(' ')[0]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Corridor Summary Metrics Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-bold flex items-center justify-between">
            <span>{language === 'hi' ? 'कुल दूरी' : 'Total Distance'}</span>
            <span className="material-symbols-outlined text-primary text-[1.125rem]">straighten</span>
          </span>
          <div className="text-2xl font-extrabold text-on-surface my-1">{totalDistance} km</div>
          <span className="text-[0.7rem] text-on-surface-variant">
            {dynamicSegments.length} {language === 'hi' ? 'मार्ग खंड' : 'route segments'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-bold flex items-center justify-between">
            <span>{language === 'hi' ? 'अनुमानित यात्रा समय' : 'Estimated Time'}</span>
            <span className="material-symbols-outlined text-primary text-[1.125rem]">schedule</span>
          </span>
          <div className="text-2xl font-extrabold text-on-surface my-1">
            {totalHours}h {totalMinutesRemain}m
          </div>
          <span className="text-[0.7rem] text-on-surface-variant">
            {language === 'hi' ? `औसत गति: ${vehicleSpeed} किमी/घंटा` : `Avg speed: ${vehicleSpeed} km/h`}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-bold flex items-center justify-between">
            <span>{language === 'hi' ? 'अधिकतम हवा का झोंका' : 'Max Crosswinds'}</span>
            <span className="material-symbols-outlined text-tertiary text-[1.125rem]">air</span>
          </span>
          <div className={`text-2xl font-extrabold my-1 ${maxWindGust > 40 ? 'text-secondary' : 'text-on-surface'}`}>
            {maxWindGust} km/h
          </div>
          <span className="text-[0.7rem] text-on-surface-variant">
            {maxWindGust > 40
              ? language === 'hi'
                ? 'ट्रक व बाइक हेतु खतरनाक'
                : 'Hazardous for high-sided trucks'
              : language === 'hi'
              ? 'सामान्य हवा'
              : 'Manageable cross-drafts'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-bold flex items-center justify-between">
            <span>{language === 'hi' ? 'न्यूनतम दृश्यता' : 'Lowest Visibility'}</span>
            <span className="material-symbols-outlined text-primary text-[1.125rem]">visibility</span>
          </span>
          <div className={`text-2xl font-extrabold my-1 ${minVisibility < 3 ? 'text-secondary' : 'text-on-surface'}`}>
            {minVisibility} km
          </div>
          <span className="text-[0.7rem] text-on-surface-variant">
            {minVisibility < 3
              ? language === 'hi'
                ? 'तेज बारिश/धुंध में हेडलाइट जलाएं'
                : 'Heavy rain fog; use hazard lights'
              : language === 'hi'
              ? 'साफ़ दृश्यता'
              : 'Clear highway sightlines'}
          </span>
        </div>
      </section>

      {/* Visual Corridor Diagram (Waypoints Journey Bar) */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {language === 'hi' ? 'मार्ग दृश्य रूपरेखा' : 'Highway Corridor Schematic'}
            </span>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface">
              {origin} → {destination}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>{' '}
              {language === 'hi' ? 'सुरक्षित' : 'Clear'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>{' '}
              {language === 'hi' ? 'सावधानी' : 'Caution'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>{' '}
              {language === 'hi' ? 'गंभीर' : 'Severe'}
            </span>
          </div>
        </div>

        {/* Schematic Corridor Flow */}
        <div className="relative py-4 px-2">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-6 right-6 h-1 -translate-y-1/2 bg-surface-container-high z-0 hidden sm:block"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {dynamicSegments.map((seg, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedSegmentIdx(selectedSegmentIdx === idx ? null : idx)}
                className={`p-space-md rounded-2xl border flex flex-col justify-between gap-2 cursor-pointer transition-all active:scale-[0.98] ${
                  selectedSegmentIdx === idx ? 'ring-2 ring-primary shadow-md' : ''
                } ${
                  seg.riskLevel === 'severe'
                    ? 'bg-secondary/10 border-secondary/40'
                    : seg.riskLevel === 'moderate'
                    ? 'bg-tertiary-fixed/30 border-tertiary/30'
                    : 'bg-surface-container-low border-surface-container-high hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-primary">{seg.eta}</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[1.25rem] text-on-surface">
                      {seg.icon}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        seg.riskLevel === 'severe'
                          ? 'bg-secondary'
                          : seg.riskLevel === 'moderate'
                          ? 'bg-tertiary'
                          : 'bg-primary'
                      }`}
                    ></span>
                  </div>
                </div>

                <div className="flex flex-col mt-1">
                  <span className="font-headline-sm text-xs sm:text-sm font-bold text-on-surface line-clamp-1">
                    {seg.name}
                  </span>
                  <span className="text-[0.7rem] text-on-surface-variant font-medium">
                    {seg.distanceKm} km • {seg.condition}
                  </span>
                </div>

                <div className="flex flex-col gap-1 pt-2 border-t border-outline-variant/30 text-[0.7rem]">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">
                      {language === 'hi' ? 'सड़क स्थिति:' : 'Surface:'}
                    </span>
                    <span className="font-bold text-on-surface">{seg.surfaceStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">
                      {language === 'hi' ? 'हवा:' : 'Crosswinds:'}
                    </span>
                    <span className="font-bold text-on-surface">{seg.windGustKm} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">
                      {language === 'hi' ? 'दृश्यता:' : 'Visibility:'}
                    </span>
                    <span className="font-bold text-on-surface">{seg.visibilityKm} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Segment Detail Modal / Box */}
        {selectedSegmentIdx !== null && dynamicSegments[selectedSegmentIdx] && (
          <div className="p-space-md rounded-2xl bg-surface-container-low border border-primary/30 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[1.25rem]">info</span>
                <span className="font-bold text-xs text-on-surface">
                  {language === 'hi' ? 'खंड विस्तृत विवरण:' : 'Corridor Segment Telemetry:'}{' '}
                  {dynamicSegments[selectedSegmentIdx].name} ({dynamicSegments[selectedSegmentIdx].eta})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSegmentIdx(null)}
                className="text-outline hover:text-on-surface p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[1rem]">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {dynamicSegments[selectedSegmentIdx].riskLevel === 'severe'
                ? language === 'hi'
                  ? 'चेतावनी: इस खंड में मूसलाधार बारिश और 45+ किमी/घंटा की क्रॉसविंड्स सक्रिय हैं। खुले ट्रकों में अनाज भीगने का खतरा है। गति 35 किमी/घंटा से कम रखें एवं जलभराव वाली पुलिया पार न करें।'
                  : 'Hazard Alert: Severe convective squall crossing this segment. Aquaplaning danger and extreme cross-drafts. Heavy transport must tarp cargo securely. Two-wheelers advise halting at fuel station sheds.'
                : language === 'hi'
                ? 'इस खंड में सड़क सूखी व सामान्य है। दृश्यता अनुकूल है। सामान्य गति से यात्रा जारी रखी जा सकती है।'
                : 'Optimal transit conditions for this corridor leg. Surface friction nominal and visibility exceeds 8 km.'}
            </p>
          </div>
        )}
      </section>

      {/* Driver & Logistics Advisory Checklist */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[1.25rem]">local_shipping</span>
            <span className="font-bold text-xs text-on-surface">
              {language === 'hi' ? 'कृषि उपज व अनाज परिवहन' : 'Agricultural Cargo Directives'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {language === 'hi'
              ? 'सोयाबीन व गेहूं की बोरियों को डबल-लेयर वाटरप्रूफ तिरपाल से कसकर बांधें। मोड़ पर अचानक ब्रेक लगाने से बचें।'
              : 'Secure open grain trailers with heavy-duty tarpaulins. Saturated grain leads to rapid spoilage and transit weight deductions.'}
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-tertiary">
            <span className="material-symbols-outlined text-[1.25rem]">warning_amber</span>
            <span className="font-bold text-xs text-on-surface">
              {language === 'hi' ? 'हाइवे सुरक्षा व ब्रेक नियम' : 'High-Speed Brake & Wet Tarmac'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {language === 'hi'
              ? 'गीली सड़क पर ब्रेक दूरी 2.5 गुना बढ़ जाती है। आगे वाले वाहन से कम से कम 40 मीटर का सुरक्षित फासला बनाकर चलें।'
              : 'Wet road friction decreases stopping distance by 150%. Maintain a minimum 3-second buffer distance behind heavy commercial haulers on wet bypass corridors.'}
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-[1.25rem]">emergency</span>
            <span className="font-bold text-xs text-on-surface">
              {language === 'hi' ? 'आपातकालीन हाइवे सहायता' : 'Corridor Emergency Assistance'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {language === 'hi'
              ? 'NHAI आपातकालीन हेल्पलाइन: 1033। राष्ट्रीय आपातकालीन नंबर: 112। तेज आंधी में पेड़ के नीचे गाड़ी पार्क न करें।'
              : 'NHAI Highway Patrol: 1033 • State Emergency Dispatch: 112. In severe squalls, pull over at well-lit toll plazas or designated fuel service stations.'}
          </p>
        </div>
      </section>
    </div>
  );
}
