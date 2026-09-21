'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

interface RegionalMonsoonBaseline {
  regionName: string;
  state: string;
  lpaNormalMm: number; // 30-year IMD Long Period Average (1991-2020)
  currentRecordedMm: number;
  drySpellMaxDays: number;
  heavyRainDays: number; // >65 mm
  soilDepletionRate: string;
  monthlyData: {
    month: string;
    monthHi: string;
    lpaMm: number;
    recordedMm: number;
    departurePct: number;
  }[];
}

const BASIN_BASELINES: Record<string, RegionalMonsoonBaseline> = {
  'Madhya Pradesh': {
    regionName: 'Central Narmada & Malwa Basin',
    state: 'Madhya Pradesh',
    lpaNormalMm: 940,
    currentRecordedMm: 892,
    drySpellMaxDays: 9,
    heavyRainDays: 4,
    soilDepletionRate: '0.8% / day (Safe)',
    monthlyData: [
      { month: 'June', monthHi: 'जून', lpaMm: 140, recordedMm: 155, departurePct: 10.7 },
      { month: 'July', monthHi: 'जुलाई', lpaMm: 320, recordedMm: 295, departurePct: -7.8 },
      { month: 'August', monthHi: 'अगस्त', lpaMm: 310, recordedMm: 288, departurePct: -7.1 },
      { month: 'September', monthHi: 'सितंबर', lpaMm: 170, recordedMm: 154, departurePct: -9.4 },
    ],
  },
  'Uttar Pradesh': {
    regionName: 'Gangetic Alluvial Basin (Central UP)',
    state: 'Uttar Pradesh',
    lpaNormalMm: 860,
    currentRecordedMm: 785,
    drySpellMaxDays: 12,
    heavyRainDays: 3,
    soilDepletionRate: '1.2% / day (Moderate)',
    monthlyData: [
      { month: 'June', monthHi: 'जून', lpaMm: 110, recordedMm: 95, departurePct: -13.6 },
      { month: 'July', monthHi: 'जुलाई', lpaMm: 290, recordedMm: 260, departurePct: -10.3 },
      { month: 'August', monthHi: 'अगस्त', lpaMm: 280, recordedMm: 265, departurePct: -5.4 },
      { month: 'September', monthHi: 'सितंबर', lpaMm: 180, recordedMm: 165, departurePct: -8.3 },
    ],
  },
  'Delhi NCR': {
    regionName: 'Upper Indo-Gangetic Plains',
    state: 'Delhi NCR',
    lpaNormalMm: 640,
    currentRecordedMm: 570,
    drySpellMaxDays: 14,
    heavyRainDays: 2,
    soilDepletionRate: '1.4% / day (Elevated)',
    monthlyData: [
      { month: 'June', monthHi: 'जून', lpaMm: 65, recordedMm: 72, departurePct: 10.8 },
      { month: 'July', monthHi: 'जुलाई', lpaMm: 220, recordedMm: 185, departurePct: -15.9 },
      { month: 'August', monthHi: 'अगस्त', lpaMm: 230, recordedMm: 210, departurePct: -8.7 },
      { month: 'September', monthHi: 'सितंबर', lpaMm: 125, recordedMm: 103, departurePct: -17.6 },
    ],
  },
  'Maharashtra': {
    regionName: 'Western Deccan & Ghats Shadow',
    state: 'Maharashtra',
    lpaNormalMm: 780,
    currentRecordedMm: 820,
    drySpellMaxDays: 7,
    heavyRainDays: 5,
    soilDepletionRate: '0.6% / day (Safe)',
    monthlyData: [
      { month: 'June', monthHi: 'जून', lpaMm: 160, recordedMm: 185, departurePct: 15.6 },
      { month: 'July', monthHi: 'जुलाई', lpaMm: 280, recordedMm: 295, departurePct: 5.4 },
      { month: 'August', monthHi: 'अगस्त', lpaMm: 210, recordedMm: 215, departurePct: 2.4 },
      { month: 'September', monthHi: 'सितंबर', lpaMm: 130, recordedMm: 125, departurePct: -3.8 },
    ],
  },
  'Rajasthan': {
    regionName: 'Semi-Arid Western Basin',
    state: 'Rajasthan',
    lpaNormalMm: 510,
    currentRecordedMm: 440,
    drySpellMaxDays: 18,
    heavyRainDays: 1,
    soilDepletionRate: '1.8% / day (High Deficit Risk)',
    monthlyData: [
      { month: 'June', monthHi: 'जून', lpaMm: 50, recordedMm: 42, departurePct: -16.0 },
      { month: 'July', monthHi: 'जुलाई', lpaMm: 190, recordedMm: 160, departurePct: -15.8 },
      { month: 'August', monthHi: 'अगस्त', lpaMm: 185, recordedMm: 162, departurePct: -12.4 },
      { month: 'September', monthHi: 'सितंबर', lpaMm: 85, recordedMm: 76, departurePct: -10.6 },
    ],
  },
  'Bihar': {
    regionName: 'Middle Gangetic Agro-Climatic Zone',
    state: 'Bihar',
    lpaNormalMm: 1020,
    currentRecordedMm: 840,
    drySpellMaxDays: 16,
    heavyRainDays: 3,
    soilDepletionRate: '1.5% / day (Moderate Stress)',
    monthlyData: [
      { month: 'June', monthHi: 'जून', lpaMm: 170, recordedMm: 130, departurePct: -23.5 },
      { month: 'July', monthHi: 'जुलाई', lpaMm: 340, recordedMm: 285, departurePct: -16.2 },
      { month: 'August', monthHi: 'अगस्त', lpaMm: 320, recordedMm: 270, departurePct: -15.6 },
      { month: 'September', monthHi: 'सितंबर', lpaMm: 190, recordedMm: 155, departurePct: -18.4 },
    ],
  },
};

