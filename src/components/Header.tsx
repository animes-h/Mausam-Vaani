'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import MobileNavDrawer from './MobileNavDrawer';

const PRESET_LOCATIONS = [
  { name: 'Lucknow, Uttar Pradesh', nameHi: 'लखनऊ, उत्तर प्रदेश', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, elevation: 123 },
  { name: 'Vrindavan Yojna, Lucknow', nameHi: 'वृंदावन योजना, लखनऊ', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.7676, lng: 80.9462, elevation: 120 },
  { name: 'New Delhi', nameHi: 'नई दिल्ली', district: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, elevation: 216 },
  { name: 'Kanpur, Uttar Pradesh', nameHi: 'कानपुर, उत्तर प्रदेश', district: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, elevation: 126 },
  { name: 'Varanasi, Uttar Pradesh', nameHi: 'वाराणसी, उत्तर प्रदेश', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, elevation: 81 },
  { name: 'Agra, Uttar Pradesh', nameHi: 'आगरा, उत्तर प्रदेश', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, elevation: 171 },
  { name: 'Indore, Madhya Pradesh', nameHi: 'इंदौर, मध्य प्रदेश', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, elevation: 553 },
  { name: 'Bhopal, Madhya Pradesh', nameHi: 'भोपाल, मध्य प्रदेश', district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, elevation: 527 },
  { name: 'Ujjain, Madhya Pradesh', nameHi: 'उज्जैन, मध्य प्रदेश', district: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885, elevation: 494 },
  { name: 'Dewas, Madhya Pradesh', nameHi: 'देवास, मध्य प्रदेश', district: 'Dewas', state: 'Madhya Pradesh', lat: 22.9676, lng: 76.0534, elevation: 535 },
  { name: 'Jaipur, Rajasthan', nameHi: 'जयपुर, राजस्थान', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, elevation: 431 },
  { name: 'Patna, Bihar', nameHi: 'पटना, बिहार', district: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, elevation: 53 },
  { name: 'Pune, Maharashtra', nameHi: 'पुणे, महाराष्ट्र', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, elevation: 560 },
];

