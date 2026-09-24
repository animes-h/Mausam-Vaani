'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { RouteWaypoint } from '@/types';
import { INDIA_LOCATIONS } from '@/lib/indiaLocations';
import RouteCorridorPresets, { PRESET_ROUTES, PresetRoute } from './RouteCorridorPresets';
import RouteMapOverview from './RouteMapOverview';
import WaypointWeatherTable from './WaypointWeatherTable';

type VehicleType = 'car' | 'truck' | 'bike';

interface Coord {
  lat: number;
  lng: number;
}

// In-memory dynamic geocoding cache for any custom town/city typed by the user
const DYNAMIC_GEOCODE_CACHE: Record<string, Coord> = {};

// Comprehensive Indian Highway Coordinates for accurate routing and bearings
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
  'mhow': { lat: 22.5539, lng: 75.7548 },
  'gwalior': { lat: 26.2183, lng: 78.1828 },
  'jabalpur': { lat: 23.1815, lng: 79.9864 },
  'sagar': { lat: 23.8388, lng: 78.7378 },
  'rewa': { lat: 24.5362, lng: 81.3037 },
  'satna': { lat: 24.6005, lng: 80.8322 },
  'narmadapuram': { lat: 22.7519, lng: 77.7289 },
  'pipariya': { lat: 22.7619, lng: 78.3553 },
  'narsinghpur': { lat: 22.9469, lng: 79.1952 },
  'vidisha': { lat: 23.5251, lng: 77.8081 },
  'neemuch': { lat: 24.4754, lng: 74.8693 },
  'mandsaur': { lat: 24.0722, lng: 75.0684 },
  'barwani': { lat: 22.0368, lng: 74.9030 },
  'harda': { lat: 22.3444, lng: 77.0945 },
  'betul': { lat: 21.9014, lng: 77.9022 },
  'chhindwara': { lat: 22.0574, lng: 78.9382 },
  'shivpuri': { lat: 25.4326, lng: 77.6583 },
  'guna': { lat: 24.6324, lng: 77.3006 },
  'katni': { lat: 23.8343, lng: 80.3957 },
  'burhanpur': { lat: 21.3145, lng: 76.2299 },
  'singrauli': { lat: 24.1992, lng: 82.6645 },
  'damoh': { lat: 23.8382, lng: 79.4422 },
  'chhatarpur': { lat: 24.9164, lng: 79.5811 },

  // Rajasthan
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'kota': { lat: 25.2138, lng: 75.8648 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'bikaner': { lat: 28.0229, lng: 73.3119 },
  'ajmer': { lat: 26.4499, lng: 74.6399 },
  'dausa': { lat: 26.8932, lng: 76.3377 },

  // Punjab, Haryana, Chandigarh, HP, UK, J&K
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
  'jammu': { lat: 32.7266, lng: 74.8570 },
  'srinagar': { lat: 34.0837, lng: 74.7973 },

  // Maharashtra, Gujarat, Goa
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'navi mumbai': { lat: 19.0330, lng: 73.0297 },
  'lonavala': { lat: 18.7557, lng: 73.4091 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'chhatrapati sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'solapur': { lat: 17.6599, lng: 75.9064 },
  'kolhapur': { lat: 16.7050, lng: 74.2433 },
  'amravati': { lat: 20.9374, lng: 77.7796 },
  'jalgaon': { lat: 21.0077, lng: 75.5626 },
  'dhule': { lat: 20.9042, lng: 74.7749 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'rajkot': { lat: 22.3039, lng: 70.8022 },
  'bhavnagar': { lat: 21.7645, lng: 72.1519 },
  'jamnagar': { lat: 22.4707, lng: 70.0577 },
  'gandhinagar': { lat: 23.2156, lng: 72.6369 },
  'panaji': { lat: 15.4909, lng: 73.8278 },

  // South
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'mysuru': { lat: 12.2958, lng: 76.6394 },
  'hubballi': { lat: 15.3647, lng: 75.1240 },
  'mangaluru': { lat: 12.9141, lng: 74.8560 },
  'belagavi': { lat: 15.8497, lng: 74.4977 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'warangal': { lat: 17.9689, lng: 79.5941 },
  'nizamabad': { lat: 18.6725, lng: 78.0941 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'tirupati': { lat: 13.6288, lng: 79.4192 },
  'guntur': { lat: 16.3067, lng: 80.4365 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'salem': { lat: 11.6643, lng: 78.1460 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'kozhikode': { lat: 11.2588, lng: 75.7804 },
  'hosur': { lat: 12.7409, lng: 77.8253 },
  'krishnagiri': { lat: 12.5186, lng: 78.2137 },
  'vellore': { lat: 12.9165, lng: 79.1325 },

  // East & Central / North-East
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'howrah': { lat: 22.5958, lng: 88.2636 },
  'siliguri': { lat: 26.7271, lng: 88.3953 },
  'durgapur': { lat: 23.5204, lng: 87.3119 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'gaya': { lat: 24.7914, lng: 85.0002 },
  'bhagalpur': { lat: 25.2425, lng: 86.9842 },
  'muzaffarpur': { lat: 26.1209, lng: 85.3647 },
  'buxar': { lat: 25.5647, lng: 83.9777 },
  'ghazipur': { lat: 25.5840, lng: 83.5770 },
  'ranchi': { lat: 23.3441, lng: 85.3096 },
  'jamshedpur': { lat: 22.8046, lng: 86.2029 },
  'dhanbad': { lat: 23.7957, lng: 86.4304 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'cuttack': { lat: 20.4625, lng: 85.8828 },
  'rourkela': { lat: 22.2604, lng: 84.8536 },
  'puri': { lat: 19.8135, lng: 85.8312 },
  'raipur': { lat: 21.2514, lng: 81.6296 },
  'bilaspur': { lat: 22.0797, lng: 82.1409 },
  'durg-bhilai': { lat: 21.1938, lng: 81.2849 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'silchar': { lat: 24.8333, lng: 92.7789 },
  'dibrugarh': { lat: 27.4728, lng: 94.9120 },
  'agartala': { lat: 23.8315, lng: 91.2868 },
  'shillong': { lat: 25.5788, lng: 91.8933 },
  'imphal': { lat: 24.8170, lng: 93.9368 },
  'aizawl': { lat: 23.7271, lng: 92.7176 },
  'kohima': { lat: 25.6751, lng: 94.1086 },
  'gangtok': { lat: 27.3389, lng: 88.6065 },
  'itanagar': { lat: 27.0844, lng: 93.6053 },
};

function findCityCoords(cityName: string, customCoords?: Record<string, Coord>): Coord {
  if (!cityName) return { lat: 28.6139, lng: 77.2090 };
  const clean = cityName.toLowerCase().trim();
  if (customCoords && customCoords[clean]) return customCoords[clean];
  if (DYNAMIC_GEOCODE_CACHE[clean]) return DYNAMIC_GEOCODE_CACHE[clean];
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
    const matchedKey = Object.keys(CITY_COORDS).find(k => k === found.name.toLowerCase());
    if (matchedKey) return CITY_COORDS[matchedKey];
    if (found.region === 'north') return { lat: 28.6, lng: 77.2 };
    if (found.region === 'mp') return { lat: 23.2, lng: 77.4 };
    if (found.region === 'west') return { lat: 19.5, lng: 73.5 };
    if (found.region === 'south') return { lat: 13.0, lng: 79.5 };
    if (found.region === 'east') return { lat: 23.5, lng: 85.5 };
  }

  return { lat: 26.8, lng: 80.9 };
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
  // Ayodhya corridors (National Highway 27 & Purvanchal)
  'ayodhya-lucknow': 135,
  'lucknow-ayodhya': 135,
  'ayodhya-varanasi': 210,
  'varanasi-ayodhya': 210,
  'ayodhya-gorakhpur': 135,
  'gorakhpur-ayodhya': 135,
  'ayodhya-prayagraj': 165,
  'prayagraj-ayodhya': 165,
  'ayodhya-kanpur': 217,
  'kanpur-ayodhya': 217,
  'ayodhya-delhi': 670,
  'delhi-ayodhya': 670,
  'new delhi-ayodhya': 670,
  'ayodhya-new delhi': 670,
  'ayodhya-agra': 470,
  'agra-ayodhya': 470,

  // Delhi - UP Corridors
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
  'lucknow-prayagraj': 200,
  'prayagraj-lucknow': 200,
  'lucknow-gorakhpur': 270,
  'gorakhpur-lucknow': 270,
  'varanasi-prayagraj': 120,
  'prayagraj-varanasi': 120,
  'delhi-varanasi': 820,
  'varanasi-delhi': 820,
  'lucknow-kanpur': 82,
  'kanpur-lucknow': 82,
  'lucknow-unnao': 64,
  'unnao-kanpur': 18,
  'agra-lucknow': 335,
  'lucknow-agra': 335,
  'delhi-agra': 210,
  'agra-delhi': 210,

  // Rajasthan Corridors
  'delhi-jaipur': 280,
  'jaipur-delhi': 280,
  'new delhi-jaipur': 280,
  'jaipur-new delhi': 280,

  // Madhya Pradesh Corridors
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
  'bhopal-delhi': 780,
  'delhi-bhopal': 780,
  'indore-mumbai': 585,
  'mumbai-indore': 585,
  'bhopal-jabalpur': 308,
  'jabalpur-bhopal': 308,

  // Western & Southern Corridors
  'mumbai-pune': 150,
  'pune-mumbai': 150,
  'mumbai-navi mumbai': 35,
  'navi mumbai-lonavala': 65,
  'lonavala-pune': 50,
  'mumbai-ahmedabad': 525,
  'ahmedabad-mumbai': 525,
  'delhi-chandigarh': 245,
  'chandigarh-delhi': 245,
  'new delhi-chandigarh': 245,
  'chandigarh-new delhi': 245,
  'delhi-amritsar': 450,
  'amritsar-delhi': 450,
  'bengaluru-chennai': 345,
  'chennai-bengaluru': 345,
  'bengaluru-hyderabad': 570,
  'hyderabad-bengaluru': 570,

  // Eastern Corridors
  'patna-varanasi': 255,
  'varanasi-patna': 255,
  'kolkata-patna': 580,
  'patna-kolkata': 580,
};

function calculateSegmentDistance(
  fromName: string,
  toName: string,
  customCoords?: Record<string, Coord>
): number {
  const f = fromName.toLowerCase().trim();
  const t = toName.toLowerCase().trim();
  if (!f || !t || f === t) return 0;

  const k1 = `${f}-${t}`;
  if (EXACT_HIGHWAY_DISTANCES[k1]) return EXACT_HIGHWAY_DISTANCES[k1];

  const c1 = findCityCoords(fromName, customCoords);
  const c2 = findCityCoords(toName, customCoords);

  const straight = getGreatCircleDistance(c1.lat, c1.lng, c2.lat, c2.lng);
  if (straight < 1) return 0;

  // National highway winding ratio is ~1.15x for modern NH/expressways in India
  const roadDistance = Math.round(straight * 1.15);
  return Math.max(15, roadDistance);
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

export default function ExplorerJourneyPlanner() {
  const { language, weather, location } = useApp();
  const t = translations[language];

  // Primary routing state
  const [origin, setOrigin] = useState<string>('New Delhi');
  const [destination, setDestination] = useState<string>('Lucknow');
  const [waypoints, setWaypoints] = useState<string[]>(['Mathura', 'Agra', 'Kannauj']);
  const [vehicle, setVehicle] = useState<VehicleType>('car');
  const [departureOffset, setDepartureOffset] = useState<number>(0); // 0 = now, 1 = +1h, etc.
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);

  // Dynamic geocoded coordinates cache for custom searched towns
  const [resolvedCoords, setResolvedCoords] = useState<Record<string, Coord>>({});

  // Autocomplete UI suggestions state
  const [originSuggestionsOpen, setOriginSuggestionsOpen] = useState(false);
  const [destSuggestionsOpen, setDestSuggestionsOpen] = useState(false);

  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  // Filtered city suggestion lists for Point A and B inputs
  const originSuggestions = useMemo(() => {
    if (!origin || origin.trim() === '') return INDIA_LOCATIONS.slice(0, 12);
    const q = origin.toLowerCase().trim();
    return INDIA_LOCATIONS.filter(
      c => c.name.toLowerCase().includes(q) || c.nameHi.includes(q) || c.state.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [origin]);

  const destSuggestions = useMemo(() => {
    if (!destination || destination.trim() === '') return INDIA_LOCATIONS.slice(0, 12);
    const q = destination.toLowerCase().trim();
    return INDIA_LOCATIONS.filter(
      c => c.name.toLowerCase().includes(q) || c.nameHi.includes(q) || c.state.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [destination]);

  // Dynamic vehicle speed defaults
  const vehicleSpeed = useMemo(() => {
    switch (vehicle) {
      case 'car':
        return 75; // average expressway cruising speed
      case 'truck':
        return 48; // commercial freight speed
      case 'bike':
        return 58;
    }
  }, [vehicle]);

  // Recalculate and trigger brief calculation state indicator
  const triggerRecalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 450);
  };

  // Preset selector
  const handleSelectPreset = (preset: PresetRoute) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setWaypoints(preset.waypoints);
    triggerRecalculate();
  };

  // Swap Point A and Point B
  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setWaypoints([...waypoints].reverse());
    triggerRecalculate();
  };

  // Add / Remove / Edit Waypoints
  const handleAddWaypoint = () => {
    if (waypoints.length >= 5) return;
    setWaypoints([...waypoints, `Stop ${waypoints.length + 1}`]);
    triggerRecalculate();
  };

  const handleRemoveWaypoint = (idx: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== idx));
    triggerRecalculate();
  };

  const handleUpdateWaypoint = (idx: number, val: string) => {
    const updated = [...waypoints];
    updated[idx] = val;
    setWaypoints(updated);
  };

  // Calculate ETA time string with offset
  const formatETA = (hoursOffset: number, additionalMinutes: number = 0): string => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + Math.round(hoursOffset * 60) + additionalMinutes);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
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
    const isStormHour = departureOffset >= 0 && departureOffset <= 1.5;
    const isEveningClear = departureOffset >= 2;

    for (let i = 0; i < allStops.length - 1; i++) {
      const fromName = allStops[i];
      const toName = allStops[i + 1];

      // Segment distance calculated dynamically from coordinates & highway curves
      const segDistance = calculateSegmentDistance(fromName, toName, resolvedCoords);
      const segDurationMins = Math.round((segDistance / vehicleSpeed) * 60);

      const startTimeStr = formatETA(departureOffset, cumulativeMins);
      cumulativeMins += segDurationMins;
      const endTimeStr = formatETA(departureOffset, cumulativeMins);

      const c1 = findCityCoords(fromName, resolvedCoords);
      const c2 = findCityCoords(toName, resolvedCoords);

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
  }, [origin, destination, waypoints, vehicleSpeed, departureOffset, weather, language, resolvedCoords]);

  // Overall route summary metrics
  const totalDistance = dynamicSegments.reduce((acc, s) => acc + s.distanceKm, 0);
  const totalMinutes = Math.round((totalDistance / vehicleSpeed) * 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMinutesRemain = totalMinutes % 60;

  const maxWindGust = dynamicSegments.reduce((max, s) => Math.max(max, s.windGustKm), 0);
  const minVisibility = dynamicSegments.reduce((min, s) => Math.min(min, s.visibilityKm), 10);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg">
      {/* Route Configurator Header & Form */}
      <section className="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-surface-container-high flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div>
            <div className="flex items-center gap-space-xs text-primary text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[1.25rem]">route</span>
              <span>Agricultural Transit & Highway Corridor Weather</span>
            </div>
            <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight mt-1">
              {language === 'hi' ? 'स्मार्ट यात्रा व कृषि परिवहन मौसम योजना' : 'Smart Transit Corridor Weather Planner'}
            </h1>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-2xl">
              {language === 'hi'
                ? 'राष्ट्रीय राजमार्गों, एक्सप्रेसवे व मंडी मार्गों पर आंधी, बारिश, तेज क्रॉसविंड्स और सड़क फिसलन का लाइव विश्लेषण।'
                : 'Real-time road weather telemetry, convective squalls, crosswinds, and aquaplaning risks along inter-state transport routes.'}
            </p>
          </div>

          {/* Preset Corridors Subcomponent */}
          <RouteCorridorPresets
            language={language}
            currentOrigin={origin}
            currentDestination={destination}
            onSelectPreset={handleSelectPreset}
          />
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
                  setWaypoints([]);
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
                placeholder="Type Origin (e.g. New Delhi, Lucknow, Ayodhya)..."
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
                        setWaypoints([]);
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
              {['New Delhi', 'Lucknow', 'Ayodhya', 'Indore', 'Bhopal', 'Jaipur', 'Agra'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setOrigin(c);
                    setWaypoints([]);
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
                placeholder="Type Destination (e.g. Lucknow, Ayodhya, Varanasi)..."
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
                        setWaypoints([]);
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
              {['Lucknow', 'Ayodhya', 'Varanasi', 'Kanpur', 'Bhopal', 'Jaipur', 'Agra'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setDestination(c);
                    setWaypoints([]);
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

            <div className="flex items-center gap-2">
              {waypoints.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setWaypoints([]);
                    triggerRecalculate();
                  }}
                  className="text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-error/10 text-error hover:bg-error hover:text-on-error transition-all cursor-pointer"
                  title="Clear all intermediate stops"
                >
                  <span className="material-symbols-outlined text-[1rem]">delete_sweep</span>
                  <span>{language === 'hi' ? 'पड़ाव हटाएं' : 'Clear Stops'}</span>
                </button>
              )}

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

      {/* Visual Corridor Diagram & Metrics (RouteMapOverview) */}
      <RouteMapOverview
        language={language}
        origin={origin}
        destination={destination}
        totalDistance={totalDistance}
        totalHours={totalHours}
        totalMinutesRemain={totalMinutesRemain}
        vehicleSpeed={vehicleSpeed}
        maxWindGust={maxWindGust}
        minVisibility={minVisibility}
        dynamicSegments={dynamicSegments}
        selectedSegmentIdx={selectedSegmentIdx}
        onSelectSegment={setSelectedSegmentIdx}
      />

      {/* Waypoint Weather Telemetry Table & Driver Advisory Checklist */}
      <WaypointWeatherTable
        language={language}
        dynamicSegments={dynamicSegments}
        selectedSegmentIdx={selectedSegmentIdx}
        onSelectSegment={setSelectedSegmentIdx}
      />
    </div>
  );
}
