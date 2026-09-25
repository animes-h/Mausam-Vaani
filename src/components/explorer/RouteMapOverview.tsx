'use client';

import React from 'react';
import { Language, RouteWaypoint } from '@/types';

interface RouteMapOverviewProps {
  language: Language;
  origin: string;
  destination: string;
  totalDistance: number;
  totalHours: number;
  totalMinutesRemain: number;
  vehicleSpeed: number;
  maxWindGust: number;
  minVisibility: number;
  dynamicSegments: RouteWaypoint[];
  selectedSegmentIdx: number | null;
  onSelectSegment: (idx: number | null) => void;
}

export default function RouteMapOverview({
  language,
  origin,
  destination,
  totalDistance,
  totalHours,
  totalMinutesRemain,
  vehicleSpeed,
  maxWindGust,
  minVisibility,
  dynamicSegments,
  selectedSegmentIdx,
  onSelectSegment,
}: RouteMapOverviewProps) {
  return (
    <div className="flex flex-col gap-space-lg">
      {/* Corridor Summary Metrics Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-sm">
        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between min-w-0">
          <span className="text-xs text-on-surface-variant font-bold flex items-center justify-between gap-1">
            <span className="truncate">{language === 'hi' ? 'कुल दूरी' : 'Total Distance'}</span>
            <span className="material-symbols-outlined text-primary text-[1.125rem] shrink-0">straighten</span>
          </span>
          <div className="text-2xl font-extrabold text-on-surface my-1">{totalDistance} km</div>
          <span className="text-[0.7rem] text-on-surface-variant truncate">
            {dynamicSegments.length} {language === 'hi' ? 'मार्ग खंड' : 'route segments'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between min-w-0">
          <span className="text-xs text-on-surface-variant font-bold flex items-center justify-between gap-1">
            <span className="truncate">{language === 'hi' ? 'अनुमानित यात्रा समय' : 'Estimated Time'}</span>
            <span className="material-symbols-outlined text-primary text-[1.125rem] shrink-0">schedule</span>
          </span>
          <div className="text-2xl font-extrabold text-on-surface my-1">
            {totalHours}h {totalMinutesRemain}m
          </div>
          <span className="text-[0.7rem] text-on-surface-variant truncate">
            {language === 'hi' ? `औसत गति: ${vehicleSpeed} किमी/घंटा` : `Avg speed: ${vehicleSpeed} km/h`}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between min-w-0">
          <span className="text-xs text-on-surface-variant font-bold flex items-center justify-between gap-1">
            <span className="truncate">{language === 'hi' ? 'अधिकतम हवा का झोंका' : 'Max Crosswinds'}</span>
            <span className="material-symbols-outlined text-tertiary text-[1.125rem] shrink-0">air</span>
          </span>
          <div className={`text-2xl font-extrabold my-1 ${maxWindGust > 40 ? 'text-secondary' : 'text-on-surface'}`}>
            {maxWindGust} km/h
          </div>
          <span className="text-[0.7rem] text-on-surface-variant truncate">
            {maxWindGust > 40
              ? language === 'hi'
                ? 'ट्रक व बाइक हेतु खतरनाक'
                : 'Hazardous for high-sided trucks'
              : language === 'hi'
              ? 'सामान्य हवा'
              : 'Manageable cross-drafts'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between min-w-0">
          <span className="text-xs text-on-surface-variant font-bold flex items-center justify-between gap-1">
            <span className="truncate">{language === 'hi' ? 'न्यूनतम दृश्यता' : 'Lowest Visibility'}</span>
            <span className="material-symbols-outlined text-primary text-[1.125rem] shrink-0">visibility</span>
          </span>
          <div className={`text-2xl font-extrabold my-1 ${minVisibility < 3 ? 'text-secondary' : 'text-on-surface'}`}>
            {minVisibility} km
          </div>
          <span className="text-[0.7rem] text-on-surface-variant truncate">
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
          <div className="absolute top-1/2 left-6 right-6 h-1 -translate-y-1/2 bg-surface-container-high z-0 hidden xl:block"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
            {dynamicSegments.map((seg, idx) => (
              <div
                key={idx}
                onClick={() => onSelectSegment(selectedSegmentIdx === idx ? null : idx)}
                className={`p-space-md rounded-2xl border flex flex-col justify-between gap-2 cursor-pointer transition-all min-w-0 active:scale-[0.98] ${
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
                onClick={() => onSelectSegment(null)}
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
    </div>
  );
}