export default function MonsoonDeficitTracker() {
  const { location, language } = useApp();

  // Match regional baseline from location
  const detectedState = useMemo(() => {
    const s = `${location.state || ''} ${location.name || ''}`.toLowerCase();
    if (s.includes('uttar pradesh') || s.includes('lucknow') || s.includes('kanpur') || s.includes('varanasi') || s.includes('up')) return 'Uttar Pradesh';
    if (s.includes('delhi') || s.includes('noida') || s.includes('gurugram') || s.includes('ncr')) return 'Delhi NCR';
    if (s.includes('maharashtra') || s.includes('pune') || s.includes('mumbai')) return 'Maharashtra';
    if (s.includes('rajasthan') || s.includes('jaipur')) return 'Rajasthan';
    if (s.includes('bihar') || s.includes('patna')) return 'Bihar';
    return 'Madhya Pradesh';
  }, [location.state, location.name]);

  const [activeRegionKey, setActiveRegionKey] = useState<string>(detectedState);
  const [selectedEpoch, setSelectedEpoch] = useState<'30y' | '10y'>('30y');

  // Sync when location changes
  React.useEffect(() => {
    setActiveRegionKey(detectedState);
  }, [detectedState]);

  const baseline = BASIN_BASELINES[activeRegionKey] || BASIN_BASELINES['Madhya Pradesh'];

  // Calculate IMD Official Departure and Category
  const departurePercent = useMemo(() => {
    const diff = baseline.currentRecordedMm - baseline.lpaNormalMm;
    return Number(((diff / baseline.lpaNormalMm) * 100).toFixed(1));
  }, [baseline]);

  const imdCategory = useMemo(() => {
    if (departurePercent > 19) {
      return {
        labelEn: 'Excess (+19% to +59%)',
        labelHi: 'अत्यधिक वर्षा (+19% से ऊपर)',
        riskLevel: 'flood-watch',
        color: 'text-secondary bg-secondary/15 border-secondary/30',
        badge: 'Flood Watch',
        descEn: 'Monsoon precipitation exceeds 30-year normal. Monitor low-lying field drainage and fungal rot.',
        descHi: 'सामान्य से अधिक वर्षा दर्ज की गई है। खेतों में जलभराव एवं जड़ सड़न से बचाव की व्यवस्था करें।',
      };
    }
    if (departurePercent >= -19 && departurePercent <= 19) {
      return {
        labelEn: 'Normal (Within ±19% of 30-Yr LPA)',
        labelHi: 'सामान्य वर्षा (±19% LPA के भीतर)',
        riskLevel: 'normal',
        color: 'text-primary bg-primary/15 border-primary/30',
        badge: 'Normal Monsoon',
        descEn: 'Rainfall distribution coherent with 30-year Long Period Average. Moisture adequate for Kharif maturation.',
        descHi: 'मानसूनी वर्षा 30-वर्षीय सामान्य औसत के अनुरूप है। खरीफ फसलों के विकास हेतु नमी पर्याप्त है।',
      };
    }
    if (departurePercent >= -59 && departurePercent < -19) {
      return {
        labelEn: 'Deficient (-20% to -59%)',
        labelHi: 'अल्प वर्षा / कमी (-20% से -59%)',
        riskLevel: 'drought-warning',
        color: 'text-amber-700 bg-amber-100 border-amber-300',
        badge: 'Drought Warning',
        descEn: 'Rainfall deficit detected against IMD baseline. Conserve supplemental irrigation and apply mulch.',
        descHi: 'सामान्य से कम बारिश दर्ज। टपक या स्प्रिंकलर सिंचाई द्वारा नमी संरक्षित करें।',
      };
    }
    return {
      labelEn: 'Large Deficient (Drought Hazard ≤ -60%)',
      labelHi: 'गंभीर सूखा संकट (≤ -60%)',
      riskLevel: 'severe-drought',
      color: 'text-red-700 bg-red-100 border-red-300',
      badge: 'Severe Drought',
      descEn: 'Critical agro-meteorological drought threshold triggered. Emergency tubewell rationing activated.',
      descHi: 'गंभीर सूखा चेतावनी। आपातकालीन भूजल सिंचाई एवं जीवन-रक्षक सिंचाई प्रबंधन लागू करें।',
    };
  }, [departurePercent]);

  // Compute cumulative progression points for SVG visual
  const cumulativePoints = useMemo(() => {
    let cumLpa = 0;
    let cumActual = 0;
    return baseline.monthlyData.map((m, idx) => {
      cumLpa += m.lpaMm;
      cumActual += m.recordedMm;
      return {
        month: language === 'hi' ? m.monthHi : m.month,
        cumLpa,
        cumActual,
        departure: m.departurePct,
        upperBand: Math.round(cumLpa * 1.19),
        lowerBand: Math.round(cumLpa * 0.81),
      };
    });
  }, [baseline, language]);

  return (
    <section className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
      {/* Header with Title and Region Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[1.375rem]">water</span>
            <h2 className="font-headline-sm text-lg sm:text-xl font-extrabold text-on-surface">
              {language === 'hi'
                ? 'ऐतिहासिक जलवायु तुलना एवं मानसून घाटा ट्रैकर'
                : 'Historical Climate Comparison & Monsoon Deficit Tracker'}
            </h2>
          </div>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {language === 'hi'
              ? `IMD 30-वर्षीय दीर्घावधि औसत (LPA 1991–2020) के विरुद्ध चालू सीज़न का संचयी वर्षा विश्लेषण`
              : `Tracking cumulative Kharif rainfall vs. 30-Year IMD Long Period Average (LPA 1991–2020)`}
          </p>
        </div>

        {/* Region & Epoch Selector */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <select
            value={activeRegionKey}
            onChange={(e) => setActiveRegionKey(e.target.value)}
            className="px-3 py-1.5 bg-surface-container text-primary font-bold text-xs rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {Object.keys(BASIN_BASELINES).map(k => (
              <option key={k} value={k}>{k}: {BASIN_BASELINES[k].regionName}</option>
            ))}
          </select>

          <div className="flex items-center bg-surface-container p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSelectedEpoch('30y')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedEpoch === '30y' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              30-Yr LPA
            </button>
            <button
              onClick={() => setSelectedEpoch('10y')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedEpoch === '10y' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              10-Yr Epoch
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Key Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
        {/* Metric 1: Recorded vs LPA */}
        <div className="bg-surface-container-low p-space-md rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-semibold uppercase tracking-wider">Cumulative Monsoon Rain</span>
            <span className="material-symbols-outlined text-primary text-[1.125rem]">rainy</span>
          </div>
          <div className="mt-space-xs">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-on-surface">{baseline.currentRecordedMm}</span>
              <span className="text-xs font-bold text-on-surface-variant">/ {baseline.lpaNormalMm} mm</span>
            </div>
            <div className="text-xs text-on-surface-variant mt-1">
              Departure: <b className={departurePercent >= 0 ? 'text-primary' : 'text-amber-700'}>{departurePercent > 0 ? `+${departurePercent}%` : `${departurePercent}%`}</b>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${departurePercent < -19 ? 'bg-amber-600' : 'bg-primary'}`}
              style={{ width: `${Math.min(100, Math.round((baseline.currentRecordedMm / baseline.lpaNormalMm) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Official IMD Category */}
        <div className={`p-space-md rounded-2xl flex flex-col justify-between border ${imdCategory.color}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">IMD Status</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-xs font-bold shadow-xs">
              {imdCategory.badge}
            </span>
          </div>
          <div className="mt-space-xs">
            <div className="text-base font-black leading-tight">
              {language === 'hi' ? imdCategory.labelHi : imdCategory.labelEn}
            </div>
            <p className="text-[0.68rem] opacity-90 mt-1 line-clamp-2">
              {language === 'hi' ? imdCategory.descHi : imdCategory.descEn}
            </p>
          </div>
        </div>

        {/* Metric 3: Dry Spell & Drought Risk */}
        <div className="bg-surface-container-low p-space-md rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-semibold uppercase tracking-wider">Dry Spell Streak</span>
            <span className="material-symbols-outlined text-amber-600 text-[1.125rem]">wb_sunny</span>
          </div>
          <div className="mt-space-xs">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-700">{baseline.drySpellMaxDays}</span>
              <span className="text-xs font-bold text-on-surface-variant">days consecutive</span>
            </div>
            <div className="text-[0.68rem] text-on-surface-variant mt-1">
              Max rainless stretch in vegetative window ({baseline.drySpellMaxDays > 10 ? 'Warning' : 'Normal'})
            </div>
          </div>
        </div>

        {/* Metric 4: Soil Reservoir Depletion Rate */}
        <div className="bg-surface-container-low p-space-md rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-semibold uppercase tracking-wider">Root-Zone Moisture Depletion</span>
            <span className="material-symbols-outlined text-secondary text-[1.125rem]">psychology_alt</span>
          </div>
          <div className="mt-space-xs">
            <div className="text-base font-black text-on-surface">{baseline.soilDepletionRate}</div>
            <div className="text-[0.68rem] text-on-surface-variant mt-1">
              Heavy rain events (&gt;65mm): <b>{baseline.heavyRainDays} episodes</b>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cumulative Progression SVG Chart */}
      <div className="bg-surface-container-low rounded-2xl p-space-md border border-outline-variant/20 flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-on-surface">
            Cumulative Rainfall Progression Curve (June – September)
          </span>

          <div className="flex flex-wrap items-center gap-space-md font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span>Recorded 2026</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-outline"></span>
              <span>30-Yr IMD LPA</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500"></span>
              <span>Normal Band (±19%)</span>
            </span>
          </div>
        </div>

        {/* SVG Cumulative Trajectory Curve */}
        <div className="w-full h-56 overflow-hidden relative">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="0" y1="40" x2="800" y2="40" stroke="#d5e0da" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="90" x2="800" y2="90" stroke="#d5e0da" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="140" x2="800" y2="140" stroke="#d5e0da" strokeWidth="1" strokeDasharray="3 3" />

            {/* Normal Band Shaded Area (Between Lower Band 81% and Upper Band 119%) */}
            <polygon
              fill="rgba(25, 135, 84, 0.08)"
              points={`
                80,${190 - (cumulativePoints[0].lowerBand / 1100) * 160}
                280,${190 - (cumulativePoints[1].lowerBand / 1100) * 160}
                480,${190 - (cumulativePoints[2].lowerBand / 1100) * 160}
                720,${190 - (cumulativePoints[3].lowerBand / 1100) * 160}
                720,${190 - (cumulativePoints[3].upperBand / 1100) * 160}
                480,${190 - (cumulativePoints[2].upperBand / 1100) * 160}
                280,${190 - (cumulativePoints[1].upperBand / 1100) * 160}
                80,${190 - (cumulativePoints[0].upperBand / 1100) * 160}
              `}
            />

            {/* 30-Year LPA Dashed Baseline */}
            <polyline
              fill="none"
              stroke="#707973"
              strokeWidth="2.5"
              strokeDasharray="5 5"
              points={cumulativePoints
                .map((pt, i) => `${80 + i * 200 + (i === 3 ? 40 : 0)},${190 - (pt.cumLpa / 1100) * 160}`)
                .join(' ')}
            />

            {/* Current Recorded Actuals Solid Line */}
            <polyline
              fill="none"
              stroke="#0f5238"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={cumulativePoints
                .map((pt, i) => `${80 + i * 200 + (i === 3 ? 40 : 0)},${190 - (pt.cumActual / 1100) * 160}`)
                .join(' ')}
            />

            {/* Interactive Data Point Markers */}
            {cumulativePoints.map((pt, i) => {
              const cx = 80 + i * 200 + (i === 3 ? 40 : 0);
              const cy = 190 - (pt.cumActual / 1100) * 160;
              return (
                <g key={`point-${i}`}>
                  <circle cx={cx} cy={cy} r="6" className="fill-primary stroke-white stroke-2" />
                  <text x={cx} y={cy - 12} textAnchor="middle" className="text-[12px] font-black fill-on-surface">
                    {pt.cumActual} mm
                  </text>
                  <text x={cx} y="195" textAnchor="middle" className="text-[12px] font-bold fill-outline">
                    {pt.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Monthly Breakdown Departure Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-outline-variant/20">
          {baseline.monthlyData.map((m, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-2 rounded-xl flex flex-col items-center text-center">
              <span className="text-[0.7rem] font-semibold text-outline">
                {language === 'hi' ? m.monthHi : m.month}
              </span>
              <span className="text-xs font-bold text-on-surface">
                {m.recordedMm} mm <span className="text-[0.65rem] text-outline font-normal">({m.lpaMm} LPA)</span>
              </span>
              <span className={`text-[0.68rem] font-bold mt-0.5 ${m.departurePct >= 0 ? 'text-primary' : 'text-amber-700'}`}>
                {m.departurePct > 0 ? `+${m.departurePct}%` : `${m.departurePct}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
