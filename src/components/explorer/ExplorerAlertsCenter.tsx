'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';

export default function ExplorerAlertsCenter() {
  const { alerts, language, location } = useApp();
  const t = translations[language];

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [simulatedBroadcastNotice, setSimulatedBroadcastNotice] = useState<string | null>(null);

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedAlerts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const exportCapXml = (alertObj: typeof alerts[0]) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${alertObj.id}-${Date.now()}</identifier>
  <sender>${alertObj.source}</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>${alertObj.titleEn}</event>
    <urgency>${alertObj.severity === 'red' ? 'Immediate' : 'Expected'}</urgency>
    <severity>${alertObj.severity === 'red' ? 'Extreme' : 'Severe'}</severity>
    <certainty>Observed</certainty>
    <headline>${alertObj.titleEn}</headline>
    <description>${alertObj.englishSummary}</description>
    <area>
      <areaDesc>${alertObj.affectedTehsils.join(', ')}</areaDesc>
    </area>
  </info>
</alert>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CAP12_alert_${alertObj.id}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const simulateBroadcast = () => {
    setSimulatedBroadcastNotice('Transmitting CAP 1.2 emergency dispatch payload to state telecom gateway & rural cell towers...');
    setTimeout(() => {
      setSimulatedBroadcastNotice(`Broadcast successfully confirmed across local BTS cell sectors (${location.district || location.name}).`);
      setTimeout(() => setSimulatedBroadcastNotice(null), 4000);
    }, 1500);
  };

  const filteredAlerts = alerts.filter(a => {
    if (selectedThreat) {
      if (selectedThreat.includes('Hailstorm') || selectedThreat.includes('Convective')) {
        return a.titleEn.toLowerCase().includes('thunderstorm') || a.titleEn.toLowerCase().includes('hail');
      }
      if (selectedThreat.includes('Squall')) {
        return a.titleEn.toLowerCase().includes('wind') || a.englishSummary.toLowerCase().includes('wind');
      }
    }
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
                STATION ID: RADAR-${(location.district || 'REG').slice(0, 3).toUpperCase()}-01 (ACTIVE RADIAL)
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
                {location.district || location.name} Agro-Climatic Sub-Division ({location.state}) • Mesoscale Convective System (MCS) Nowcasting & Multi-hazard Diagnostics
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

              {/* Action Directive Steps & Operational Controls */}
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

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleAcknowledge(alert.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer ${
                      acknowledgedAlerts.includes(alert.id)
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-highest hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1rem]">
                      {acknowledgedAlerts.includes(alert.id) ? 'task_alt' : 'radio_button_unchecked'}
                    </span>
                    <span>{acknowledgedAlerts.includes(alert.id) ? 'Acknowledged' : 'Acknowledge'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportCapXml(alert)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[1rem]">code</span>
                    <span>Export CAP XML</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right 5 Cols: 3x3 Mesoscale Threat Matrix */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-primary tracking-wider">Risk Diagnostic</span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface mt-0.5">
                3x3 Mesoscale Threat Matrix (Probability vs Impact)
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Click any cell to filter and isolate active hazard vectors.
              </p>
            </div>
            {selectedThreat && (
              <button
                type="button"
                onClick={() => setSelectedThreat(null)}
                className="text-xs text-secondary font-bold hover:underline shrink-0 cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Matrix Grid Visual */}
          <div className="space-y-1.5 bg-surface-container-low p-space-md rounded-2xl border border-outline-variant/20">
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold">
              {/* High Probability Row */}
              {[
                { label: 'High Prob / Low Imp', title: 'Light Showers', bg: 'bg-secondary-fixed/40 text-on-secondary-fixed' },
                { label: 'High Prob / Med Imp', title: 'Wind Squall', bg: 'bg-secondary-fixed text-on-secondary-fixed' },
                { label: 'High Prob / High Imp', title: 'Severe Hailstorm (Active)', bg: 'bg-secondary text-on-secondary' },
                { label: 'Med / Low', title: 'Overcast', bg: 'bg-surface-container-lowest text-on-surface-variant' },
                { label: 'Med / Med', title: 'Heat Stress', bg: 'bg-tertiary-fixed text-on-tertiary-fixed' },
                { label: 'Med / High', title: 'Microburst', bg: 'bg-secondary-fixed text-on-secondary-fixed' },
                { label: 'Low / Low', title: 'Clear', bg: 'bg-surface-container-lowest text-on-surface-variant' },
                { label: 'Low / Med', title: 'Dense Fog', bg: 'bg-surface-container-lowest text-on-surface-variant' },
                { label: 'Low / High', title: 'Tornado Shear', bg: 'bg-tertiary-fixed text-on-tertiary-fixed' },
              ].map((cell, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedThreat(selectedThreat === cell.title ? null : cell.title)}
                  className={`${cell.bg} p-3 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
                    selectedThreat === cell.title ? 'ring-2 ring-primary shadow-md scale-105' : 'hover:opacity-90'
                  }`}
                >
                  <span className="text-[0.65rem] opacity-75">{cell.label}</span>
                  <span className="font-bold text-xs mt-1">{cell.title}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[0.7rem] text-outline pt-2 px-1">
              <span>← Low Severity</span>
              <span className="font-bold text-secondary">High Critical Impact →</span>
            </div>
          </div>

          {/* Broadcast Simulation Notice */}
          {simulatedBroadcastNotice && (
            <div className="p-3 bg-secondary-fixed text-on-secondary-fixed rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[1.25rem] animate-spin">sync</span>
              <span>{simulatedBroadcastNotice}</span>
            </div>
          )}

          <div className="p-space-sm bg-surface-container-low rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[1.5rem]">shield</span>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-on-surface">CAP 1.2 Protocol Broadcasting</span>
                <span className="text-on-surface-variant">Standardized Common Alerting Protocol compliant.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={simulateBroadcast}
              className="px-3 py-1.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs hover:bg-secondary-container transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
            >
              Simulate Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
