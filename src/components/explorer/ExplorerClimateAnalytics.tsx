'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';

export default function ExplorerClimateAnalytics() {
  const { weather, location, language } = useApp();
  const t = translations[language];

  const [timeHorizon, setTimeHorizon] = useState<'24h' | '7d' | '30d' | 'monsoon'>('7d');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showHistoricalComparison, setShowHistoricalComparison] = useState(true);

  // SVG Chart data points for temperature and last year comparison
  const chartData = [
    { label: 'Mon', temp: 31, lastYear: 29, rain: 2 },
    { label: 'Tue', temp: 32, lastYear: 30, rain: 0 },
    { label: 'Wed', temp: 29, lastYear: 31, rain: 18 },
    { label: 'Thu', temp: 28, lastYear: 28, rain: 12 },
    { label: 'Fri', temp: 30, lastYear: 29, rain: 4 },
    { label: 'Sat', temp: 33, lastYear: 32, rain: 0 },
    { label: 'Sun', temp: 32, lastYear: 31, rain: 0 },
  ];

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const exportDataset = (format: string) => {
    setShowExportMenu(false);

    let content = '';
    let mimeType = 'text/plain';
    let fileName = 'malwa_climate_dataset';

    if (format.includes('CSV')) {
      fileName = `malwa_telemetry_${timeHorizon}_${Date.now()}.csv`;
      mimeType = 'text/csv';
      content = [
        'Day,Temperature_C,LastYear_Temp_C,Precipitation_mm,DewPoint_C,Consensus_Score',
        ...chartData.map(d => `${d.label},${d.temp},${d.lastYear},${d.rain},21.4,96.2%`),
      ].join('\n');
    } else if (format.includes('GeoJSON')) {
      fileName = `malwa_boundary_grid_${Date.now()}.geojson`;
      mimeType = 'application/geo+json';
      content = JSON.stringify(
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
              properties: {
                station: location.name,
                elevation: location.elevation,
                temperature: weather.current.temperature,
                consensusScore: weather.consensus.confidenceScore,
              },
            },
          ],
        },
        null,
        2
      );
    } else {
      fileName = `akash_vaani_bulletin_${Date.now()}.txt`;
      mimeType = 'text/plain';
      content = `=====================================================
AKASH-VAANI METEOROLOGICAL EXECUTIVE BULLETIN
Sector: Western Malwa Agro-Climatic Zone
Station: ${location.name} (${location.lat}°N, ${location.lng}°E)
Generated: ${new Date().toLocaleString('en-IN')}
=====================================================
Current Temperature: ${weather.current.temperature}°C
Relative Humidity: ${weather.current.relativeHumidity}%
Surface Wind: ${weather.current.windSpeed} km/h (${weather.current.windCompass})
Multi-Source Consensus: ${weather.consensus.primarySource} + ${weather.consensus.secondarySource} (${weather.consensus.confidenceScore}%)
Soil Wetness: 64% (Heavy Black Cotton Clay)
Synoptic Assessment: Convective squall lines expected post-noon along the Dewas-Indore corridor.
=====================================================`;
    }

    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportNotice(`Exported ${fileName}`);
      setTimeout(() => setExportNotice(null), 3500);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg">
      {/* Top Bar: Scope, Time Horizon Selector & Data Export */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-surface-container-high">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-outline text-xs">
            <span className="font-label-sm uppercase tracking-wider font-semibold text-primary">
              Explorer Suite Telemetry
            </span>
            <span>•</span>
            <span>Sector MP-44-W (Indore / Ujjain Agro-Climatic Zone)</span>
          </div>
          <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
            Atmospheric Trends & Historical Telemetry — Western Malwa Plateau
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl">
            Multi-decadal baseline modeling mapped with real-time INSAT-3DR radiometric sweeps and local weather radar consensus.
          </p>
        </div>

        {/* Time Horizon & Export Controls */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center bg-surface-container p-1 rounded-full shadow-inner">
            {(['24h', '7d', '30d', 'monsoon'] as const).map(horizon => (
              <button
                key={horizon}
                className={`px-3 py-1.5 rounded-full font-label-sm text-xs font-bold transition-all ${
                  timeHorizon === horizon
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setTimeHorizon(horizon)}
                type="button"
              >
                {horizon === '24h' ? '24 Hours' : horizon === '7d' ? '7 Days' : horizon === '30d' ? '30 Days' : 'Monsoon Overview'}
              </button>
            ))}
          </div>

          <div className="relative inline-block text-left">
            <button
              className="flex items-center gap-1 px-space-md py-2 bg-primary text-on-primary rounded-full font-label-md text-xs font-bold hover:bg-primary-container shadow-xs transition-all active:scale-95 cursor-pointer"
              onClick={() => setShowExportMenu(!showExportMenu)}
              type="button"
            >
              <span className="material-symbols-outlined text-[1rem]">download</span>
              <span>Export Dataset</span>
              <span className="material-symbols-outlined text-[1rem]">arrow_drop_down</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-xl z-30 py-2 border border-surface-container-high animate-fadeIn">
                <button
                  onClick={() => exportDataset('CSV (Aggregated 15m)')}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-on-surface text-xs hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-primary text-[1rem]">table_view</span>
                  <span>CSV (Aggregated 15m)</span>
                </button>
                <button
                  onClick={() => exportDataset('GeoJSON Boundary Grid')}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-on-surface text-xs hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-secondary text-[1rem]">data_object</span>
                  <span>GeoJSON Boundary Grid</span>
                </button>
                <button
                  onClick={() => exportDataset('Executive Bulletin PDF')}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-on-surface text-xs hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-outline text-[1rem]">picture_as_pdf</span>
                  <span>Executive Bulletin PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Export Success Toast Notification */}
      {exportNotice && (
        <div className="flex items-center justify-between bg-primary text-on-primary px-space-md py-2.5 rounded-2xl shadow-md text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.25rem]">check_circle</span>
            <span>{exportNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="p-1 hover:opacity-80 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[1rem]">close</span>
          </button>
        </div>
      )}

      {/* Multi-Source Consensus Validation Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm p-space-md bg-surface-container-low rounded-2xl border border-surface-container-high">
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-1 bg-surface-container-lowest px-space-sm py-1 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-xs text-primary font-bold">Consensus Validated</span>
          </div>
          <span className="font-body-sm text-xs text-on-surface-variant font-medium">
            Cross-checked across IMD Doppler Radar (Bhopal/Indore), INSAT-3DR Radiometer & Copernicus Climate Model (ECMWF IFS-0.1°)
          </span>
        </div>
        <div className="flex items-center gap-1 text-outline text-xs">
          <span className="material-symbols-outlined text-[1rem]">schedule</span>
          <span>Cycle: 06:00 UTC • Deviation Tolerance ±0.22°C</span>
        </div>
      </div>

      {/* Grid: Microclimate Indicators (Left 4 cols) & Historical Chart (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Topographical & Microclimate Context Panel (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Spatial Card with Topographical View */}
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm border border-surface-container-high flex flex-col">
            <div
              className="relative h-44 w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBH-Jc7sa6sJ5Dm1bicGosVfrGOkMyua7zaSJSueTNAZjgqycy2R7OwH06VhtGH1tK-nTejn21cTVqowIG-NkfOEiIcByAyiGkMAb7x3gDUOZ-lJfhRUnOSesMkDdXfOsJgZ33XpDOz4oZ3dYE52ewW3tk0nupJh_K8D8qgtJn7lFFdEzSEU4J8XP8ZRUFiSEBpbwNcTSSlbN5j0InJ640x_HcNnhuD4xMuwM6WRPDDeLINhp7RBgan')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent"></div>
              <div className="absolute top-space-sm left-space-sm bg-surface-container-lowest/85 backdrop-blur-md px- space-sm py-1 rounded-full flex items-center gap-1 shadow-xs">
                <span className="material-symbols-outlined text-primary text-[1rem]">landscape</span>
                <span className="font-label-sm text-xs text-on-surface font-bold">Malwa Vertisol Zone</span>
              </div>
              <div className="absolute bottom-space-sm left-space-sm right-space-sm flex justify-between items-end text-inverse-on-surface">
                <div>
                  <span className="font-label-sm text-[0.7rem] text-primary-fixed-dim uppercase tracking-wider font-semibold">
                    Base Elevation
                  </span>
                  <div className="font-headline-md text-xl font-bold leading-none">
                    553 m <span className="text-xs font-normal opacity-80">MSL</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-sm text-[0.7rem] text-primary-fixed-dim uppercase tracking-wider font-semibold">
                    Station Class
                  </span>
                  <div className="text-xs font-bold">WMO #42754 (Aero)</div>
                </div>
              </div>
            </div>

            {/* Metric Quadrants */}
            <div className="grid grid-cols-2 gap-px bg-surface-container-high">
              {/* Soil Moisture */}
              <div className="p-space-md bg-surface-container-lowest flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-xs">Soil Moisture (0-30cm)</span>
                  <span className="material-symbols-outlined text-primary text-[1.125rem]">water_drop</span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-data-metric text-xl font-bold text-primary">28%</span>
                  <span className="text-[0.65rem] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">Optimal</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '56%' }}></div>
                </div>
                <span className="text-[0.65rem] text-outline">Volumetric Cap: 34% max</span>
              </div>

              {/* Solar Irradiance */}
              <div className="p-space-md bg-surface-container-lowest flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-xs">Solar Irradiance</span>
                  <span className="material-symbols-outlined text-tertiary text-[1.125rem]">solar_power</span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-data-metric text-xl font-bold text-on-surface">780</span>
                  <span className="text-xs text-on-surface-variant">W/m²</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-[0.65rem] text-outline">Peak Direct: 910 W/m²</span>
              </div>

              {/* Evapotranspiration */}
              <div className="p-space-md bg-surface-container-lowest flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-xs">Evapotranspiration</span>
                  <span className="material-symbols-outlined text-secondary text-[1.125rem]">cloud_sync</span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-data-metric text-xl font-bold text-on-surface">4.2</span>
                  <span className="text-xs text-on-surface-variant">mm/day</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '48%' }}></div>
                </div>
                <span className="text-[0.65rem] text-outline">Penman-Monteith Model</span>
              </div>

              {/* Vapor Pressure Deficit */}
              <div className="p-space-md bg-surface-container-lowest flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-xs">Vapor Deficit (VPD)</span>
                  <span className="material-symbols-outlined text-primary text-[1.125rem]">compress</span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-data-metric text-xl font-bold text-on-surface">1.14</span>
                  <span className="text-xs text-on-surface-variant">kPa</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-[0.65rem] text-outline">Transpiration Rate: Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Day Historical Line & Bar Chart (Right 8 Columns) */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <div>
              <span className="font-label-sm text-xs uppercase tracking-wider text-outline font-bold">
                Telemetry Synthesis
              </span>
              <h2 className="font-headline-sm text-lg font-extrabold text-on-surface">
                Temperature & Precipitation Trend Matrix
              </h2>
            </div>
            <div className="flex items-center gap-space-sm text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHistoricalComparison}
                  onChange={(e) => setShowHistoricalComparison(e.target.checked)}
                  className="rounded text-primary"
                />
                <span className="font-semibold text-on-surface-variant">vs Last Year (2025)</span>
              </label>
            </div>
          </div>

          {/* Interactive SVG Chart Rendering */}
          <div className="w-full h-64 bg-surface-container-low rounded-2xl p-space-md flex flex-col justify-between relative overflow-hidden border border-outline-variant/20">
            {/* Chart Legend */}
            <div className="flex items-center justify-end gap-space-md text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span>Current Cycle (°C)</span>
              </span>
              {showHistoricalComparison && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b-2 border-dashed border-outline"></span>
                  <span>2025 Historical Mean</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-secondary/70"></span>
                <span>Precipitation (mm)</span>
              </span>
            </div>

            {/* SVG Visual Curves & Bars */}
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 700 160">
              {/* Grid lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#dbe5e0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="#dbe5e0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="700" y2="120" stroke="#dbe5e0" strokeWidth="1" strokeDasharray="4 4" />

              {/* Rain Bars */}
              {chartData.map((d, i) => {
                const x = 50 + i * 100;
                const barHeight = d.rain * 4;
                return (
                  <rect
                    key={`bar-${i}`}
                    x={x - 14}
                    y={160 - barHeight}
                    width="28"
                    height={barHeight}
                    rx="4"
                    className="fill-secondary/60 hover:fill-secondary transition-all"
                  />
                );
              })}

              {/* Last year dashed polyline */}
              {showHistoricalComparison && (
                <polyline
                  fill="none"
                  stroke="#707973"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points={chartData
                    .map((d, i) => `${50 + i * 100},${160 - (d.lastYear - 20) * 8}`)
                    .join(' ')}
                />
              )}

              {/* Current Temperature Solid Line */}
              <polyline
                fill="none"
                stroke="#0f5238"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartData
                  .map((d, i) => `${50 + i * 100},${160 - (d.temp - 20) * 8}`)
                  .join(' ')}
              />

              {/* Data points */}
              {chartData.map((d, i) => {
                const x = 50 + i * 100;
                const y = 160 - (d.temp - 20) * 8;
                return (
                  <g key={`pt-${i}`}>
                    <circle cx={x} cy={y} r="5" className="fill-primary stroke-white stroke-2" />
                    <text x={x} y={y - 10} textAnchor="middle" className="text-[11px] font-bold fill-on-surface">
                      {d.temp}°
                    </text>
                    <text x={x} y="155" textAnchor="middle" className="text-[11px] font-semibold fill-outline">
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Anomaly Metrics Table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
            <div className="bg-surface-container-low p-space-sm rounded-2xl flex flex-col">
              <span className="text-[0.7rem] uppercase font-bold text-outline">Mean Temp Anomaly</span>
              <span className="font-bold text-lg text-secondary mt-0.5">+0.8°C</span>
              <span className="text-[0.65rem] text-on-surface-variant">Above 30-year Malwa baseline</span>
            </div>

            <div className="bg-surface-container-low p-space-sm rounded-2xl flex flex-col">
              <span className="text-[0.7rem] uppercase font-bold text-outline">Monsoon Rainfall Deficit</span>
              <span className="font-bold text-lg text-primary mt-0.5">-4.2%</span>
              <span className="text-[0.65rem] text-on-surface-variant">Within normal IMD decadal band</span>
            </div>

            <div className="bg-surface-container-low p-space-sm rounded-2xl flex flex-col">
              <span className="text-[0.7rem] uppercase font-bold text-outline">Growing Degree Days</span>
              <span className="font-bold text-lg text-on-surface mt-0.5">+64 GDD</span>
              <span className="text-[0.65rem] text-on-surface-variant">Accelerated vegetative stage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
