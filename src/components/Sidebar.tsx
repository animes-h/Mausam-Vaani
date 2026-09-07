'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';

export default function Sidebar() {
  const {
    mode,
    setMode,
    language,
    activeKisanTab,
    setActiveKisanTab,
    activeExplorerTab,
    setActiveExplorerTab,
    weather,
  } = useApp();

  const t = translations[language];

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex flex-col justify-between pt-space-md pb-space-lg overflow-y-auto border-r border-surface-container-high hidden md:flex">
      <div className="flex flex-col gap-space-md px-space-md">
        {/* Voice Trigger Fast Box */}
        <div className="bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-space-2xs border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wide">
              {language === 'hi' ? 'आकाश वाणी वाक (Voice)' : 'Voice Assistant'}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {language === 'hi' ? 'बोलकर पूछें: "कल पानी गिरेगा क्या?"' : 'Ask: "Will it rain tomorrow?"'}
          </p>
          <button
            className="mt-space-xs w-full py-space-xs flex items-center justify-center gap-space-xs bg-primary-container text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary transition-colors shadow-xs"
            onClick={() => {
              setMode('kisan');
              setActiveKisanTab('voice');
            }}
            type="button"
          >
            <span className="material-symbols-outlined text-[1.25rem]">mic</span>
            <span>{language === 'hi' ? 'आवाज़ से पूछें' : 'Voice Query'}</span>
          </button>
        </div>

        {/* Kisan Views Navigation Section */}
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between px-space-sm mb-1">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-outline">
              {language === 'hi' ? 'किसान दृष्टिकोण • Kisan Views' : 'Farmer Views'}
            </span>
            {mode === 'kisan' && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            )}
          </div>
          <nav className="flex flex-col gap-1">
            <button
              className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all text-left w-full ${
                mode === 'kisan' && activeKisanTab === 'home'
                  ? 'bg-primary-container text-on-primary font-bold shadow-[0_2px_6px_rgba(45,106,79,0.12)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('kisan');
                setActiveKisanTab('home');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">partly_cloudy_day</span>
              <span className="font-label-md text-label-md">
                {language === 'hi' ? 'आज का मौसम (Home)' : "Today's Weather"}
              </span>
            </button>

            <button
              className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all text-left w-full ${
                mode === 'kisan' && activeKisanTab === 'land'
                  ? 'bg-primary-container text-on-primary font-bold shadow-[0_2px_6px_rgba(45,106,79,0.12)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('kisan');
                setActiveKisanTab('land');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">landscape</span>
              <span className="font-label-md text-label-md">
                {language === 'hi' ? 'मेरी ज़मीन (My Land)' : 'My Land Setup'}
              </span>
            </button>

            <button
              className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all text-left w-full ${
                mode === 'kisan' && activeKisanTab === 'crop-advisory'
                  ? 'bg-primary-container text-on-primary font-bold shadow-[0_2px_6px_rgba(45,106,79,0.12)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('kisan');
                setActiveKisanTab('crop-advisory');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">potted_plant</span>
              <span className="font-label-md text-label-md">
                {language === 'hi' ? 'फसल सलाह (Crop Advisory)' : 'Crop Advisory'}
              </span>
            </button>

            <button
              className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all text-left w-full ${
                mode === 'kisan' && activeKisanTab === 'alerts'
                  ? 'bg-primary-container text-on-primary font-bold shadow-[0_2px_6px_rgba(45,106,79,0.12)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('kisan');
                setActiveKisanTab('alerts');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">warning</span>
              <span className="font-label-md text-label-md">
                {language === 'hi' ? 'मौसम चेतावनी (Alerts)' : 'Weather Alerts'}
              </span>
            </button>

            <button
              className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-all text-left w-full ${
                mode === 'kisan' && activeKisanTab === 'voice'
                  ? 'bg-primary-container text-on-primary font-bold shadow-[0_2px_6px_rgba(45,106,79,0.12)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('kisan');
                setActiveKisanTab('voice');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">record_voice_over</span>
              <span className="font-label-md text-label-md">
                {language === 'hi' ? 'आवाज़ सहायक (Voice)' : 'Voice Assistant'}
              </span>
            </button>
          </nav>
        </div>

        {/* Explorer Suite Navigation Section */}
        <div className="flex flex-col gap-space-2xs mt-space-xs">
          <div className="flex items-center justify-between px-space-sm mb-1">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-outline">
              {language === 'hi' ? 'विश्लेषक • Explorer Suite' : 'Explorer Suite'}
            </span>
            {mode === 'explorer' && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            )}
          </div>
          <nav className="flex flex-col gap-1">
            <button
              className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-all text-left w-full ${
                mode === 'explorer' && activeExplorerTab === 'current-weather'
                  ? 'bg-surface-container-high text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('explorer');
                setActiveExplorerTab('current-weather');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">thermostat</span>
              <span className="font-body-sm text-body-sm">{t.currentWeather}</span>
            </button>

            <button
              className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-all text-left w-full ${
                mode === 'explorer' && activeExplorerTab === 'trends'
                  ? 'bg-surface-container-high text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('explorer');
                setActiveExplorerTab('trends');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">monitoring</span>
              <span className="font-body-sm text-body-sm">{t.detailedTrends}</span>
            </button>

            <button
              className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-all text-left w-full ${
                mode === 'explorer' && activeExplorerTab === 'alerts-center'
                  ? 'bg-surface-container-high text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('explorer');
                setActiveExplorerTab('alerts-center');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">notifications_active</span>
              <span className="font-body-sm text-body-sm">{t.alertsCenter}</span>
            </button>

            <button
              className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-all text-left w-full ${
                mode === 'explorer' && activeExplorerTab === 'journey'
                  ? 'bg-surface-container-high text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('explorer');
                setActiveExplorerTab('journey');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">route</span>
              <span className="font-body-sm text-body-sm">{t.journeyPlanner}</span>
            </button>

            <button
              className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-all text-left w-full ${
                mode === 'explorer' && activeExplorerTab === 'work-safety'
                  ? 'bg-surface-container-high text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('explorer');
                setActiveExplorerTab('work-safety');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">health_and_safety</span>
              <span className="font-body-sm text-body-sm">{t.workSafety}</span>
            </button>

            <button
              className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-all text-left w-full ${
                mode === 'explorer' && activeExplorerTab === 'climate-ai'
                  ? 'bg-surface-container-high text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              onClick={() => {
                setMode('explorer');
                setActiveExplorerTab('climate-ai');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">psychology</span>
              <span className="font-body-sm text-body-sm">{t.climateAI}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Consensus Engine Status Pill */}
      <div className="px-space-md mt-space-md">
        <div className="bg-surface-container-low rounded-xl p-space-sm flex items-start gap-space-xs border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[1.125rem] mt-0.5">verified_user</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">
              {t.consensusEngine}
            </span>
            <span className="font-body-sm text-[0.72rem] text-on-surface-variant leading-tight">
              {weather.consensus.confidenceScore}% • IMD & ECMWF Verified
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
