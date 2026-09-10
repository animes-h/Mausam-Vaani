'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppMode, ConsensusInfo, CropRecommendation, GovernmentAlert, Language, LocationInfo, NetworkMode, SoilConfig, WeatherCurrent, WeatherDaily, WeatherHourly } from '@/types';
import { DEFAULT_LOCATION, fetchWeatherData, getFallbackWeatherData } from '@/lib/weatherService';
import { ACTIVE_GOVERNMENT_ALERTS, getAlertsForLocation } from '@/lib/alertService';
import { getCropRecommendations, STANDARD_SOIL_TYPES } from '@/lib/cropAdvisorService';
import { SpeechHandler } from '@/lib/speechService';

export type KisanTab = 'home' | 'land' | 'crop-advisory' | 'alerts' | 'voice';
export type ExplorerTab = 'current-weather' | 'trends' | 'alerts-center' | 'journey' | 'work-safety' | 'climate-ai';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  activeKisanTab: KisanTab;
  setActiveKisanTab: (tab: KisanTab) => void;
  activeExplorerTab: ExplorerTab;
  setActiveExplorerTab: (tab: ExplorerTab) => void;
  location: LocationInfo;
  setLocation: (loc: LocationInfo) => void;
  networkMode: NetworkMode;
  setNetworkMode: (mode: NetworkMode) => void;
  toggleNetworkMode: () => void;
  soilConfig: SoilConfig;
  setSoilConfig: React.Dispatch<React.SetStateAction<SoilConfig>>;
  weather: {
    current: WeatherCurrent;
    hourly: WeatherHourly[];
    daily: WeatherDaily[];
    consensus: ConsensusInfo;
  };
  alerts: GovernmentAlert[];
  cropRecommendations: CropRecommendation[];
  refreshWeather: () => Promise<void>;
  isLoadingWeather: boolean;
  isPlayingAudio: boolean;
  playSpeech: (text: string, lang?: 'hi-IN' | 'en-IN', rate?: number) => void;
  stopSpeech: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>('kisan');
  const [language, setLanguage] = useState<Language>('hi');
  const [activeKisanTab, setActiveKisanTab] = useState<KisanTab>('home');
  const [activeExplorerTab, setActiveExplorerTab] = useState<ExplorerTab>('current-weather');
  const [location, setLocation] = useState<LocationInfo>(DEFAULT_LOCATION);
  const [networkMode, setNetworkMode] = useState<NetworkMode>('normal');
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const [soilConfig, setSoilConfig] = useState<SoilConfig>({
    soilType: 'black',
    soilNameEn: STANDARD_SOIL_TYPES[0].nameEn,
    soilNameHi: STANDARD_SOIL_TYPES[0].nameHi,
    soilClass: STANDARD_SOIL_TYPES[0].classType,
    moistureCapacity: STANDARD_SOIL_TYPES[0].moistureCapacity,
    moisturePercentage: STANDARD_SOIL_TYPES[0].moisturePercentage,
    organicContent: STANDARD_SOIL_TYPES[0].organicContent,
    phValue: STANDARD_SOIL_TYPES[0].ph,
    drainageRate: STANDARD_SOIL_TYPES[0].drainageRate,
    waterSource: 'tubewell',
    landArea: 5,
    landUnit: 'acres',
  });

  const [weather, setWeather] = useState(getFallbackWeatherData());
  const [alerts, setAlerts] = useState<GovernmentAlert[]>(() => getAlertsForLocation(DEFAULT_LOCATION));
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);

  // Detect Network Speed (FR-8.1 Network detection)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
        setNetworkMode('degraded');
      }
    }
  }, []);

  // Fetch Weather Data
  const refreshWeather = async () => {
    setIsLoadingWeather(true);
    try {
      const res = await fetchWeatherData(location.lat, location.lng);
      setWeather(res);
    } catch (e) {
      console.warn('Weather fetch error:', e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    refreshWeather();
  }, [location.lat, location.lng]);

  // Update Alerts dynamically when location changes
  useEffect(() => {
    setAlerts(getAlertsForLocation(location));
  }, [location.name, location.district, location.state]);

  // Update Crop Recommendations when soilConfig changes
  useEffect(() => {
    getCropRecommendations(soilConfig, location.name).then(recs => {
      setCropRecommendations(recs);
    });
  }, [soilConfig, location.name]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  const toggleNetworkMode = () => {
    setNetworkMode(prev => (prev === 'normal' ? 'degraded' : 'normal'));
    if (networkMode === 'normal') {
      SpeechHandler.stopSpeaking();
      setIsPlayingAudio(false);
    }
  };

  const playSpeech = (text: string, lang?: 'hi-IN' | 'en-IN', rate?: number) => {
    // If under degraded mode, speech is paused per FR-8.2
    if (networkMode === 'degraded') return;

    SpeechHandler.prewarmAudio();

    // Detect actual script from text:
    // If text contains Devanagari characters, it is 100% Hindi and MUST be spoken in Hindi ('hi-IN')
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const speechLang = hasDevanagari ? 'hi-IN' : (lang || 'en-IN');

    SpeechHandler.speak(
      text,
      speechLang,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      rate
    );
  };

  const stopSpeech = () => {
    SpeechHandler.stopSpeaking();
    setIsPlayingAudio(false);
  };

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        language,
        setLanguage,
        toggleLanguage,
        activeKisanTab,
        setActiveKisanTab,
        activeExplorerTab,
        setActiveExplorerTab,
        location,
        setLocation,
        networkMode,
        setNetworkMode,
        toggleNetworkMode,
        soilConfig,
        setSoilConfig,
        weather,
        alerts,
        cropRecommendations,
        refreshWeather,
        isLoadingWeather,
        isPlayingAudio,
        playSpeech,
        stopSpeech,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
