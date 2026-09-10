'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { WorkSafetyHour } from '@/types';

type WorkTaskType = 'field-labor' | 'spraying' | 'machinery' | 'harvesting';
type WorkSafetyView = 'windows' | 'tasks' | 'emergency';

export default function ExplorerWorkSafety() {
  const { language, weather, location } = useApp();
  const t = translations[language];

  // Active top view tab: Field Work Windows (FR-7.2), Tasks, or Emergency
  const [activeView, setActiveView] = useState<WorkSafetyView>('windows');
  const [selectedTask, setSelectedTask] = useState<WorkTaskType>('field-labor');
  const [selectedSlot, setSelectedSlot] = useState<WorkSafetyHour | null>(null);
  const [activeShiftFilter, setActiveShiftFilter] = useState<'all' | 'safe' | 'caution' | 'hazardous'>('all');

  // Dynamic Biomechanical and Atmospheric Telemetry
  const currentTemp = weather?.current?.temperature ?? 28;
  const currentHumidity = weather?.current?.relativeHumidity ?? 65;

  const currentWBGT = useMemo(() => {
    const e = (currentHumidity / 100) * 6.105 * Math.exp((17.27 * currentTemp) / (237.7 + currentTemp));
    return Number((0.567 * currentTemp + 0.393 * e + 3.94).toFixed(1));
  }, [currentTemp, currentHumidity]);

  const workRestRatio = useMemo(() => {
    if (currentWBGT >= 31.5) return { ratio: '20m / 40m', labelEn: '40m Shaded Break', labelHi: '40 मिनट विश्राम' };
    if (currentWBGT >= 28.5) return { ratio: '30m / 30m', labelEn: '30m Shaded Break', labelHi: '30 मिनट विश्राम' };
    if (currentWBGT >= 26.0) return { ratio: '45m / 15m', labelEn: '15m Shaded Break', labelHi: '15 मिनट विश्राम' };
    return { ratio: '50m / 10m', labelEn: '10m Break', labelHi: '10 मिनट विश्राम' };
  }, [currentWBGT]);

  const hydrationRate = useMemo(() => {
    if (currentTemp >= 36 || currentWBGT >= 31) return '1.2 L / hr';
    if (currentTemp >= 30 || currentWBGT >= 27) return '1.0 L / hr';
    return '0.75 L / hr';
  }, [currentTemp, currentWBGT]);

  const lightningRiskWindow = useMemo(() => {
    if (!weather?.hourly || weather.hourly.length === 0) {
      return {
        window: '14:00 – 17:00',
        hasRisk: true,
      };
    }
    const riskySlots = weather.hourly.filter(
      h => h.precipitationProbability >= 45 || [95, 96, 99].includes(h.weatherCode)
    );
    if (riskySlots.length === 0) {
      return {
        window: language === 'hi' ? 'कोई खतरा नहीं' : 'None Detected',
        hasRisk: false,
      };
    }
    const startH = riskySlots[0].hour;
    const endH = riskySlots[Math.min(riskySlots.length - 1, 3)].hour;
    return {
      window: `${startH} – ${endH}`,
      hasRisk: true,
    };
  }, [weather?.hourly, language]);

  // Dynamic hourly schedule generated from live Open-Meteo telemetry
  const workSafetySchedule = useMemo<WorkSafetyHour[]>(() => {
    const shiftHours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const result: WorkSafetyHour[] = [];

    for (let i = 0; i < shiftHours.length; i++) {
      const targetHourStr = shiftHours[i];
      const targetHourNum = parseInt(targetHourStr.split(':')[0], 10);

      // Match corresponding hour from weather.hourly if available
      const matched = weather?.hourly?.find(h => {
        const hNum = parseInt(h.hour.split(':')[0], 10);
        return hNum === targetHourNum;
      });

      // Ambient temperature calculation from live sensor/satellite forecast
      const temp = matched
        ? matched.temperature
        : Math.round(currentTemp + (targetHourNum >= 12 && targetHourNum <= 15 ? 4 : targetHourNum < 9 ? -4 : 0));
      const rainProb = matched
        ? matched.precipitationProbability
        : (targetHourNum >= 14 && targetHourNum <= 17 ? 65 : 10);
      const uv = matched
        ? matched.uvIndex
        : (targetHourNum >= 11 && targetHourNum <= 14 ? 7.2 : targetHourNum < 8 || targetHourNum >= 18 ? 0.2 : 4.0);
      const wCode = matched ? matched.weatherCode : 0;
      const windSpd = matched ? matched.windSpeed : (weather?.current?.windSpeed ?? 14);

      // Humidity variations across day (cooler hours higher RH, midday solar lower RH)
      const slotHumidity = Math.max(
        35,
        Math.min(95, Math.round(currentHumidity + (temp < 25 ? 15 : temp > 32 ? -15 : 0)))
      );

      // Dynamic WBGT (Wet Bulb Globe Temperature)
      const e = (slotHumidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp));
      const wbgt = Number((0.567 * temp + 0.393 * e + 3.94).toFixed(1));
      const heatIndex = Math.round(temp >= 26 ? temp + (slotHumidity > 60 ? (slotHumidity - 60) * 0.25 : 0) : temp);

      // Safety status classification
      const isThunderstorm = [95, 96, 99].includes(wCode);
      const isHazardous = isThunderstorm || rainProb >= 65 || wbgt >= 31.5 || temp >= 39;
      const isCaution = !isHazardous && (rainProb >= 30 || wbgt >= 27.5 || uv >= 6.5 || temp >= 33 || windSpd >= 25);
      const safetyStatus: 'safe' | 'caution' | 'hazardous' = isHazardous ? 'hazardous' : isCaution ? 'caution' : 'safe';

      let safetyLabelEn = 'Safe for Field Work';
      let safetyLabelHi = 'खेत कार्य हेतु सुरक्षित';
      let advisoryNoteEn = 'Optimal condition for manual labor, pesticide spraying & harvesting.';
      let advisoryNoteHi = 'श्रम, कीटनाशक छिड़काव व कटाई के लिए सबसे उत्तम व सुरक्षित समय।';

      if (safetyStatus === 'hazardous') {
        if (isThunderstorm || rainProb >= 65) {
          safetyLabelEn = 'Hazardous: Squall Line & Severe Rain';
          safetyLabelHi = 'खतरनाक: आंधी व मूसलाधार वर्षा';
          advisoryNoteEn = `Convective rain threat (${rainProb}%). Lightning active in ${location.district || location.name}. Cease open labor immediately.`;
          advisoryNoteHi = `${location.district || location.name} क्षेत्र में आकाशीय बिजली व आंधी (${rainProb}%) का खतरा। खुले खेतों से तत्काल पक्के शेड में जाएं।`;
        } else {
          safetyLabelEn = 'Hazardous: Extreme Heat Stress';
          safetyLabelHi = 'खतरनाक: अत्यधिक लू व ताप दबाव';
          advisoryNoteEn = `WBGT at ${wbgt}°C exceeds biometric limit. Mandatory shutdown of heavy manual agricultural labor.`;
          advisoryNoteHi = `वेट-बल्ब तापमान ${wbgt}°C खतरनाक स्तर पर। भारी शारीरिक श्रम पर तत्काल रोक लगाएं।`;
        }
      } else if (safetyStatus === 'caution') {
        if (uv >= 6.5 || wbgt >= 27.5) {
          safetyLabelEn = 'Caution: High Solar & Thermal Load';
          safetyLabelHi = 'सावधानी: तेज धूप व गर्मी का दबाव';
          advisoryNoteEn = `UV index ${uv} & thermal load ${wbgt}°C. Mandatory 15-minute shaded rest every 45 minutes.`;
          advisoryNoteHi = `उच्चतम UV विकिरण (${uv}) व ताप दबाव। प्रत्येक 45 मिनट के कार्य पर 15 मिनट छाया में विश्राम अनिवार्य।`;
        } else {
          safetyLabelEn = 'Caution: Wet Soil & Reduced Grip';
          safetyLabelHi = 'सावधानी: फिसलन व गीली मिट्टी';
          advisoryNoteEn = `Rain probability ${rainProb}%. Soil furrows slippery. Avoid tractor operations on steep bunds.`;
          advisoryNoteHi = `मिट्टी में फिसलन व नमी (${rainProb}% वर्षा)। गीली मेड़ों पर ट्रैक्टर चलाने से बचें।`;
        }
      } else {
        if (wbgt >= 24) {
          safetyLabelEn = 'Safe: Hydration Required';
          safetyLabelHi = 'सुरक्षित: पर्याप्त जलपान रखें';
          advisoryNoteEn = `Thermal load rising. Ensure potable water with electrolytes at ${location.district || location.name} field edges.`;
          advisoryNoteHi = `धूप बढ़ रही है। खेत की मेड़ों पर पीने का पानी व ओआरएस उपलब्ध रखें।`;
        } else {
          safetyLabelEn = 'Safe for Field Work';
          safetyLabelHi = 'खेत कार्य हेतु सुरक्षित';
          advisoryNoteEn = 'Calm morning winds, pleasant temperature. Optimal conditions for spraying & labor.';
          advisoryNoteHi = 'शांत हवा व सुखद तापमान। श्रमिकों की कार्यक्षमता अधिकतम रहेगी।';
        }
      }

      result.push({
        hour: targetHourStr,
        safetyStatus,
        safetyLabelEn,
        safetyLabelHi,
        temperature: temp,
        wbgt,
        heatIndex,
        uvIndex: uv,
        rainChance: rainProb,
        advisoryNoteEn,
        advisoryNoteHi,
      });
    }

    return result;
  }, [weather?.hourly, weather?.current, currentTemp, currentHumidity, location.district, location.name]);

  const filteredSlots = workSafetySchedule.filter(slot => {
    if (activeShiftFilter === 'all') return true;
    return slot.safetyStatus === activeShiftFilter;
  });

  const taskGuidance: Record<
    WorkTaskType,
    {
      titleEn: string;
      titleHi: string;
      icon: string;
      safeHours: string;
      rulesEn: string[];
      rulesHi: string[];
      riskRating: 'Low' | 'Moderate' | 'High';
    }
  > = {
    'field-labor': {
      titleEn: 'Field Labor & Manual Weeding',
      titleHi: 'खेत श्रम व हाथ से निराई-गुड़ाई',
      icon: 'groups',
      safeHours: '06:00 – 11:00 & 17:30 – 20:00',
      rulesEn: [
        'Mandatory hydration: Drink 250ml water/ORS every 20-30 minutes during midday.',
        'Rotate workers between sunny furrows and shaded tree bunds.',
        'Discontinue manual labor immediately upon hearing first thunder (30/30 rule).',
        'Wear breathable cotton turbans/hats to shield head from direct solar radiation.',
      ],
      rulesHi: [
        'अनिवार्य जलपान: दोपहर के समय हर 20-30 मिनट में 250ml पानी या ओआरएस पिएं।',
        'श्रमिकों को बारी-बारी से धूप वाले खेत से छायादार स्थानों पर विश्राम दें।',
        'पहली गड़गड़ाहट सुनते ही खुले खेत का काम तुरंत बंद कर दें (30/30 नियम)।',
        'सिर को सीधी धूप से बचाने के लिए सूती पगड़ी या गमछा अवश्य लपेटें।',
      ],
      riskRating: 'Moderate',
    },
    spraying: {
      titleEn: 'Chemical & Pesticide Spraying',
      titleHi: 'कीटनाशक व रसायन छिड़काव',
      icon: 'sanitizer',
      safeHours: '06:00 – 09:30 Only',
      rulesEn: [
        'Optimal wind speed is 4 – 12 km/h. Do NOT spray if wind gusts exceed 15 km/h (causes spray drift).',
        'Do NOT spray when temperatures exceed 30°C to prevent rapid chemical evaporation and worker toxicity.',
        'Cease spraying if rain is forecast within 4 hours to avoid wash-off and canal contamination.',
        'Use N95 respirator masks and nitrile gloves during early morning application.',
      ],
      rulesHi: [
        'अनुकूल हवा 4-12 किमी/घंटा है। यदि हवा 15 किमी/घंटा से तेज हो तो छिड़काव न करें (दवा उड़ने का खतरा)।',
        'तापमान 30°C से ऊपर जाने पर छिड़काव बंद करें, वरना दवा वाष्पीकृत होकर विषाक्तता पैदा कर सकती है।',
        'अगले 4 घंटों में बारिश की संभावना होने पर छिड़काव न करें ताकि दवा बह न जाए।',
        'छिड़काव के समय N95 मास्क व सुरक्षात्मक दस्ताने अनिवार्य रूप से पहनें।',
      ],
      riskRating: 'High',
    },
    machinery: {
      titleEn: 'Tractor & Heavy Machinery',
      titleHi: 'ट्रैक्टर व भारी कृषि यंत्र संचालन',
      icon: 'agriculture',
      safeHours: '06:00 – 13:00 & 18:00 – 21:00',
      rulesEn: [
        'Do NOT operate on saturated slopes or muddy bunds during heavy showers (rollover risk).',
        'In case of lightning storms, do NOT touch exposed steel linkages; remain inside enclosed cabin if rated.',
        'Check engine coolant before midday operation as ambient heat elevates overheat failure rates.',
        'Ensure bright LED floodlights are operational for evening post-squall operations.',
      ],
      rulesHi: [
        'तेज बारिश में गीली मेड़ों या ढलानों पर ट्रैक्टर न चलाएं (पलटने का गंभीर जोखिम)।',
        'बिजली कड़कने पर लोहे के यंत्रों को न छुएं; यदि केबिन बंद हो तो अंदर ही रहें।',
        'दोपहर में काम से पहले रेडिएटर व कूलेंट जांचें ताकि इंजन ज्यादा गर्म न हो।',
        'शाम के संचालन के लिए हेडलाइट व टेललाइट की कार्यप्रणाली सुनिश्चित करें।',
      ],
      riskRating: 'Moderate',
    },
    harvesting: {
      titleEn: 'Harvesting & Grain Threshing',
      titleHi: 'फसल कटाई व खलिहान थ्रेशिंग',
      icon: 'grain',
      safeHours: '07:00 – 12:00',
      rulesEn: [
        'Threshing dust combined with high humidity (>70%) causes severe respiratory strain.',
        'Keep tarpaulins ready near open threshing floors to shield bagged grain before 14:00 squalls.',
        'Ensure fire extinguishers or water drums are proximate due to dry husk friction risk in heat.',
        'Stop combine harvester if soil moisture is above 65% to avoid deep rutting compaction.',
      ],
      rulesHi: [
        'उच्च आर्द्रता (>70%) में थ्रेशिंग की धूल से सांस लेने में गंभीर तकलीफ हो सकती है।',
        'दोपहर 2 बजे की आंधी/बारिश से पूर्व कटी फसल को ढकने के लिए तिरपाल तैयार रखें।',
        'सूखे भूसे व गर्मी से आग के जोखिम से बचने हेतु खलिहान में पानी व रेत के ड्रम तैयार रखें।',
        'मिट्टी में 65% से अधिक नमी होने पर कंबाइन हार्वेस्टर न चलाएं, वरना जमीन धंस जाएगी।',
      ],
      riskRating: 'High',
    },
  };

  const currentTask = taskGuidance[selectedTask];

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg">
      {/* Top Header & Field Work Mode Switcher */}
      <section className="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-surface-container-high flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[1.25rem]">health_and_safety</span>
            <span>FR-7.2 Field Work Windows & Outdoor Labor Safety • {location.district || location.name || 'Agro Sector'}</span>
          </div>
          <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight mt-1">
            {language === 'hi'
              ? 'खेत कार्य समय-सारणी एवं श्रमिक सुरक्षा (FR-7.2)'
              : 'Field Work Windows & Labor Safety Planner (FR-7.2)'}
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl">
            {language === 'hi'
              ? 'वेट-बल्ब ग्लोब तापमान (WBGT), पराबैंगनी विकिरण (UV), लू का प्रभाव व आंधी-तूफ़ान रडार द्वारा निर्देशित सुरक्षित खेत कार्य घंटे।'
              : 'Continuous biomechanical strain modelling combining Wet-Bulb Globe Temperature (WBGT), solar UV, and squall telemetry to estimate safer outdoor field work hours.'}
          </p>
        </div>

        {/* View Switcher Pill (The requested Field Work option) */}
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-2xl self-start lg:self-auto shrink-0 shadow-xs text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveView('windows')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'windows'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[1.125rem]">schedule</span>
            <span>{language === 'hi' ? 'खेत कार्य समय (FR-7.2)' : 'Field Work Windows (FR-7.2)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'tasks'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[1.125rem]">agriculture</span>
            <span>{language === 'hi' ? 'फसल कार्य नियम' : 'Task Directives'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('emergency')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'emergency'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[1.125rem]">flash_on</span>
            <span>{language === 'hi' ? 'आपातकालीन नियम' : 'Emergency Protocols'}</span>
          </button>
        </div>
      </section>

      {/* Real-time Field Work Thermal Stress & Action Directives Bar */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-space-sm">
        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-bold">{language === 'hi' ? 'वेट-बल्ब तापमान (WBGT)' : 'WBGT Thermal Load'}</span>
            <span className="material-symbols-outlined text-[1.25rem] text-primary">device_thermostat</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-on-surface">{currentWBGT}</span>
              <span className="text-xs text-on-surface-variant font-bold">°C</span>
            </div>
            <span
              className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                currentWBGT >= 31.5
                  ? 'text-secondary bg-secondary-fixed/40'
                  : currentWBGT >= 27.5
                  ? 'text-tertiary bg-tertiary-fixed/30'
                  : 'text-primary bg-primary-container/40'
              }`}
            >
              {currentWBGT >= 31.5
                ? language === 'hi'
                  ? 'अत्यधिक ताप दबाव (Severe)'
                  : 'Severe Heat Stress'
                : currentWBGT >= 27.5
                ? language === 'hi'
                  ? 'सावधानी स्तर (Caution)'
                  : 'Moderate Heat Stress'
                : language === 'hi'
                ? 'सुरक्षित स्तर (Safe)'
                : 'Safe Thermal Load'}
            </span>
          </div>
          <span className="text-[0.7rem] text-on-surface-variant">
            {currentWBGT >= 31.5
              ? language === 'hi'
                ? 'खुले खेत का भारी श्रम रोकें'
                : 'Cease strenuous labor if >31.5°C'
              : currentWBGT >= 27.5
              ? language === 'hi'
                ? 'छायादार विश्राम व जलपान अनिवार्य'
                : 'Mandatory shaded break & hydration'
              : language === 'hi'
              ? 'शारीरिक श्रम हेतु अनुकूल'
              : 'Optimal outdoor thermal load'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-bold">{language === 'hi' ? 'कार्य-विश्राम चक्र' : 'Field Work-Rest Ratio'}</span>
            <span className="material-symbols-outlined text-[1.25rem] text-tertiary">timer</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-extrabold text-on-surface">{workRestRatio.ratio}</div>
            <span className="text-[0.7rem] font-bold text-primary bg-primary-container/40 px-2 py-0.5 rounded-full inline-block mt-1">
              {language === 'hi' ? workRestRatio.labelHi : workRestRatio.labelEn}
            </span>
          </div>
          <span className="text-[0.7rem] text-on-surface-variant">
            {language === 'hi' ? 'पेड़ या छप्पर की छांव में बैठें' : 'Mandatory shade rest per work shift'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-bold">{language === 'hi' ? 'जल सेवन दर' : 'Hydration Directive'}</span>
            <span className="material-symbols-outlined text-[1.25rem] text-primary">water_drop</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-extrabold text-on-surface">{hydrationRate}</div>
            <span className="text-[0.7rem] font-bold text-primary bg-primary-container/40 px-2 py-0.5 rounded-full inline-block mt-1">
              {language === 'hi' ? 'पानी + नीम्बू/ओआरएस' : 'Water + Electrolytes'}
            </span>
          </div>
          <span className="text-[0.7rem] text-on-surface-variant">
            {language === 'hi' ? 'प्यास लगने का इंतजार न करें' : 'Drink proactively before feeling thirsty'}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-bold">{language === 'hi' ? 'वज्रपात चेतावनी' : 'Lightning Alert'}</span>
            <span
              className={`material-symbols-outlined text-[1.25rem] ${
                lightningRiskWindow.hasRisk ? 'text-secondary' : 'text-primary'
              }`}
            >
              {lightningRiskWindow.hasRisk ? 'flash_on' : 'verified'}
            </span>
          </div>
          <div className="my-2">
            <div
              className={`text-xl font-extrabold ${
                lightningRiskWindow.hasRisk ? 'text-secondary' : 'text-on-surface'
              }`}
            >
              {lightningRiskWindow.window}
            </div>
            <span
              className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                lightningRiskWindow.hasRisk
                  ? 'text-secondary bg-secondary-fixed/40'
                  : 'text-primary bg-primary-container/40'
              }`}
            >
              {lightningRiskWindow.hasRisk
                ? language === 'hi'
                  ? 'उच्च जोखिम (High Risk)'
                  : 'Convective Squall Line'
                : language === 'hi'
                ? 'रडार साफ़ है'
                : 'Clear Radar'}
            </span>
          </div>
          <span className="text-[0.7rem] text-on-surface-variant">
            {lightningRiskWindow.hasRisk
              ? language === 'hi'
                ? 'बिजली कड़कते ही खुले खेत खाली करें'
                : 'Evacuate open fields at first thunder'
              : language === 'hi'
              ? 'आकाशीय बिजली का कोई खतरा नहीं'
              : 'No convective squalls projected'}
          </span>
        </div>
      </section>

      {/* SECTION 1: FIELD WORK WINDOWS (FR-7.2) TIMELINE MATRIX */}
      {(activeView === 'windows' || activeView === 'tasks' || activeView === 'emergency') && (
        <section className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {language === 'hi'
                  ? 'FR-7.2 खेत कार्य समय-सारणी (Field Work Windows)'
                  : 'FR-7.2 Field Work Windows (Safe & Hazardous Hours)'}
              </span>
              <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface mt-0.5">
                {language === 'hi' ? 'दिन के सुरक्षित व जोखिम भरे कार्य घंटे' : 'Hourly Field Work Permitted & Cease-Labor Windows'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {language === 'hi'
                  ? 'किसी भी समय पर क्लिक करके विस्तृत कृषि व श्रमिक निर्देश देखें।'
                  : 'Click any time slot below to inspect specific occupational directives and precautions.'}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-full self-start sm:self-auto text-xs">
              {(['all', 'safe', 'caution', 'hazardous'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveShiftFilter(f)}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer capitalize ${
                    activeShiftFilter === f
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f === 'all' ? (language === 'hi' ? 'सभी' : 'All') : f}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="space-y-space-xs mt-space-xs">
            {filteredSlots.map((slot, idx) => {
              const isSelected = selectedSlot?.hour === slot.hour;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSlot(isSelected ? null : slot)}
                  className={`p-space-sm rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border cursor-pointer transition-all active:scale-[0.99] ${
                    isSelected ? 'ring-2 ring-primary shadow-md' : ''
                  } ${
                    slot.safetyStatus === 'safe'
                      ? 'bg-surface-container-low border-primary/20 hover:bg-surface-container'
                      : slot.safetyStatus === 'caution'
                      ? 'bg-tertiary-fixed/25 border-tertiary/30 hover:bg-tertiary-fixed/40'
                      : 'bg-secondary-fixed/30 border-secondary/40 hover:bg-secondary-fixed/50'
                  }`}
                >
                  <div className="flex items-center gap-space-md">
                    <span className="font-headline-sm text-base font-extrabold w-14 text-on-surface">
                      {slot.hour}
                    </span>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ${
                        slot.safetyStatus === 'safe'
                          ? 'bg-primary text-on-primary'
                          : slot.safetyStatus === 'caution'
                          ? 'bg-tertiary text-on-tertiary'
                          : 'bg-secondary text-on-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[1rem]">
                        {slot.safetyStatus === 'safe'
                          ? 'check_circle'
                          : slot.safetyStatus === 'caution'
                          ? 'warning'
                          : 'block'}
                      </span>
                      <span>{language === 'hi' ? slot.safetyLabelHi : slot.safetyLabelEn}</span>
                    </div>
                    <span className="text-xs text-on-surface font-medium hidden lg:inline line-clamp-1">
                      {language === 'hi' ? slot.advisoryNoteHi : slot.advisoryNoteEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold text-on-surface-variant shrink-0">
                    <span>
                      Temp: <strong className="text-on-surface">{slot.temperature}°C</strong>
                    </span>
                    <span>
                      WBGT: <strong className="text-on-surface">{slot.wbgt}°C</strong>
                    </span>
                    <span>
                      UV: <strong className="text-on-surface">{slot.uvIndex}</strong>
                    </span>
                    <span>
                      Rain:{' '}
                      <strong className={slot.rainChance > 50 ? 'text-secondary' : 'text-on-surface'}>
                        {slot.rainChance}%
                      </strong>
                    </span>
                    <span className="material-symbols-outlined text-outline text-[1.125rem]">
                      {isSelected ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Slot Detailed Agronomic Protocol Modal/Box */}
          {selectedSlot && (
            <div className="p-space-md rounded-2xl bg-surface-container-low border border-primary/30 flex flex-col gap-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[1.25rem]">info</span>
                  <span className="font-bold text-xs text-on-surface">
                    {language === 'hi'
                      ? `${selectedSlot.hour} बजे हेतु विस्तृत खेत कार्य सुरक्षा निर्देश:`
                      : `Operational Field Safety Directive for ${selectedSlot.hour} IST:`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="text-outline hover:text-on-surface p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[1rem]">close</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {language === 'hi' ? selectedSlot.advisoryNoteHi : selectedSlot.advisoryNoteEn}
                {selectedSlot.safetyStatus === 'safe' &&
                  (language === 'hi'
                    ? ' (पूर्ण शारीरिक श्रम, कीटनाशक छिड़काव व ट्रैक्टर कार्य स्वीकृत)।'
                    : ' (Full manual field labor, mechanized operations & pesticide spraying permitted).')}
                {selectedSlot.safetyStatus === 'caution' &&
                  (language === 'hi'
                    ? ' (प्रत्येक 30 मिनट में जलपान अनिवार्य। सिर पर सूती गमछा या टोपी पहनें)।'
                    : ' (Hydration mandatory every 30 minutes. Wear wide-brim headgear & take shaded breaks).')}
                {selectedSlot.safetyStatus === 'hazardous' &&
                  (language === 'hi'
                    ? ' (खुले खेतों से तुरंत बाहर आएं। ट्रैक्टर व मशीनों को पक्के शेड में लगाएं। लोहे के खंभों से दूर रहें)।'
                    : ' (Cease all open-field labor immediately. Relocate tractors to covered sheds. Avoid electrical conduits).')}
              </p>
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: TASK SPECIFIC SAFETY PROTOCOLS */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {language === 'hi' ? 'कृषि कार्य अनुसार सुरक्षा नियम' : 'Task-Specific Agronomic Protocols'}
            </span>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface mt-0.5">
              {language === 'hi' ? 'कार्य प्रकार चुनें व सुरक्षा निर्देश देखें' : 'Select Field Operation to View Directives'}
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-container text-on-surface-variant">
            {language === 'hi' ? 'सिफारिश: ' : 'Recommended Window: '}
            <strong className="text-primary">{currentTask.safeHours}</strong>
          </span>
        </div>

        {/* Task Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(taskGuidance) as WorkTaskType[]).map(taskId => {
            const task = taskGuidance[taskId];
            const isSelected = selectedTask === taskId;
            return (
              <button
                key={taskId}
                type="button"
                onClick={() => setSelectedTask(taskId)}
                className={`p-3 rounded-2xl flex items-center gap-2 text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container-high'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[1.25rem] ${
                    isSelected ? 'text-on-primary' : 'text-primary'
                  }`}
                >
                  {task.icon}
                </span>
                <span className="text-xs font-bold leading-tight line-clamp-1">
                  {language === 'hi' ? task.titleHi : task.titleEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Task Directives Box */}
        <div className="bg-surface-container-low p-space-md rounded-2xl border border-primary/20 flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[1.25rem]">{currentTask.icon}</span>
              <span className="font-bold text-sm text-on-surface">
                {language === 'hi' ? currentTask.titleHi : currentTask.titleEn}
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentTask.riskRating === 'High'
                  ? 'bg-secondary/20 text-secondary'
                  : 'bg-primary/20 text-primary'
              }`}
            >
              {currentTask.riskRating} {language === 'hi' ? 'संवेदनशीलता' : 'Vulnerability'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
            {(language === 'hi' ? currentTask.rulesHi : currentTask.rulesEn).map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20 text-xs"
              >
                <span className="material-symbols-outlined text-primary text-[1rem] shrink-0 mt-0.5">check_circle</span>
                <span className="text-on-surface leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: EMERGENCY RURAL SAFETY DIRECTIVES */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-3xl border border-secondary/30 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-[1.5rem]">flash_on</span>
            <h3 className="font-bold text-sm text-on-surface">
              {language === 'hi' ? '30/30 आकाशीय बिजली सुरक्षा नियम' : 'The 30/30 Lightning Safety Rule'}
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {language === 'hi'
              ? 'यदि बिजली चमकने और गड़गड़ाहट के बीच का अंतर 30 सेकंड से कम हो, तो आप खतरे के दायरे में हैं। तुरंत पक्के मकान में शरण लें। अंतिम गड़गड़ाहट के 30 मिनट बाद तक खुले खेत में न जाएं।'
              : 'If the time between seeing lightning and hearing thunder is less than 30 seconds, the storm is within 10 km. Seek enclosed brick shelter immediately. Wait 30 minutes after the last thunderclap before returning to the field.'}
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-3xl border border-primary/30 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[1.5rem]">medical_services</span>
            <h3 className="font-bold text-sm text-on-surface">
              {language === 'hi' ? 'लू व हीटस्ट्रोक प्राथमिक उपचार' : 'Heat Exhaustion First Response'}
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {language === 'hi'
              ? 'चक्कर आना, उल्टी या अत्यधिक पसीना आने पर श्रमिक को तुरंत ठंडी छांव में लिटाएं। पैरों को थोड़ा ऊंचा रखें, ठंडे पानी की पट्टी लगाएं और नींबू पानी अथवा ओआरएस घोल पिलाएं।'
              : 'At early symptoms of dizziness, confusion, or nausea: immediately move the worker to dense shade, loosen tight clothing, elevate feet slightly, apply cool wet cloths to neck/groin, and administer electrolyte fluids.'}
          </p>
        </div>
      </section>
    </div>
  );
}
