'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';

const InteractiveRadarMap = dynamic(() => import('./InteractiveRadarMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-3xl bg-surface-container-low flex flex-col items-center justify-center gap-3 border border-surface-container-high">
      <span className="material-symbols-outlined text-primary text-4xl animate-spin">radar</span>
      <span className="text-sm font-semibold text-on-surface-variant">Initializing Doppler Radar Telemetry Engine...</span>
    </div>
  ),
});

export default function ExplorerWeatherDashboard() {
  const {
    weather,
    location,
    setLocation,
    language,
    setActiveExplorerTab,
    refreshWeather,
    isLoadingWeather,
    networkMode,
  } = useApp();

  const [hourlyRange, setHourlyRange] = React.useState<12 | 24>(12);

  const REGIONAL_RADAR_STATIONS: Record<string, { name: string; nameHi: string; state: string; lat: number; lng: number; elevation: number; district: string }[]> = {
    'Madhya Pradesh': [
      { name: 'Indore (Depalpur / Sanwer)', nameHi: 'इंदौर (देपालपुर / सांवेर)', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, elevation: 553, district: 'Indore' },
      { name: 'Bhopal (Berasia / Huzur)', nameHi: 'भोपाल (बैरसिया / हुजूर)', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, elevation: 527, district: 'Bhopal' },
      { name: 'Ujjain (Tarana / Mahidpur)', nameHi: 'उज्जैन (तराना / महिदपुर)', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885, elevation: 494, district: 'Ujjain' },
      { name: 'Dewas (Sonkatch / Tonk Khurd)', nameHi: 'देवास (सोनकच्छ / टोंक खुर्द)', state: 'Madhya Pradesh', lat: 22.9676, lng: 76.0534, elevation: 535, district: 'Dewas' },
      { name: 'Dhar (Badnawar / Sardarpur)', nameHi: 'धार (बदनावर / सरदारपुर)', state: 'Madhya Pradesh', lat: 22.5978, lng: 75.2979, elevation: 559, district: 'Dhar' },
      { name: 'Gwalior', nameHi: 'ग्वालियर', state: 'Madhya Pradesh', lat: 26.2183, lng: 78.1828, elevation: 211, district: 'Gwalior' },
      { name: 'Jabalpur', nameHi: 'जबलपुर', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864, elevation: 411, district: 'Jabalpur' },
    ],
    'Uttar Pradesh': [
      { name: 'Lucknow (Amausi Hub)', nameHi: 'लखनऊ (अमौसी हब)', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, elevation: 123, district: 'Lucknow' },
      { name: 'Kanpur (Chakeri)', nameHi: 'कानपुर (चकेरी)', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, elevation: 126, district: 'Kanpur' },
      { name: 'Varanasi (Babatpur)', nameHi: 'वाराणसी (बाबतपुर)', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, elevation: 81, district: 'Varanasi' },
      { name: 'Agra (Kheria)', nameHi: 'आगरा (खेरिया)', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, elevation: 171, district: 'Agra' },
      { name: 'Prayagraj (Bamrauli)', nameHi: 'प्रयागराज (बमरौली)', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463, elevation: 98, district: 'Prayagraj' },
      { name: 'Gorakhpur', nameHi: 'गोरखपुर', state: 'Uttar Pradesh', lat: 26.7606, lng: 83.3732, elevation: 84, district: 'Gorakhpur' },
    ],
    'Delhi NCR': [
      { name: 'New Delhi (Palam Radar)', nameHi: 'नई दिल्ली (पालम रडार)', state: 'Delhi', lat: 28.6139, lng: 77.2090, elevation: 216, district: 'New Delhi' },
      { name: 'Noida (Sector 62)', nameHi: 'नोएडा', state: 'Delhi NCR', lat: 28.5355, lng: 77.3910, elevation: 200, district: 'Noida' },
      { name: 'Gurugram', nameHi: 'गुरुग्राम', state: 'Delhi NCR', lat: 28.4595, lng: 77.0266, elevation: 217, district: 'Gurugram' },
      { name: 'Ghaziabad', nameHi: 'गाजियाबाद', state: 'Delhi NCR', lat: 28.6692, lng: 77.4538, elevation: 214, district: 'Ghaziabad' },
      { name: 'Faridabad', nameHi: 'फरीदाबाद', state: 'Delhi NCR', lat: 28.4089, lng: 77.3178, elevation: 205, district: 'Faridabad' },
    ],
    'Maharashtra': [
      { name: 'Pune (Pashan Radar)', nameHi: 'पुणे (पाषाण रडार)', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, elevation: 560, district: 'Pune' },
      { name: 'Mumbai (Colaba DWR)', nameHi: 'मुंबई (कुलाबा)', state: 'Maharashtra', lat: 18.9220, lng: 72.8347, elevation: 14, district: 'Mumbai' },
      { name: 'Nagpur (Sonegaon)', nameHi: 'नागपुर', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, elevation: 310, district: 'Nagpur' },
      { name: 'Nashik', nameHi: 'नाशिक', state: 'Maharashtra', lat: 19.9975, lng: 73.7898, elevation: 600, district: 'Nashik' },
      { name: 'Aurangabad (Chh. Sambhajinagar)', nameHi: 'औरंगाबाद', state: 'Maharashtra', lat: 19.8762, lng: 75.3433, elevation: 568, district: 'Aurangabad' },
    ],
    'Rajasthan': [
      { name: 'Jaipur (Sanganer Radar)', nameHi: 'जयपुर (सांगानेर)', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, elevation: 431, district: 'Jaipur' },
      { name: 'Jodhpur', nameHi: 'जोधपुर', state: 'Rajasthan', lat: 26.2389, lng: 73.0243, elevation: 231, district: 'Jodhpur' },
      { name: 'Kota', nameHi: 'कोटा', state: 'Rajasthan', lat: 25.2138, lng: 75.8648, elevation: 271, district: 'Kota' },
      { name: 'Udaipur', nameHi: 'उदयपुर', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, elevation: 598, district: 'Udaipur' },
    ],
    'Bihar': [
      { name: 'Patna (IMD Hub)', nameHi: 'पटना (मौसम केंद्र)', state: 'Bihar', lat: 25.5941, lng: 85.1376, elevation: 53, district: 'Patna' },
      { name: 'Gaya', nameHi: 'गया', state: 'Bihar', lat: 24.7914, lng: 85.0002, elevation: 111, district: 'Gaya' },
      { name: 'Bhagalpur', nameHi: 'भागलपुर', state: 'Bihar', lat: 25.2425, lng: 86.9842, elevation: 52, district: 'Bhagalpur' },
      { name: 'Muzaffarpur', nameHi: 'मुजफ्फरपुर', state: 'Bihar', lat: 26.1209, lng: 85.3647, elevation: 60, district: 'Muzaffarpur' },
    ],
  };

  // Auto-detect matching region from current location
  const detectedRegion = React.useMemo(() => {
    const s = `${location.state || ''} ${location.name || ''}`.toLowerCase();
    if (s.includes('uttar pradesh') || s.includes('lucknow') || s.includes('up') || s.includes('kanpur') || s.includes('varanasi')) return 'Uttar Pradesh';
    if (s.includes('delhi') || s.includes('noida') || s.includes('gurugram') || s.includes('ghaziabad') || s.includes('ncr')) return 'Delhi NCR';
    if (s.includes('maharashtra') || s.includes('pune') || s.includes('mumbai') || s.includes('nagpur')) return 'Maharashtra';
    if (s.includes('rajasthan') || s.includes('jaipur') || s.includes('jodhpur')) return 'Rajasthan';
    if (s.includes('bihar') || s.includes('patna')) return 'Bihar';
    return 'Madhya Pradesh';
  }, [location.state, location.name]);

  const [selectedRegion, setSelectedRegion] = React.useState<string>(detectedRegion);

  React.useEffect(() => {
    setSelectedRegion(detectedRegion);
  }, [detectedRegion]);

  const activeStations = REGIONAL_RADAR_STATIONS[selectedRegion] || REGIONAL_RADAR_STATIONS['Madhya Pradesh'];

  const agroZoneName = React.useMemo(() => {
    const s = `${location.state || ''} ${location.name || ''}`.toLowerCase();
    if (s.includes('uttar pradesh') || s.includes('lucknow')) return 'Gangetic Alluvial Plains Zone (Agro-Met IV)';
    if (s.includes('delhi') || s.includes('ncr')) return 'Upper Indo-Gangetic Basin • Northern Plains';
    if (s.includes('madhya pradesh') || s.includes('indore') || s.includes('bhopal')) return 'Malwa & Central Narmada Plateau Zone';
    if (s.includes('maharashtra') || s.includes('pune') || s.includes('mumbai')) return 'Western Deccan Agro-Climatic Zone';
    if (s.includes('rajasthan')) return 'Semi-Arid Western Basin Zone';
    if (s.includes('bihar')) return 'Middle Gangetic Agro-Climatic Zone';
    return `${location.state || 'Regional'} Agro-Met Observation Zone`;
  }, [location.state, location.name]);

  const stationId = React.useMemo(() => {
    const raw = (location.district || location.name || 'RAD').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'RAD';
    const num = Math.abs(Math.round((location.lat || 22) * 10)) % 1000;
    return `DWR-${raw}-${num.toString().padStart(3, '0')}`;
  }, [location.district, location.name, location.lat]);

  const corridorDesc = React.useMemo(() => {
    const stateOrRegion = location.state || 'Regional';
    return `${stateOrRegion} Meteorological Corridor • Lat ${location.lat.toFixed(2)}°N, Long ${location.lng.toFixed(2)}°E`;
  }, [location.state, location.lat, location.lng]);

  const t = translations[language];

  return (
    <div className="flex flex-col gap-space-lg w-full max-w-7xl mx-auto">
      {/* Station Selector Bar with Region Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm rounded-2xl border border-surface-container-high shadow-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[1.25rem]">cell_tower</span>
          <span className="font-label-md text-xs font-bold text-on-surface whitespace-nowrap">
            Doppler Radar Station:
          </span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-2 py-1 bg-surface-container text-primary font-bold text-xs rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {Object.keys(REGIONAL_RADAR_STATIONS).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {activeStations.map(stn => {
            const isSelected = (location.district && stn.district.toLowerCase() === location.district.toLowerCase()) || location.name.includes(stn.district);
            return (
              <button
                key={stn.name}
                type="button"
                onClick={() => {
                  setLocation(stn);
                  refreshWeather();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {stn.district}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-header Breadcrumb & Operational Mode Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs text-on-surface-variant text-xs">
          <span className="font-label-sm uppercase tracking-wider text-outline font-semibold">
            {agroZoneName}
          </span>
          <span className="text-outline">•</span>
          <span className="font-label-sm font-semibold text-primary">Station ID: {stationId}</span>
          <span className="text-outline">•</span>
          <span className="font-label-sm text-on-surface-variant">
            {weather.current.updatedAt}
          </span>
        </div>

        {/* Live Telemetry Status Pill */}
        <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-1 rounded-full shadow-xs border border-surface-container-high">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="font-label-sm text-xs text-on-surface font-semibold">
            Telemetry Synchronized
          </span>
          <span className="text-outline text-xs">|</span>
          <span className="font-label-sm text-xs text-on-surface-variant">
            ECMWF ERA5 + IMD Mesh
          </span>
          <button
            onClick={() => refreshWeather()}
            disabled={isLoadingWeather}
            className="p-1 text-primary hover:text-primary-container active:scale-95 transition-transform cursor-pointer"
            title="Refresh weather data"
            type="button"
          >
            <span className={`material-symbols-outlined text-[1rem] ${isLoadingWeather ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Atmospheric Bento Hero: Weather Instrumentation Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high p-space-lg md:p-space-xl shadow-md border border-surface-container-high">
        {/* Ambient Decorative Gradient Spheres */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-fixed-dim/30 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-space-lg">
          {/* Station Identity & Primary Consensus Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[1.5rem]">location_on</span>
                <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-extrabold tracking-tight">
                  {location.name}
                </h1>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-xs font-semibold">
                  {location.elevation}m MSL
                </span>
              </div>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
                {corridorDesc}
              </p>
            </div>

            {/* Multi-Source Consensus Validation Box (FR-2.3 & NFR-4) */}
            <div className="flex items-center gap-space-sm bg-surface-container-lowest/90 backdrop-blur-md px-space-md py-space-sm rounded-2xl shadow-sm self-start lg:self-auto border border-primary/20">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[1.25rem]">verified</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-md text-xs font-bold text-on-surface">
                    {weather.consensus.primarySource}
                  </span>
                  <span className="font-label-sm text-[0.7rem] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                    {weather.consensus.confidenceScore}% Consensus
                  </span>
                </div>
                <span className="font-body-sm text-[0.7rem] text-on-surface-variant">
                  {weather.consensus.secondarySource} (±{weather.consensus.temperatureDelta}°C)
                </span>
              </div>
            </div>
          </div>

          {/* Metric Reading Core: Big Stat & Realtime Sensor Deck */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center">
            {/* Dominant Temperature Display */}
            <div className="md:col-span-6 lg:col-span-5 flex items-center gap-space-lg">
              <div className="flex flex-col">
                <div className="flex items-start">
                  <span className="font-display-lg text-5xl sm:text-6xl text-on-surface font-extrabold tracking-tight">
                    {weather.current.temperature}
                  </span>
                  <span className="font-headline-lg text-2xl text-outline font-semibold mt-1">°C</span>
                </div>
                <div className="flex items-center gap-space-xs text-on-surface font-headline-sm text-sm sm:text-base font-bold">
                  <span>{language === 'hi' ? weather.current.conditionHi : weather.current.conditionEn}</span>
                  <span className="text-outline">•</span>
                  <span className="font-body-md text-on-surface-variant font-normal">
                    {language === 'hi' ? 'महसूस' : 'RealFeel'} {weather.current.apparentTemperature}°C
                  </span>
                </div>
                <span className="font-body-sm text-xs text-on-surface-variant mt-1">
                  Slight afternoon convective cumulus buildup
                </span>
              </div>

              {/* Atmospheric Visual Icon */}
              <div className="flex flex-col items-center justify-center p-space-md rounded-2xl bg-surface-container-lowest/80 backdrop-blur shadow-xs">
                <span className="material-symbols-outlined text-[3.5rem] text-tertiary-container animate-pulse">
                  {weather.current.icon}
                </span>
                <span className="font-label-sm text-[0.7rem] text-on-surface-variant mt-1 font-semibold">
                  Moderate Insolation
                </span>
              </div>
            </div>

            {/* Secondary Instrument Cluster */}
            <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              {/* Surface Wind */}
              <div className="bg-surface-container-lowest/90 backdrop-blur p-space-md rounded-2xl flex flex-col justify-between shadow-xs border border-surface-container-high">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-[0.7rem] uppercase tracking-wider font-semibold">Surface Wind</span>
                  <span className="material-symbols-outlined text-[1.125rem] text-primary">air</span>
                </div>
                <div className="mt-space-sm">
                  <span className="font-data-metric text-xl font-bold text-on-surface">{weather.current.windSpeed}</span>
                  <span className="font-label-sm text-xs text-on-surface-variant ml-1">km/h</span>
                  <div className="font-body-sm text-[0.7rem] text-on-surface-variant">{weather.current.windCompass} ({weather.current.windDirection}°)</div>
                </div>
              </div>

              {/* Rel Humidity */}
              <div className="bg-surface-container-lowest/90 backdrop-blur p-space-md rounded-2xl flex flex-col justify-between shadow-xs border border-surface-container-high">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-[0.7rem] uppercase tracking-wider font-semibold">Rel. Humidity</span>
                  <span className="material-symbols-outlined text-[1.125rem] text-primary">humidity_percentage</span>
                </div>
                <div className="mt-space-sm">
                  <span className="font-data-metric text-xl font-bold text-on-surface">{weather.current.relativeHumidity}%</span>
                  <div className="font-body-sm text-[0.7rem] text-on-surface-variant">Dew Pt: 21°C</div>
                </div>
              </div>

              {/* Barometer */}
              <div className="bg-surface-container-lowest/90 backdrop-blur p-space-md rounded-2xl flex flex-col justify-between shadow-xs border border-surface-container-high">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-[0.7rem] uppercase tracking-wider font-semibold">Barometer</span>
                  <span className="material-symbols-outlined text-[1.125rem] text-primary">compress</span>
                </div>
                <div className="mt-space-sm">
                  <span className="font-data-metric text-xl font-bold text-on-surface">{weather.current.surfacePressure}</span>
                  <span className="font-label-sm text-xs text-on-surface-variant ml-1">hPa</span>
                  <div className="font-body-sm text-[0.7rem] text-on-surface-variant">Steady Trend</div>
                </div>
              </div>

              {/* UV Index */}
              <div className="bg-surface-container-lowest/90 backdrop-blur p-space-md rounded-2xl flex flex-col justify-between shadow-xs border border-surface-container-high">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-sm text-[0.7rem] uppercase tracking-wider font-semibold">UV Index</span>
                  <span className="material-symbols-outlined text-[1.125rem] text-tertiary">wb_sunny</span>
                </div>
                <div className="mt-space-sm">
                  <span className="font-data-metric text-xl font-bold text-tertiary">{weather.current.uvIndex}</span>
                  <span className="font-label-sm text-xs text-on-surface-variant ml-1">{weather.current.uvLabel}</span>
                  <div className="font-body-sm text-[0.7rem] text-on-surface-variant">Peak 11:30 - 14:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Doppler Radar & Wind Streamlines Map */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[1.375rem]">radar</span>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
              Live Doppler Weather Radar & Wind Streamline Telemetry
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Real-Time DWR Reflectivity & RainViewer Mesh
          </span>
        </div>
        <InteractiveRadarMap />
      </section>

      {/* 24-Hour Synoptic Hourly Strip */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[1.25rem]">schedule</span>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              {hourlyRange}-Hour Synoptic Timeline & Precipitation Probability
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-full text-xs font-bold">
            <button
              onClick={() => setHourlyRange(12)}
              type="button"
              className={`px-3 py-0.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                hourlyRange === 12
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              12 Hours
            </button>
            <button
              onClick={() => setHourlyRange(24)}
              type="button"
              className={`px-3 py-0.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                hourlyRange === 24
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              24 Hours
            </button>
          </div>
        </div>

        <div className="flex gap-space-sm overflow-x-auto pb-space-xs pt-space-xs" style={{ scrollbarWidth: 'none' }}>
          {weather.hourly.slice(0, hourlyRange).map((h, i) => (
            <div
              key={i}
              className={`min-w-[100px] flex-1 p-space-sm rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                i === 0
                  ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span className="text-xs font-semibold">{h.hour}</span>
              <span className="material-symbols-outlined text-[1.75rem] my-2">
                {h.icon}
              </span>
              <span className="text-base font-bold">{h.temperature}°</span>

              {/* Rain Chance Bar */}
              <div className="w-full mt-2 pt-2 border-t border-outline-variant/30 flex flex-col items-center">
                <span className="text-[0.65rem] opacity-90">{h.precipitationProbability}% Rain</span>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: `${h.precipitationProbability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7-Day Synoptic Outlook Cards */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[1.25rem]">calendar_view_week</span>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              7-Day Synoptic Meteorological Outlook
            </h2>
          </div>
          <span className="font-label-sm text-xs text-outline">Multi-Model Ensemble</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-space-xs">
          {weather.daily.map((d, i) => (
            <div
              key={i}
              className={`p-space-sm rounded-2xl flex flex-col items-center text-center justify-between border ${
                i === 0
                  ? 'bg-surface-container-low border-primary/30 font-bold'
                  : 'bg-surface-container-lowest border-surface-container-high'
              }`}
            >
              <span className="text-xs font-semibold text-on-surface-variant">
                {language === 'hi' ? d.dayNameHi : d.dayNameEn}
              </span>
              <span className="material-symbols-outlined text-[2rem] my-2 text-primary">
                {d.icon}
              </span>
              <span className="text-xs text-on-surface-variant">
                {language === 'hi' ? d.conditionHi : d.conditionEn}
              </span>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="font-bold text-on-surface">{d.tempMax}°</span>
                <span className="text-outline">/</span>
                <span className="text-on-surface-variant">{d.tempMin}°</span>
              </div>
              <span className="text-[0.65rem] text-secondary font-semibold mt-1">
                {d.precipitationProbability}% {language === 'hi' ? 'वर्षा' : 'precip'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Navigation Cards to Explorer Tools */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div
          onClick={() => setActiveExplorerTab('trends')}
          className="cursor-pointer bg-surface-container-lowest hover:bg-surface-container-low p-space-md rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-space-sm transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[1.375rem]">monitoring</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm font-bold text-on-surface">{t.detailedTrends}</span>
            <span className="text-xs text-on-surface-variant line-clamp-1">Multi-decadal trends & soil physics</span>
          </div>
        </div>

        <div
          onClick={() => setActiveExplorerTab('journey')}
          className="cursor-pointer bg-surface-container-lowest hover:bg-surface-container-low p-space-md rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-space-sm transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[1.375rem]">route</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm font-bold text-on-surface">{t.journeyPlanner}</span>
            <span className="text-xs text-on-surface-variant line-clamp-1">Point A to Point B corridor weather</span>
          </div>
        </div>

        <div
          onClick={() => setActiveExplorerTab('work-safety')}
          className="cursor-pointer bg-surface-container-lowest hover:bg-surface-container-low p-space-md rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-space-sm transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[1.375rem]">health_and_safety</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm font-bold text-on-surface">{t.workSafety}</span>
            <span className="text-xs text-on-surface-variant line-clamp-1">WBGT thermal strain & safer labor windows</span>
          </div>
        </div>

        <div
          onClick={() => setActiveExplorerTab('climate-ai')}
          className="cursor-pointer bg-surface-container-lowest hover:bg-surface-container-low p-space-md rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-space-sm transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[1.375rem]">psychology</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm font-bold text-on-surface">{t.climateAI}</span>
            <span className="text-xs text-on-surface-variant line-clamp-1">Agronomic conversational copilot</span>
          </div>
        </div>
      </section>
    </div>
  );
}
