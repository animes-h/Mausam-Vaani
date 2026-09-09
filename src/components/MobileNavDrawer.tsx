'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLocationModal: () => void;
}

export default function MobileNavDrawer({
  isOpen,
  onClose,
  onOpenLocationModal,
}: MobileNavDrawerProps) {
  const {
    mode,
    setMode,
    language,
    toggleLanguage,
    location,
    networkMode,
    toggleNetworkMode,
    activeKisanTab,
    setActiveKisanTab,
    activeExplorerTab,
    setActiveExplorerTab,
    weather,
    alerts,
  } = useApp();

  const t = translations[language];

  if (!isOpen) return null;

  const navigateKisan = (tab: typeof activeKisanTab) => {
    setMode('kisan');
    setActiveKisanTab(tab);
    onClose();
  };

  const navigateExplorer = (tab: typeof activeExplorerTab) => {
    setMode('explorer');
    setActiveExplorerTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-[85%] max-w-sm bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-r border-surface-container-high">
        {/* Drawer Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs">
              <span className="material-symbols-outlined text-[1.35rem]">cloud_sync</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-primary leading-tight">
                {language === 'hi' ? 'मौसम वाणी' : 'Mausam Vaani'}
              </span>
              <span className="text-[0.65rem] text-outline uppercase font-semibold">
                {mode === 'kisan'
                  ? language === 'hi' ? 'किसान दृष्टिकोण' : 'Kisan Edition'
                  : language === 'hi' ? 'वैज्ञानिक विश्लेषक' : 'Explorer Suite'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
            type="button"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-[1.25rem]">close</span>
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active Location Card & Quick Switcher */}
          <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-outline">
                {language === 'hi' ? 'सक्रिय स्थान' : 'Active Location'}
              </span>
              <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {location.lat}° N, {location.lng}° E
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-primary text-[1.25rem] shrink-0">location_on</span>
                <span className="text-xs font-bold text-on-surface truncate">
                  {language === 'hi' ? location.nameHi || location.name : location.name}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenLocationModal();
                }}
                className="px-2.5 py-1 bg-primary text-on-primary rounded-lg text-[0.7rem] font-bold shrink-0 shadow-xs hover:bg-primary-container"
                type="button"
              >
                {language === 'hi' ? 'बदलें' : 'Change'}
              </button>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-surface-container p-1 rounded-xl">
            <button
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                mode === 'kisan'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setMode('kisan')}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.1rem]">agriculture</span>
              <span>{language === 'hi' ? 'किसान मोड' : 'Kisan'}</span>
            </button>
            <button
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                mode === 'explorer'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setMode('explorer')}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.1rem]">insights</span>
              <span>{language === 'hi' ? 'एक्सप्लोरर' : 'Explorer'}</span>
            </button>
          </div>

          {/* Fast Voice Query Box */}
          <div className="bg-primary-fixed/30 border border-primary/20 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>{language === 'hi' ? 'मौसम वाणी वाक (Voice)' : 'Voice Assistant'}</span>
              </span>
              <span className="text-[0.65rem] text-primary font-bold">24x7 AI Live</span>
            </div>
            <p className="text-xs text-on-surface-variant">
              {language === 'hi' ? 'बोलकर पूछें: "कल बारिश होगी क्या?"' : 'Ask: "Will it rain tomorrow?"'}
            </p>
            <button
              onClick={() => navigateKisan('voice')}
              className="w-full py-2 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.15rem]">mic</span>
              <span>{language === 'hi' ? 'आवाज़ से पूछें' : 'Voice Query'}</span>
            </button>
          </div>

          {/* Navigation Links for Active Mode */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-outline">
                {mode === 'kisan'
                  ? language === 'hi' ? 'किसान नेविगेशन' : 'Farmer Views'
                  : language === 'hi' ? 'एक्सप्लोरर सुइट' : 'Explorer Suite'}
              </span>
            </div>

            {mode === 'kisan' ? (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => navigateKisan('home')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeKisanTab === 'home'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">partly_cloudy_day</span>
                  <span>{language === 'hi' ? 'आज का मौसम (Home)' : "Today's Weather"}</span>
                </button>

                <button
                  onClick={() => navigateKisan('land')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeKisanTab === 'land'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">landscape</span>
                  <span>{language === 'hi' ? 'मेरी ज़मीन (Land Setup)' : 'My Land Setup'}</span>
                </button>

                <button
                  onClick={() => navigateKisan('crop-advisory')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeKisanTab === 'crop-advisory'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">potted_plant</span>
                  <span>{language === 'hi' ? 'फसल सलाह (Crop Advisory)' : 'Crop Advisory'}</span>
                </button>

                <button
                  onClick={() => navigateKisan('alerts')}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeKisanTab === 'alerts'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[1.25rem]">warning</span>
                    <span>{language === 'hi' ? 'मौसम चेतावनी (Alerts)' : 'Weather Alerts'}</span>
                  </div>
                  {alerts.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[0.65rem] font-bold">
                      {alerts.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigateKisan('voice')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeKisanTab === 'voice'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">record_voice_over</span>
                  <span>{language === 'hi' ? 'आवाज़ सहायक (Voice)' : 'Voice Assistant'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => navigateExplorer('current-weather')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeExplorerTab === 'current-weather'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">thermostat</span>
                  <span>{t.currentWeather}</span>
                </button>

                <button
                  onClick={() => navigateExplorer('trends')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeExplorerTab === 'trends'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">monitoring</span>
                  <span>{t.detailedTrends}</span>
                </button>

                <button
                  onClick={() => navigateExplorer('alerts-center')}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeExplorerTab === 'alerts-center'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[1.25rem]">notifications_active</span>
                    <span>{t.alertsCenter}</span>
                  </div>
                  {alerts.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[0.65rem] font-bold">
                      {alerts.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigateExplorer('journey')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeExplorerTab === 'journey'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">route</span>
                  <span>{t.journeyPlanner}</span>
                </button>

                {/* Work Safety - Now completely accessible on mobile! */}
                <button
                  onClick={() => navigateExplorer('work-safety')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeExplorerTab === 'work-safety'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">health_and_safety</span>
                  <span>{t.workSafety}</span>
                </button>

                <button
                  onClick={() => navigateExplorer('climate-ai')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full text-xs font-semibold transition-all cursor-pointer ${
                    activeExplorerTab === 'climate-ai'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">psychology</span>
                  <span>{t.climateAI}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Settings: Language & Network Mode */}
          <div className="pt-2 border-t border-surface-container-high space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface">
                {language === 'hi' ? 'भाषा (Language)' : 'Language'}
              </span>
              <div className="flex items-center bg-surface-container p-0.5 rounded-lg text-xs">
                <button
                  onClick={toggleLanguage}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    language === 'en' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant'
                  }`}
                  type="button"
                >
                  English
                </button>
                <button
                  onClick={toggleLanguage}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    language === 'hi' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant'
                  }`}
                  type="button"
                >
                  हिन्दी
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface">
                {language === 'hi' ? 'नेटवर्क मोड (Network)' : 'Network Mode'}
              </span>
              <button
                onClick={toggleNetworkMode}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                  networkMode === 'degraded'
                    ? 'bg-secondary text-on-secondary animate-pulse'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[1rem]">
                  {networkMode === 'degraded' ? 'signal_cellular_alt_1_bar' : 'network_check'}
                </span>
                <span>{networkMode === 'degraded' ? '2G Mode' : '4G/5G Live'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer: Consensus Engine Badge */}
        <div className="p-4 border-t border-surface-container-high bg-surface-container-low/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[1.25rem]">verified_user</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">
                {t.consensusEngine}
              </span>
              <span className="text-[0.65rem] text-on-surface-variant">
                {weather.consensus.confidenceScore}% Consensus • IMD & ECMWF
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
