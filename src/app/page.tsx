'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import NetworkBanner from '@/components/NetworkBanner';

// Kisan Mode Screens
import KisanHome from '@/components/kisan/KisanHome';
import KisanLandSetup from '@/components/kisan/KisanLandSetup';
import KisanCropAdvisory from '@/components/kisan/KisanCropAdvisory';
import KisanAlerts from '@/components/kisan/KisanAlerts';
import KisanVoiceAssistant from '@/components/kisan/KisanVoiceAssistant';

// Explorer Mode Screens
import ExplorerWeatherDashboard from '@/components/explorer/ExplorerWeatherDashboard';
import ExplorerClimateAnalytics from '@/components/explorer/ExplorerClimateAnalytics';
import ExplorerAlertsCenter from '@/components/explorer/ExplorerAlertsCenter';
import ExplorerJourneyPlanner from '@/components/explorer/ExplorerJourneyPlanner';
import ExplorerClimateAI from '@/components/explorer/ExplorerClimateAI';

export default function Home() {
  const {
    mode,
    activeKisanTab,
    setActiveKisanTab,
    activeExplorerTab,
    setActiveExplorerTab,
    language,
  } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Universal Fixed Header */}
      <Header />

      {/* Persistent Left Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="md:pl-72 flex flex-col flex-1 pt-20">
        {/* Network Degradation Warning Banner (FR-8.2) */}
        <NetworkBanner />

        <main className="w-full px-space-md sm:px-space-lg py-space-lg pb-28 md:pb-space-2xl">
          {mode === 'kisan' ? (
            <>
              {activeKisanTab === 'home' && <KisanHome />}
              {activeKisanTab === 'land' && <KisanLandSetup />}
              {activeKisanTab === 'crop-advisory' && <KisanCropAdvisory />}
              {activeKisanTab === 'alerts' && <KisanAlerts />}
              {activeKisanTab === 'voice' && <KisanVoiceAssistant />}
            </>
          ) : (
            <>
              {activeExplorerTab === 'current-weather' && <ExplorerWeatherDashboard />}
              {activeExplorerTab === 'trends' && <ExplorerClimateAnalytics />}
              {activeExplorerTab === 'alerts-center' && <ExplorerAlertsCenter />}
              {activeExplorerTab === 'journey' && <ExplorerJourneyPlanner />}
              {activeExplorerTab === 'work-safety' && <ExplorerJourneyPlanner />}
              {activeExplorerTab === 'climate-ai' && <ExplorerClimateAI />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation (Ergonomic thumb-reach per DESIGN.md) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-surface-container-lowest/95 backdrop-blur-lg border-t border-surface-container-high py-2 px-3 z-40 flex items-center justify-around shadow-lg">
        {mode === 'kisan' ? (
          <>
            <button
              onClick={() => setActiveKisanTab('home')}
              className={`flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center ${
                activeKisanTab === 'home' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.5rem]">partly_cloudy_day</span>
              <span className="text-[0.65rem]">{language === 'hi' ? 'मौसम' : 'Weather'}</span>
            </button>

            <button
              onClick={() => setActiveKisanTab('land')}
              className={`flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center ${
                activeKisanTab === 'land' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.5rem]">landscape</span>
              <span className="text-[0.65rem]">{language === 'hi' ? 'ज़मीन' : 'Land'}</span>
            </button>

            <button
              onClick={() => setActiveKisanTab('voice')}
              className="flex flex-col items-center justify-center -mt-5"
              type="button"
            >
              <div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg active:scale-95">
                <span className="material-symbols-outlined text-[2rem]">mic</span>
              </div>
              <span className="text-[0.65rem] font-bold text-primary mt-0.5">{language === 'hi' ? 'बोलें' : 'Voice'}</span>
            </button>

            <button
              onClick={() => setActiveKisanTab('crop-advisory')}
              className={`flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center ${
                activeKisanTab === 'crop-advisory' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.5rem]">potted_plant</span>
              <span className="text-[0.65rem]">{language === 'hi' ? 'फसल' : 'Crops'}</span>
            </button>

            <button
              onClick={() => setActiveKisanTab('alerts')}
              className={`flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center ${
                activeKisanTab === 'alerts' ? 'text-secondary font-bold' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.5rem]">warning</span>
              <span className="text-[0.65rem]">{language === 'hi' ? 'अलर्ट' : 'Alerts'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveExplorerTab('current-weather')}
              className={`flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center ${
                activeExplorerTab === 'current-weather' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.5rem]">thermostat</span>
              <span className="text-[0.65rem]">Weather</span>
            </button>

            <button
              onClick={() => setActiveExplorerTab('trends')}
              className={`flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center ${
                activeExplorerTab === 'trends' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.5rem]">monitoring</span>
              <span className="text-[0.65rem]">Trends</span>
            </button>

            <button
              onClick={() => setActiveExplorerTab('climate-ai')}
              className="flex flex-col items-center justify-center -mt-5"
              type="button"
            >
              <div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg active:scale-95">
                <span className="material-symbols-outlined text-[2rem]">psychology</span>
              </div>
              <span className="text-[0.65rem] font-bold text-primary mt-0.5">AI Copilot</span>
            </button>

            <button
              onClick={() => setActiveExplorerTab('journey')}
              className={`flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center ${
                activeExplorerTab === 'journey' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.5rem]">route</span>
              <span className="text-[0.65rem]">Journey</span>
            </button>

            <button
              onClick={() => setActiveExplorerTab('alerts-center')}
              className={`flex flex-col items-center gap-0.5 min-w-[56px] min-h-[48px] justify-center ${
                activeExplorerTab === 'alerts-center' ? 'text-secondary font-bold' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.5rem]">notifications_active</span>
              <span className="text-[0.65rem]">Alerts</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
