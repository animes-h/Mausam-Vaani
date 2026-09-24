'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
  const [mode, setModeState] = useState<AppMode>('kisan');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncModeFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'kisan' || urlMode === 'explorer') {
        setModeState(urlMode);
      }
    };

    syncModeFromUrl();
    window.addEventListener('popstate', syncModeFromUrl);
    return () => window.removeEventListener('popstate', syncModeFromUrl);
  }, []);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('mode') !== newMode) {
        url.searchParams.set('mode', newMode);
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  };

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
  const [alerts, setAlerts] = useState<GovernmentAlert[]>(() => getAlertsForLocation(DEFAULT_LOCATION, weather.current));
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);

  const hasHydrated = useRef(false);

  // Hydrate settings from localStorage on client mount (safe against SSR hydration mismatch)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedLang = localStorage.getItem('mausam_language');
      if (savedLang === 'hi' || savedLang === 'en') {
        setLanguage(savedLang);
      }

      const savedLoc = localStorage.getItem('mausam_location');
      if (savedLoc) {
        const parsedLoc = JSON.parse(savedLoc);
        if (parsedLoc && typeof parsedLoc.lat === 'number' && typeof parsedLoc.lng === 'number' && parsedLoc.name) {
          setLocation(parsedLoc);
        }
      }

      const savedNetwork = localStorage.getItem('mausam_network_mode');
      if (savedNetwork === 'normal' || savedNetwork === 'degraded') {
        setNetworkMode(savedNetwork);
      }

      const savedSoil = localStorage.getItem('mausam_soil_config');
      if (savedSoil) {
        const parsedSoil = JSON.parse(savedSoil);
        if (parsedSoil && parsedSoil.soilType) {
          setSoilConfig(parsedSoil);
        }
      }
    } catch (err) {
      console.warn('Failed to rehydrate settings from localStorage:', err);
    } finally {
      hasHydrated.current = true;
    }
  }, []);

  // Persist language to localStorage
  useEffect(() => {
    if (!hasHydrated.current || typeof window === 'undefined') return;
    try {
      localStorage.setItem('mausam_language', language);
    } catch (e) {
      console.warn('Failed to persist language:', e);
    }
  }, [language]);

  // Persist location to localStorage
  useEffect(() => {
    if (!hasHydrated.current || typeof window === 'undefined') return;
    try {
      localStorage.setItem('mausam_location', JSON.stringify(location));
    } catch (e) {
      console.warn('Failed to persist location:', e);
    }
  }, [location]);

  // Persist network mode to localStorage
  useEffect(() => {
    if (!hasHydrated.current || typeof window === 'undefined') return;
    try {
      localStorage.setItem('mausam_network_mode', networkMode);
    } catch (e) {
      console.warn('Failed to persist networkMode:', e);
    }
  }, [networkMode]);

  // Persist soilConfig to localStorage
  useEffect(() => {
    if (!hasHydrated.current || typeof window === 'undefined') return;
    try {
      localStorage.setItem('mausam_soil_config', JSON.stringify(soilConfig));
    } catch (e) {
      console.warn('Failed to persist soilConfig:', e);
    }
  }, [soilConfig]);

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

  // Update Alerts dynamically when location or weather telemetry changes
  useEffect(() => {
    setAlerts(getAlertsForLocation(location, weather?.current));
  }, [
    location.name,
    location.district,
    location.state,
    weather?.current?.temperature,
    weather?.current?.relativeHumidity,
    weather?.current?.weatherCode,
    weather?.current?.windSpeed,
    weather?.current?.precipitation,
  ]);

  // Update Crop Recommendations when soilConfig changes
  useEffect(() => {
    getCropRecommendations(soilConfig, location.name).then(recs => {
      setCropRecommendations(recs);
    });
  }, [soilConfig, location.name]);

  const stopSpeech = () => {
    SpeechHandler.stopSpeaking();
    setIsPlayingAudio(false);
  };

  const handleSetLanguage = (lang: Language) => {
    stopSpeech();
    setLanguage(lang);
  };

  const toggleLanguage = () => {
    stopSpeech();
    setLanguage(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  // Stop ongoing speech immediately whenever language is switched
  useEffect(() => {
    stopSpeech();
  }, [language]);

  // Stop ongoing speech when switching tabs or modes
  useEffect(() => {
    stopSpeech();
  }, [activeKisanTab, activeExplorerTab, mode]);

  const toggleNetworkMode = () => {
    setNetworkMode(prev => (prev === 'normal' ? 'degraded' : 'normal'));
    if (networkMode === 'normal') {
      stopSpeech();
    }
  };

  const playSpeech = (text: string, lang?: 'hi-IN' | 'en-IN', rate?: number) => {
    // If under degraded mode, speech is paused per FR-8.2
    if (networkMode === 'degraded') return;

    // Immediately stop any prior speech before beginning new utterance
    stopSpeech();

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

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        language,
        setLanguage: handleSetLanguage,
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
