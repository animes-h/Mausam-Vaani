'use client';

import React from 'react';
import { Language } from '@/types';

export interface PresetRoute {
  id: string;
  nameEn: string;
  nameHi: string;
  origin: string;
  destination: string;
  waypoints: string[];
  distanceKm: number;
}

export const PRESET_ROUTES: PresetRoute[] = [
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
    id: 'lucknow-ayodhya',
    nameEn: 'Lucknow ⇄ Ayodhya (NH-27 / Ram Janmabhoomi Corridor)',
    nameHi: 'लखनऊ ⇄ अयोध्या (NH-27 फोर-लेन एक्सप्रेस)',
    origin: 'Lucknow',
    destination: 'Ayodhya',
    waypoints: [],
    distanceKm: 135,
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
    nameEn: 'Patna ⇄ Varanasi (NH-19 / GT Road)',
    nameHi: 'पटना ⇄ वाराणसी (NH-19)',
    origin: 'Patna',
    destination: 'Varanasi',
    waypoints: ['Buxar', 'Ghazipur'],
    distanceKm: 255,
  },
];

interface RouteCorridorPresetsProps {
  language: Language;
  currentOrigin: string;
  currentDestination: string;
  onSelectPreset: (preset: PresetRoute) => void;
}

export default function RouteCorridorPresets({
  language,
  currentOrigin,
  currentDestination,
  onSelectPreset,
}: RouteCorridorPresetsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-[0.7rem] font-bold text-on-surface-variant uppercase mr-1">
        {language === 'hi' ? 'लोकप्रिय मार्ग:' : 'Corridor Presets:'}
      </span>
      {PRESET_ROUTES.map(preset => {
        const isCurrent =
          currentOrigin.toLowerCase().includes(preset.origin.toLowerCase()) &&
          currentDestination.toLowerCase().includes(preset.destination.toLowerCase());
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset)}
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
  );
}
