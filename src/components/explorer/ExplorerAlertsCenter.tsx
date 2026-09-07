'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';

export default function ExplorerAlertsCenter() {
  const { alerts, language } = useApp();
  const t = translations[language];

  const [activeFilter, setActiveFilter] = useState('all');

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'convective') return a.titleEn.toLowerCase().includes('thunderstorm') || a.titleEn.toLowerCase().includes('lightning');
    if (activeFilter === 'wind') return a.titleEn.toLowerCase().includes('wind') || a.englishSummary.toLowerCase().includes('wind');
    if (activeFilter === 'agri') return a.farmerDirectives.length > 0;
    return true;
  });

  return (
    <div className="flex flex-col gap-space-lg w-full max-w-7xl mx-auto">
      {/* Top Banner & Radar Status */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm text-xs">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold">
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                RADAR SYNC ACTIVE
              </span>
              <span className="text-outline">•</span>
              <span className="text-on-surface-variant font-semibold tracking-wide">
                STATION ID: IND-DWR-77A (CENTRAL RADIAL)
              </span>
            </div>
            <div className="flex items-center gap-space-sm text-on-surface-variant">
              <span>Next Synoptic Refresh: <strong className="text-on-surface">04:12 mins</strong></span>
              <span className="text-outline">|</span>
              <span className="text-outline">CAP 1.2 Compliant Feed</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
            <div className="max-w-3xl">
              <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Regional Meteorological Advisory & Threat Matrix
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
                Indore / Ujjain Agro-Climatic Sub-Division • Mesoscale Convective System (MCS) Nowcasting & Multi-hazard Diagnostics
              </p>
            </div>

            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full text-xs">
              <button className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-bold shadow-xs" type="button">
                Live Feed
              </button>
              <button className="px-3 py-1 rounded-full text-on-surface-variant hover:text-on-surface" type="button">
                Archive
              </button>
            </div>
          </div>

          {/* 4 Stat Quadrants */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm pt-space-xs">
            <div className="p-space-md rounded-2xl bg-surface-container-low flex items-center justify-between border border-secondary/20">
              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-secondary uppercase tracking-wider">High Severity</span>
                <span className="text-2xl font-extrabold text-secondary mt-0.5">01</span>
                <span className="text-[0.65rem] text-on-surface-variant">Active convective storm</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[1.5rem]">bolt</span>
              </div>
            </div>

            <div className="p-space-md rounded-2xl bg-surface-container-low flex items-center justify-between border border-tertiary/20">
              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-tertiary uppercase tracking-wider">Advisories</span>
                <span className="text-2xl font-extrabold text-tertiary mt-0.5">02</span>
                <span className="text-[0.65rem] text-on-surface-variant">Thermal & wind strain</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[1.5rem]">warning</span>
              </div>
            </div>

            <div className="p-space-md rounded-2xl bg-surface-container-low flex items-center justify-between border border-outline-variant/30">
              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-outline uppercase tracking-wider">Watch Notices</span>
                <span className="text-2xl font-extrabold text-on-surface mt-0.5">00</span>
                <span className="text-[0.65rem] text-on-surface-variant">No active watches</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[1.5rem]">visibility</span>
              </div>
            </div>

            <div className="p-space-md rounded-2xl bg-surface-container-low flex items-center justify-between border border-primary/20">
              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-primary uppercase tracking-wider">Confidence</span>
                <span className="text-2xl font-extrabold text-primary mt-0.5">94%</span>
                <span className="text-[0.65rem] text-on-surface-variant">IMD + INSAT Consensus</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined text-[1.5rem]">verified</span>
              </div>
            </div>
          </div>

          {/* Filter Hazard Pills */}
          <div className="flex flex-wrap items-center gap-space-xs pt-space-2xs text-xs">
            <span className="font-bold text-on-surface-variant mr-1">Filter Hazard:</span>
            {[
              { id: 'all', label: 'All Severities (3)' },
              { id: 'convective', label: 'Convective Storm (1)' },
              { id: 'wind', label: 'Wind Squall (1)' },
              { id: 'agri', label: 'Agricultural Impact (2)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  activeFilter === f.id
                    ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                }`}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid: Active Dossiers (7 cols) & 3x3 Threat Matrix (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left 7 Cols: Active Alert Dossiers */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-space-xs">
              <h2 className="font-headline-sm text-base font-bold text-on-surface">Active Alert Dossiers</h2>
              <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center">
                {filteredAlerts.length}
              </span>
            </div>
            <span className="text-xs text-on-surface-variant">Ranked by Operational Urgency</span>
          </div>

          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md relative overflow-hidden"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                  alert.severity === 'red' ? 'bg-secondary' : 'bg-tertiary-container'
                }`}
              ></div>

              <div className="flex flex-col gap-1 pl-2">
                <div className="flex flex-wrap items-center justify-between gap-space-xs text-xs">
                  <div className="flex items-center gap-space-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        alert.severity === 'red'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-tertiary-fixed text-on-tertiary-fixed'
                      }`}
                    >
                      {alert.severityLabelEn}
                    </span>
                    <span className="text-on-surface-variant font-semibold">ID: {alert.id}</span>
                  </div>
                  <span className="font-bold text-secondary">{alert.expiresInText}</span>
                </div>

                <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface mt-1">
                  {alert.titleEn}
                </h3>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                  {alert.englishSummary}
                </p>
              </div>

              {/* Action Directive Steps */}
              <div className="bg-surface-container-low rounded-2xl p-space-md flex flex-col gap-2">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">
                  Operational Directives:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {alert.farmerDirectives.slice(0, 2).map(dir => (
                    <div key={dir.step} className="bg-surface-container-lowest p-2.5 rounded-xl flex items-start gap-2 border border-outline-variant/30">
                      <span className="material-symbols-outlined text-secondary text-[1.25rem] mt-0.5">
                        {dir.icon}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-on-surface">{dir.titleEn}</span>
                        <span className="text-[0.65rem] text-on-surface-variant mt-0.5">{dir.descriptionEn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right 5 Cols: 3x3 Mesoscale Threat Matrix */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
          <div>
            <span className="text-xs uppercase font-bold text-primary tracking-wider">Risk Diagnostic</span>
            <h3 className="font-headline-sm text-base font-bold text-on-surface mt-0.5">
              3x3 Mesoscale Threat Matrix (Probability vs Impact)
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Multi-hazard spatial probability distribution across Central Plateau sectors.
            </p>
          </div>

          {/* Matrix Grid Visual */}
          <div className="space-y-1.5 bg-surface-container-low p-space-md rounded-2xl border border-outline-variant/20">
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold">
              {/* High Probability Row */}
              <div className="bg-secondary-fixed/40 text-on-secondary-fixed p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[0.65rem] opacity-75">High Prob / Low Imp</span>
                <span className="font-semibold text-xs mt-1">Light Showers</span>
              </div>
              <div className="bg-secondary-fixed text-on-secondary-fixed p-3 rounded-xl flex flex-col items-center justify-center border border-secondary/30">
                <span className="text-[0.65rem] opacity-75">High Prob / Med Imp</span>
                <span className="font-bold text-xs mt-1">Wind Squall</span>
              </div>
              <div className="bg-secondary text-on-secondary p-3 rounded-xl flex flex-col items-center justify-center shadow-sm">
                <span className="text-[0.65rem] text-secondary-fixed">High Prob / High Imp</span>
                <span className="font-extrabold text-xs mt-1">Severe Hailstorm (Active)</span>
              </div>

              {/* Med Probability Row */}
              <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col items-center justify-center text-on-surface-variant">
                <span className="text-[0.65rem] opacity-75">Med / Low</span>
                <span className="text-xs mt-1">Overcast</span>
              </div>
              <div className="bg-tertiary-fixed text-on-tertiary-fixed p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[0.65rem] opacity-75">Med / Med</span>
                <span className="font-semibold text-xs mt-1">Heat Stress</span>
              </div>
              <div className="bg-secondary-fixed text-on-secondary-fixed p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[0.65rem] opacity-75">Med / High</span>
                <span className="font-bold text-xs mt-1">Microburst</span>
              </div>

              {/* Low Probability Row */}
              <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col items-center justify-center text-on-surface-variant">
                <span className="text-[0.65rem] opacity-75">Low / Low</span>
                <span className="text-xs mt-1">Clear</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col items-center justify-center text-on-surface-variant">
                <span className="text-[0.65rem] opacity-75">Low / Med</span>
                <span className="text-xs mt-1">Dense Fog</span>
              </div>
              <div className="bg-tertiary-fixed text-on-tertiary-fixed p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[0.65rem] opacity-75">Low / High</span>
                <span className="text-xs mt-1">Tornado Shear</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[0.7rem] text-outline pt-2 px-1">
              <span>← Low Severity</span>
              <span className="font-bold text-secondary">High Critical Impact →</span>
            </div>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded-2xl flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[1.5rem]">shield</span>
            <div className="flex flex-col text-xs">
              <span className="font-bold text-on-surface">CAP 1.2 Protocol Broadcasting</span>
              <span className="text-on-surface-variant">All alerts feed directly into state emergency and rural SMS channels.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
