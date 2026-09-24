'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { RouteWaypoint } from '@/types';
import { INDIA_LOCATIONS, Coord, findCityCoords } from '@/lib/indiaLocations';
import RouteCorridorPresets, { PRESET_ROUTES, PresetRoute } from './RouteCorridorPresets';
import RouteMapOverview from './RouteMapOverview';
import WaypointWeatherTable from './WaypointWeatherTable';

type VehicleType = 'car' | 'truck' | 'bike';


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
