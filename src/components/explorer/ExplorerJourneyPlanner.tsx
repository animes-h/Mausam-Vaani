'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { RouteWaypoint, WorkSafetyHour } from '@/types';

export default function ExplorerJourneyPlanner() {
  const { language } = useApp();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'transit' | 'safety'>('transit');
  const [departureOffset, setDepartureOffset] = useState<number>(0); // in hours
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<WorkSafetyHour | null>(null);

  const getBaseTime = (offsetH: number, addMins: number) => {
    const totalMinutes = 14 * 60 + offsetH * 60 + addMins;
    const h = Math.floor((totalMinutes / 60) % 24);
    const m = Math.floor(totalMinutes % 60);
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m} IST`;
  };

  const getDynamicSegments = (offset: number): RouteWaypoint[] => {
    const seg1Start = getBaseTime(offset, 0);
    const seg1End = getBaseTime(offset, 45);
    const seg2End = getBaseTime(offset, 90);
    const seg3End = getBaseTime(offset, 155);
    const seg4End = getBaseTime(offset, 204);

    if (offset < 0) {
      // Early departure before squall reaches Dewas
      return [
        { name: 'Indore → Sanwer', distanceKm: 32, eta: `${seg1Start} - ${seg1End}`, temperature: 30, condition: 'Clear / Dry', icon: 'wb_sunny', windGustKm: 12, visibilityKm: 10, surfaceStatus: 'Dry', riskLevel: 'low' },
        { name: 'Sanwer → Dewas Bypass', distanceKm: 44, eta: `${seg1End} - ${seg2End}`, temperature: 30, condition: 'Partly Cloudy', icon: 'partly_cloudy_day', windGustKm: 18, visibilityKm: 8, surfaceStatus: 'Dry', riskLevel: 'low' },
        { name: 'Dewas Ghats → Ashta', distanceKm: 58, eta: `${seg2End} - ${seg3End}`, temperature: 28, condition: 'Approaching Front', icon: 'cloud', windGustKm: 28, visibilityKm: 6, surfaceStatus: 'Damp', riskLevel: 'moderate' },
        { name: 'Ashta → Bhopal MP Nagar', distanceKm: 58, eta: `${seg3End} - ${seg4End}`, temperature: 28, condition: 'Light Sprinkles', icon: 'rainy', windGustKm: 20, visibilityKm: 7, surfaceStatus: 'Damp', riskLevel: 'low' },
      ];
    } else if (offset >= 2) {
      // Post-storm clearance
      return [
        { name: 'Indore → Sanwer', distanceKm: 32, eta: `${seg1Start} - ${seg1End}`, temperature: 27, condition: 'Clearing Skies', icon: 'partly_cloudy_day', windGustKm: 16, visibilityKm: 8, surfaceStatus: 'Damp', riskLevel: 'low' },
        { name: 'Sanwer → Dewas Bypass', distanceKm: 44, eta: `${seg1End} - ${seg2End}`, temperature: 26, condition: 'Mild Breeze', icon: 'air', windGustKm: 20, visibilityKm: 8, surfaceStatus: 'Damp', riskLevel: 'low' },
        { name: 'Dewas Ghats → Ashta', distanceKm: 58, eta: `${seg2End} - ${seg3End}`, temperature: 25, condition: 'Post-Rain Wet Road', icon: 'water_drop', windGustKm: 22, visibilityKm: 7, surfaceStatus: 'Damp', riskLevel: 'moderate' },
        { name: 'Ashta → Bhopal MP Nagar', distanceKm: 58, eta: `${seg3End} - ${seg4End}`, temperature: 25, condition: 'Clear Evening', icon: 'nights_stay', windGustKm: 14, visibilityKm: 9, surfaceStatus: 'Damp', riskLevel: 'low' },
      ];
    }

    // Default: Squall line strikes Dewas Ghats corridor
    return [
      { name: 'Indore → Sanwer', distanceKm: 32, eta: `${seg1Start} - ${seg1End}`, temperature: 31, condition: 'Clear / Dry', icon: 'wb_sunny', windGustKm: 14, visibilityKm: 10, surfaceStatus: 'Dry', riskLevel: 'low' },
      { name: 'Sanwer → Dewas Bypass', distanceKm: 44, eta: `${seg1End} - ${seg2End}`, temperature: 29, condition: 'Overcast / Sprinkles', icon: 'partly_cloudy_day', windGustKm: 24, visibilityKm: 6, surfaceStatus: 'Damp', riskLevel: 'moderate' },
      { name: 'Dewas Ghats → Ashta', distanceKm: 58, eta: `${seg2End} - ${seg3End}`, temperature: 26, condition: 'Severe Squall / Rain', icon: 'thunderstorm', windGustKm: 48, visibilityKm: 2, surfaceStatus: 'Waterlogged', riskLevel: 'severe' },
      { name: 'Ashta → Bhopal MP Nagar', distanceKm: 58, eta: `${seg3End} - ${seg4End}`, temperature: 27, condition: 'Moderate Showers', icon: 'rainy', windGustKm: 28, visibilityKm: 5, surfaceStatus: 'Damp', riskLevel: 'moderate' },
    ];
  };

  const routeSegments = getDynamicSegments(departureOffset);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => setIsRecalculating(false), 750);
  };

  const workSafetySchedule: WorkSafetyHour[] = [
    { hour: '06:00', safetyStatus: 'safe', safetyLabelEn: 'Safe for Field Work', safetyLabelHi: 'खेत कार्य हेतु सुरक्षित', temperature: 22, wbgt: 20.4, heatIndex: 22, uvIndex: 0, rainChance: 5, advisoryNoteEn: 'Optimal condition for labor, pesticide spraying & harvest.', advisoryNoteHi: 'श्रम, छिड़काव व कटाई के लिए सबसे उत्तम समय।' },
    { hour: '08:00', safetyStatus: 'safe', safetyLabelEn: 'Safe for Field Work', safetyLabelHi: 'खेत कार्य हेतु सुरक्षित', temperature: 25, wbgt: 22.8, heatIndex: 26, uvIndex: 2, rainChance: 5, advisoryNoteEn: 'Calm winds, cool morning temperature.', advisoryNoteHi: 'शांत हवा, सुखद तापमान।' },
    { hour: '10:00', safetyStatus: 'safe', safetyLabelEn: 'Safe for Field Work', safetyLabelHi: 'खेत कार्य हेतु सुरक्षित', temperature: 28, wbgt: 25.1, heatIndex: 30, uvIndex: 4, rainChance: 10, advisoryNoteEn: 'Maintain hydration.', advisoryNoteHi: 'पानी पीते रहें।' },
    { hour: '12:00', safetyStatus: 'caution', safetyLabelEn: 'Caution: Solar & Thermal Load', safetyLabelHi: 'सावधानी: तेज धूप व गर्मी', temperature: 31, wbgt: 28.5, heatIndex: 34, uvIndex: 6.2, rainChance: 25, advisoryNoteEn: 'UV index peak. Take shaded rest breaks.', advisoryNoteHi: 'छायादार स्थान पर विश्राम करें।' },
    { hour: '14:00', safetyStatus: 'hazardous', safetyLabelEn: 'Hazardous: Squall Line & Storm', safetyLabelHi: 'खतरनाक: आंधी व तूफ़ान का खतरा', temperature: 29, wbgt: 31.2, heatIndex: 35, uvIndex: 4.8, rainChance: 75, advisoryNoteEn: 'Severe convective storm risk. Evacuate open fields.', advisoryNoteHi: 'आकाशीय बिजली व ओलों का गंभीर खतरा। खुले खेत खाली करें।' },
    { hour: '16:00', safetyStatus: 'hazardous', safetyLabelEn: 'Hazardous: Lightning & Rain', safetyLabelHi: 'खतरनाक: बिजली व तेज बारिश', temperature: 26, wbgt: 29.8, heatIndex: 32, uvIndex: 2.1, rainChance: 70, advisoryNoteEn: 'Do not work around electric poles or machinery.', advisoryNoteHi: 'बिजली के खंभों व मशीनों से दूर रहें।' },
    { hour: '18:00', safetyStatus: 'caution', safetyLabelEn: 'Caution: Post-Storm Recovery', safetyLabelHi: 'सावधानी: बारिश के बाद संभलें', temperature: 25, wbgt: 24.2, heatIndex: 27, uvIndex: 0, rainChance: 35, advisoryNoteEn: 'Slippery soil furrows.', advisoryNoteHi: 'खेत में फिसलन से बचाव रखें।' },
    { hour: '20:00', safetyStatus: 'safe', safetyLabelEn: 'Safe: Calm Evening', safetyLabelHi: 'सुरक्षित: शांत शाम', temperature: 24, wbgt: 21.0, heatIndex: 25, uvIndex: 0, rainChance: 10, advisoryNoteEn: 'Cool ambient conditions.', advisoryNoteHi: 'सुहावना मौसम।' },
  ];

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg">
      {/* Top Header & Dual Scope Switcher */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-surface-container-high">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[1.125rem]">navigation</span>
            <span>Logistics & Human Safety Operations • Malwa Agro-Corridor</span>
          </div>
          <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight mt-1">
            Journey & Outdoor Work Safety Planner
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            Continuous telemetry cross-checking IMD Radar, ECMWF boundary layers, and highway sensor arrays.
          </p>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-full shadow-xs self-start lg:self-auto">
          <button
            className={`flex items-center gap-1 px-4 py-2 rounded-full font-label-md text-xs font-bold transition-all ${
              activeTab === 'transit'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setActiveTab('transit')}
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">commute</span>
            <span>Transit & Route Corridor</span>
          </button>
          <button
            className={`flex items-center gap-1 px-4 py-2 rounded-full font-label-md text-xs font-bold transition-all ${
              activeTab === 'safety'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setActiveTab('safety')}
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">health_and_safety</span>
            <span>Field Work Windows (FR-7.2)</span>
          </button>
        </div>
      </section>

      {/* Transit Advisory Alert Banner */}
      <section className="bg-secondary-container/20 rounded-2xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-xs border border-secondary/20">
        <div className="flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[1.5rem]">thunderstorm</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-md text-xs font-bold text-on-secondary-container uppercase tracking-wide">
                Transit Advisory Alert: Squall Line Ingress
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary text-[0.65rem] font-bold">
                HIGH CERTAINTY (88%)
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface mt-0.5">
              Safe departure recommended <strong>before 15:30 IST</strong> to avoid convective squall lines & cross-drafts crossing NH-46 (Dewas Ghats). Expected rain rate: 42 mm/h.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-xs shrink-0 self-end md:self-auto">
          <span className="text-[0.7rem] text-on-surface-variant">Valid till 18:00 IST</span>
        </div>
      </section>

      {/* TAB 1: TRANSIT CORRIDOR PLANNER (FR-7.1) */}
      {activeTab === 'transit' && (
        <div className="flex flex-col gap-space-lg">
          {/* Waypoint Engine Form Strip */}
          <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Multi-Segment Route Analysis</span>
                <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                  Indore ⇄ Ujjain ⇄ Bhopal Highway Corridor (NH-52 / NH-46)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 hover:bg-primary-container transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className={`material-symbols-outlined text-[1rem] ${isRecalculating ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Route'}</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                  <span>Telemetry Live</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm bg-surface-container-low p-space-md rounded-2xl">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant">Origin Location</label>
                <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[1.125rem]">trip_origin</span>
                  <span className="font-bold text-xs text-on-surface">Indore Central (0 km)</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant">Intermediate Waypoint</label>
                <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-tertiary text-[1.125rem]">add_location</span>
                  <span className="font-bold text-xs text-on-surface">Dewas Ghats Bypass (+76 km)</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant">Final Destination</label>
                <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary text-[1.125rem]">location_pin</span>
                  <span className="font-bold text-xs text-on-surface">Bhopal MP Nagar (+192 km)</span>
                </div>
              </div>
            </div>

            {/* Departure Offset Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-high/40 p-space-sm rounded-2xl text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-[1.125rem]">schedule</span>
                <span className="font-semibold text-on-surface">Simulate Departure Timing:</span>
                <span className="font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded shadow-xs">
                  {departureOffset === 0 ? 'Current (14:00 IST)' : departureOffset > 0 ? `14:00 + ${departureOffset}h IST` : `14:00 - 30m IST`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {[-0.5, 0, 1, 2].map(offset => (
                  <button
                    key={offset}
                    onClick={() => setDepartureOffset(offset)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer ${
                      departureOffset === offset
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface'
                    }`}
                    type="button"
                  >
                    {offset === 0 ? 'Now' : offset > 0 ? `+${offset}h` : `${offset * 60}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Route Weather Timeline Segments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm pt-space-xs">
              {routeSegments.map((seg, idx) => (
                <div
                  key={idx}
                  className={`p-space-md rounded-2xl flex flex-col justify-between gap-space-md border ${
                    seg.riskLevel === 'severe'
                      ? 'bg-secondary/10 border-secondary/40 shadow-xs'
                      : seg.riskLevel === 'moderate'
                      ? 'bg-tertiary-fixed/30 border-tertiary/30'
                      : 'bg-surface-container-low border-surface-container-high'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-primary">{seg.eta}</span>
                      <span className="material-symbols-outlined text-[1.25rem] text-on-surface">
                        {seg.icon}
                      </span>
                    </div>
                    <span className="font-headline-sm text-sm font-bold text-on-surface mt-1">
                      {seg.name}
                    </span>
                    <span className="text-[0.7rem] text-on-surface-variant">
                      {seg.distanceKm} km • {seg.condition}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 pt-2 border-t border-outline-variant/30 text-[0.7rem]">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Surface:</span>
                      <span className="font-bold text-on-surface">{seg.surfaceStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Crosswinds:</span>
                      <span className="font-bold text-on-surface">{seg.windGustKm} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Visibility:</span>
                      <span className="font-bold text-on-surface">{seg.visibilityKm} km</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OUTDOOR WORK SAFETY TIMELINE (FR-7.2) */}
      {activeTab === 'safety' && (
        <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                FR-7.2 Outdoor Labor & Field Safety Matrix
              </span>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                Safe Work Windows & Thermal/Precipitation Strain Model
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Estimates safer outdoor hours based on Wet-Bulb Globe Temperature (WBGT), UV index, and squall probabilities.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary"></span> Safe</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-tertiary-container"></span> Caution</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-secondary"></span> Hazardous</span>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="space-y-space-xs mt-space-xs">
            {workSafetySchedule.map((slot, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedSlot(selectedSlot?.hour === slot.hour ? null : slot)}
                className={`p-space-sm rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border cursor-pointer transition-all active:scale-95 ${
                  selectedSlot?.hour === slot.hour
                    ? 'ring-2 ring-primary shadow-md'
                    : ''
                } ${
                  slot.safetyStatus === 'safe'
                    ? 'bg-surface-container-low border-primary/20 hover:bg-surface-container'
                    : slot.safetyStatus === 'caution'
                    ? 'bg-tertiary-fixed/25 border-tertiary/30 hover:bg-tertiary-fixed/40'
                    : 'bg-secondary-fixed/30 border-secondary/40 hover:bg-secondary-fixed/50'
                }`}
              >
                <div className="flex items-center gap-space-md">
                  <span className="font-headline-sm text-base font-bold w-14 text-on-surface">
                    {slot.hour}
                  </span>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      slot.safetyStatus === 'safe'
                        ? 'bg-primary text-on-primary'
                        : slot.safetyStatus === 'caution'
                        ? 'bg-tertiary text-on-tertiary'
                        : 'bg-secondary text-on-secondary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1rem]">
                      {slot.safetyStatus === 'safe' ? 'check_circle' : slot.safetyStatus === 'caution' ? 'warning' : 'block'}
                    </span>
                    <span>{language === 'hi' ? slot.safetyLabelHi : slot.safetyLabelEn}</span>
                  </div>
                  <span className="text-xs text-on-surface font-medium hidden md:inline">
                    {language === 'hi' ? slot.advisoryNoteHi : slot.advisoryNoteEn}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant">
                  <span>Temp: <strong className="text-on-surface">{slot.temperature}°C</strong></span>
                  <span>WBGT: <strong className="text-on-surface">{slot.wbgt}°C</strong></span>
                  <span>UV: <strong className="text-on-surface">{slot.uvIndex}</strong></span>
                  <span>Rain: <strong className="text-secondary">{slot.rainChance}%</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Slot Detailed Agronomic Protocol */}
          {selectedSlot && (
            <div className="p-space-md rounded-2xl bg-surface-container-low border border-primary/30 flex flex-col gap-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[1.25rem]">info</span>
                  <span className="font-bold text-xs text-on-surface">
                    Operational Safety Directive for {selectedSlot.hour} IST:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="text-outline hover:text-on-surface p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[1rem]">close</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {language === 'hi' ? selectedSlot.advisoryNoteHi : selectedSlot.advisoryNoteEn}
                {selectedSlot.safetyStatus === 'safe' && ' (Full mechanized field spraying & grain transport permitted).'}
                {selectedSlot.safetyStatus === 'caution' && ' (Hydration mandatory every 30 minutes. Wear UV protective caps).'}
                {selectedSlot.safetyStatus === 'hazardous' && ' (Cease all open-field labor immediately. Relocate tractors to covered sheds).'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