export default function Header() {
  const {
    mode,
    setMode,
    language,
    toggleLanguage,
    location,
    setLocation,
    networkMode,
    toggleNetworkMode,
    alerts,
    setActiveKisanTab,
    setActiveExplorerTab,
  } = useApp();

  const t = translations[language];
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            setLocation({
              name: data.name || `Location (${lat}, ${lng})`,
              nameHi: data.nameHi || data.name || `स्थान (${lat}, ${lng})`,
              district: data.district || data.city || 'Local District',
              state: data.state || 'India',
              lat: data.lat || lat,
              lng: data.lng || lng,
              elevation: data.elevation || 120,
            });
            setIsLocating(false);
            setShowLocationModal(false);
            return;
          }
        } catch (e) {
          console.warn('Reverse geocoding error:', e);
        }

        // Resilient fallback
        setLocation({
          name: 'Current GPS Location',
          nameHi: 'वर्तमान GPS स्थान',
          district: 'Local Region',
          state: 'India',
          lat,
          lng,
          elevation: 150,
        });
        setIsLocating(false);
        setShowLocationModal(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setIsLocating(false);
        alert('Could not access GPS location. Please choose a city below.');
      }
    );
  };

  const filteredLocations = PRESET_LOCATIONS.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nameHi.includes(searchQuery)
  );

  return (
    <>
      <header className="fixed top-0 inset-x-0 h-20 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 transition-colors">
        <div className="w-full h-full px-2 sm:px-4 md:px-space-lg flex items-center justify-between gap-1.5 sm:gap-space-md">
          {/* Left: Mobile Hamburger & Logo */}
          <div className="flex items-center gap-1 sm:gap-space-sm min-w-0">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-xl text-primary hover:bg-surface-container-high transition-colors -ml-1 cursor-pointer"
              type="button"
              aria-label="Open navigation menu"
              title="Open menu"
            >
              <span className="material-symbols-outlined text-[1.6rem]">menu</span>
            </button>

            {/* Logo & Brand Identity */}
            <div
              className="flex items-center gap-1.5 sm:gap-space-sm cursor-pointer min-w-0"
              onClick={() => {
                if (mode === 'kisan') setActiveKisanTab('home');
                else setActiveExplorerTab('current-weather');
              }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[1.35rem] sm:text-[1.5rem]">cloud_sync</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-space-xs">
                  <span className="font-headline-sm text-sm sm:text-headline-sm text-primary tracking-tight font-bold truncate">
                    {language === 'hi' ? 'मौसम वाणी' : 'Mausam Vaani'}
                  </span>
                  <span className="font-label-sm text-[0.65rem] sm:text-label-sm text-outline uppercase tracking-wider font-semibold hidden md:inline">
                    {language === 'hi' ? 'Mausam Vaani' : 'मौसम वाणी'}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant hidden lg:inline">
                  {t.tagline}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Universal Mode Switcher (Kisan Mode vs Explorer Mode) */}
          <div className="flex items-center bg-surface-container-high p-0.5 sm:p-1 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.03)] shrink-0">
            <button
              className={`flex items-center gap-1 sm:gap-space-xs px-2 sm:px-space-md py-1 sm:py-space-xs rounded-full transition-all cursor-pointer active:scale-95 text-[0.7rem] sm:text-sm ${
                mode === 'kisan'
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-[0_2px_6px_rgba(45,106,79,0.12)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setMode('kisan')}
              type="button"
            >
              <span className="material-symbols-outlined text-[1rem] sm:text-[1.125rem]">agriculture</span>
              <span className="font-label-md font-bold">
                <span className="inline sm:hidden">किसान</span>
                <span className="hidden sm:inline">किसान मोड (Kisan)</span>
              </span>
            </button>
            <button
              className={`flex items-center gap-1 sm:gap-space-xs px-2 sm:px-space-md py-1 sm:py-space-xs rounded-full transition-all cursor-pointer active:scale-95 text-[0.7rem] sm:text-sm ${
                mode === 'explorer'
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-[0_2px_6px_rgba(45,106,79,0.12)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setMode('explorer')}
              type="button"
            >
              <span className="material-symbols-outlined text-[1rem] sm:text-[1.125rem]">insights</span>
              <span className="font-label-md font-bold">
                <span className="inline sm:hidden">Explorer</span>
                <span className="hidden sm:inline">Explorer Mode</span>
              </span>
            </button>
          </div>

          {/* Right: Location Badge, Language, Network Toggle & Alerts */}
          <div className="flex items-center gap-1 sm:gap-space-sm md:gap-space-md shrink-0">
            {/* Location Selector Pill - Now VISIBLE ON ALL SCREENS INCLUDING MOBILE */}
            <button
              className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container px-2 sm:px-space-sm py-1 sm:py-space-xs rounded-full text-on-surface transition-all cursor-pointer active:scale-95"
              onClick={() => setShowLocationModal(true)}
              type="button"
              title="Click to change location"
            >
              <span className="material-symbols-outlined text-primary text-[1.1rem] sm:text-[1.25rem]">location_on</span>
              <span className="font-label-sm text-[0.7rem] sm:text-label-sm font-semibold max-w-[80px] sm:max-w-[150px] truncate">
                {language === 'hi' ? location.nameHi || location.name : location.name}
              </span>
              <span className="text-outline text-label-sm hidden md:inline">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant hidden md:inline truncate max-w-[110px]">
                {location.district || location.state || 'India'}
              </span>
            </button>

            {/* Network Degradation Indicator / Tester (FR-8) */}
            <button
              onClick={toggleNetworkMode}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[0.75rem] font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                networkMode === 'degraded'
                  ? 'bg-secondary text-on-secondary animate-pulse'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              title="Toggle to simulate 2G / EDGE low-bandwidth conditions"
              type="button"
            >
              <span className="material-symbols-outlined text-[1rem]">
                {networkMode === 'degraded' ? 'signal_cellular_alt_1_bar' : 'network_check'}
              </span>
              <span className="hidden lg:inline">
                {networkMode === 'degraded' ? '2G Mode' : '4G/5G Live'}
              </span>
            </button>

            {/* Language Switcher (EN | हिन्दी) */}
            <div className="flex items-center bg-surface-container p-0.5 rounded-full">
              <button
                className={`px-1.5 sm:px-space-xs py-0.5 sm:py-space-2xs rounded-full font-label-sm text-[0.65rem] sm:text-label-sm transition-all cursor-pointer active:scale-95 ${
                  language === 'en'
                    ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => toggleLanguage()}
                type="button"
              >
                EN
              </button>
              <span className="text-outline text-[0.65rem] sm:text-xs mx-0.5">|</span>
              <button
                className={`px-1.5 sm:px-space-xs py-0.5 sm:py-space-2xs rounded-full font-label-sm text-[0.65rem] sm:text-label-sm transition-all cursor-pointer active:scale-95 ${
                  language === 'hi'
                    ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => toggleLanguage()}
                type="button"
              >
                हिन्दी
              </button>
            </div>

            {/* Alerts Notification Button */}
            <button
              className="relative flex items-center justify-center p-1.5 sm:p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all cursor-pointer active:scale-95"
              onClick={() => {
                if (mode === 'kisan') setActiveKisanTab('alerts');
                else setActiveExplorerTab('alerts-center');
              }}
              type="button"
              aria-label="View Active Alerts"
            >
              <span className="material-symbols-outlined text-[1.25rem] sm:text-[1.5rem]">notifications</span>
              {alerts.length > 0 && (
                <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-secondary animate-ping"></span>
              )}
            </button>

            {/* Ramesh Patel Profile */}
            <div
              className="hidden sm:flex items-center gap-1.5 pl-1 cursor-pointer"
              onClick={() => {
                if (mode === 'kisan') setActiveKisanTab('land');
              }}
              title="Farmer Ramesh Patel (Hatod, MP)"
            >
              <img
                alt="Farmer Ramesh Patel"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-fixed"
                src="/images/farmer-ramesh.png"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="material-symbols-outlined text-primary text-[1rem] hidden xl:inline">
                verified
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-space-lg w-full max-w-md border border-outline-variant">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[1.5rem]">location_on</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {language === 'hi' ? 'स्थान चुनें' : 'Choose Location'}
                </h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-outline hover:text-on-surface p-1 rounded-full"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-space-sm mb-space-md">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full py-space-sm px-space-md bg-primary-fixed text-on-primary-fixed font-bold rounded-xl flex items-center justify-center gap-space-xs hover:bg-primary-fixed-dim transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[1.25rem]">my_location</span>
                <span>
                  {isLocating
                    ? language === 'hi'
                      ? 'स्थान खोजा जा रहा है...'
                      : 'Detecting Location...'
                    : language === 'hi'
                    ? 'मेरा वर्तमान GPS स्थान उपयोग करें'
                    : 'Use My Current GPS Location'}
                </span>
              </button>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[1.25rem]">search</span>
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'शहर या जिला खोजें...' : 'Search city or district...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-outline tracking-wider px-2 mb-1">
                {language === 'hi' ? 'प्रमुख कृषि क्षेत्र' : 'Key Agro-Climatic Regions'}
              </span>
              {filteredLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    setLocation(loc);
                    setShowLocationModal(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                    location.name === loc.name
                      ? 'bg-primary text-on-primary font-bold'
                      : 'hover:bg-surface-container-low text-on-surface'
                  }`}
                  type="button"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {language === 'hi' ? loc.nameHi : loc.name}
                    </span>
                    <span className={`text-xs ${location.name === loc.name ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                      {loc.state} • {loc.elevation}m MSL
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                    {loc.district}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onOpenLocationModal={() => setShowLocationModal(true)}
      />
    </>
  );
}
