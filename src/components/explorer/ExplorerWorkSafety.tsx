'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { WorkSafetyHour } from '@/types';
import { calculateHeatStressAndLivestockIndices } from '@/lib/alertService';

type WorkTaskType = 'field-labor' | 'spraying' | 'machinery' | 'harvesting';
type WorkSafetyView = 'windows' | 'tasks' | 'livestock' | 'emergency';
type LivestockSpecies = 'hf-cow' | 'murrah-buffalo' | 'desi-cow' | 'sheep-goat' | 'poultry';

export default function ExplorerWorkSafety() {
  const { language, weather, location } = useApp();
  const t = translations[language];

  // Active top view tab: Field Work Windows (FR-7.2), Tasks, Livestock THI, or Emergency
  const [activeView, setActiveView] = useState<WorkSafetyView>('windows');
  const [selectedTask, setSelectedTask] = useState<WorkTaskType>('field-labor');
  const [selectedSpecies, setSelectedSpecies] = useState<LivestockSpecies>('hf-cow');
  const [selectedSlot, setSelectedSlot] = useState<WorkSafetyHour | null>(null);
  const [activeShiftFilter, setActiveShiftFilter] = useState<'all' | 'safe' | 'caution' | 'hazardous'>('all');

  // Interactive THI Scenario Simulator
  const [simTemp, setSimTemp] = useState<number>(34);
  const [simHumidity, setSimHumidity] = useState<number>(65);

  // Dynamic Biomechanical and Atmospheric Telemetry
  const currentTemp = weather?.current?.temperature ?? 28;
  const currentHumidity = weather?.current?.relativeHumidity ?? 65;

  const currentWBGT = useMemo(() => {
    const e = (currentHumidity / 100) * 6.105 * Math.exp((17.27 * currentTemp) / (237.7 + currentTemp));
    return Number((0.567 * currentTemp + 0.393 * e + 3.94).toFixed(1));
  }, [currentTemp, currentHumidity]);

  const livestockIndices = useMemo(() => {
    return calculateHeatStressAndLivestockIndices(currentTemp, currentHumidity);
  }, [currentTemp, currentHumidity]);

  const simulatedIndices = useMemo(() => {
    return calculateHeatStressAndLivestockIndices(simTemp, simHumidity);
  }, [simTemp, simHumidity]);

  // Diurnal 6-point THI timeline projection
  const hourlyLivestockForecast = useMemo(() => {
    const timeSlots = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    return timeSlots.map(hr => {
      const hNum = parseInt(hr.split(':')[0], 10);
      const matched = weather?.hourly?.find(h => parseInt(h.hour.split(':')[0], 10) === hNum);
      const temp = matched
        ? matched.temperature
        : Math.round(currentTemp + (hNum >= 12 && hNum <= 15 ? 4 : hNum < 9 ? -4 : 0));
      const rh = Math.max(
        30,
        Math.min(95, Math.round(currentHumidity + (temp < 26 ? 15 : temp > 33 ? -15 : 0)))
      );
      const thiVal = (1.8 * temp + 32) - (0.55 - 0.0055 * rh) * (1.8 * temp - 26);
      const thi = Number(thiVal.toFixed(1));
      let status: 'comfort' | 'mild' | 'moderate' | 'severe' = 'comfort';
      let statusLabelEn = 'Comfort';
      let statusLabelHi = 'आरामदायक';
      if (thi >= 89) {
        status = 'severe';
        statusLabelEn = 'Severe Stress';
        statusLabelHi = 'अति-गंभीर तनाव';
      } else if (thi >= 78) {
        status = 'moderate';
        statusLabelEn = 'Moderate Stress';
        statusLabelHi = 'मध्यम तनाव';
      } else if (thi >= 72) {
        status = 'mild';
        statusLabelEn = 'Mild Stress';
        statusLabelHi = 'हल्का तनाव';
      }
      return {
        hour: hr,
        temp,
        rh,
        thi,
        status,
        statusLabelEn,
        statusLabelHi,
      };
    });
  }, [weather?.hourly, currentTemp, currentHumidity]);

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

  const speciesData: Record<
    LivestockSpecies,
    {
      nameEn: string;
      nameHi: string;
      scientificEn: string;
      icon: string;
      comfortTHI: number;
      toleranceLevel: 'Low' | 'Moderate' | 'High';
      toleranceLevelHi: string;
      milkLossEst: string;
      waterIntakeEst: string;
      symptomsEn: string[];
      symptomsHi: string[];
      housingDirectivesEn: string[];
      housingDirectivesHi: string[];
      nutritionDirectivesEn: string[];
      nutritionDirectivesHi: string[];
    }
  > = {
    'hf-cow': {
      nameEn: 'Crossbred Dairy Cattle (HF / Jersey)',
      nameHi: 'संकर दुधारू गाय (एचएफ / जर्सी)',
      scientificEn: 'Bos taurus × Bos indicus (High Yielding Dairy)',
      icon: 'pets',
      comfortTHI: 72,
      toleranceLevel: 'Low',
      toleranceLevelHi: 'कम ताप सहनशीलता (अति-संवेदनशील)',
      milkLossEst: '15% – 28% Milk Drop Risk',
      waterIntakeEst: '90 – 130 L / Cow / Day',
      symptomsEn: [
        'Respiration rate exceeds 75 breaths/minute with shallow panting and extended neck.',
        'Continuous standing behavior (up to 16 hrs/day) to maximize flank air convection.',
        'Excessive drooling and loss of buffering saliva, sharply increasing rumen acidosis risk.',
        'Rectal temperature elevating above 39.5°C (severe thermal distress).',
      ],
      symptomsHi: [
        'सांस लेने की गति 75 बार/मिनट से अधिक, गर्दन खींचकर उथला हांफना।',
        'हवा से शरीर ठंडा करने के लिए लगातार खड़े रहना (बैठने से बचना)।',
        'मुंह से लगातार लार टपकना, जिससे पेट में अम्लता (एसिडोसिस) का खतरा बढ़ जाता है।',
        'गुदा का तापमान 39.5°C से अधिक होना (गंभीर ताप तनाव का संकेत)।',
      ],
      housingDirectivesEn: [
        'Operate 36-inch industrial oscillating fans generating air speed of 2.0 – 2.5 m/s over stalls.',
        'Run roof sprinklers or low-pressure misters for 1-2 minutes every 5 minutes in feeding alleys.',
        'Whitewash galvanized tin sheets with lime paint or layer 4 inches of thatch to block solar radiant heat.',
      ],
      housingDirectivesHi: [
        'शेड में 2.0 से 2.5 मीटर/सेकंड हवा की गति वाले 36-इंच के पंखे लगाएं।',
        'खुरली के पास हर 5 मिनट में 1-2 मिनट के लिए पानी का फव्वारा (स्प्रिंकलर) चलाएं।',
        'टीन की छत पर चूने की सफेदी करें या 4 इंच मोटी पराली/घास की परत बिछाएं।',
      ],
      nutritionDirectivesEn: [
        'Add 70–100g Sodium Bicarbonate (baking soda) + 25g Magnesium Oxide daily to stabilize rumen pH.',
        'Shift 65% of daily roughage feeding to cool night/early morning hours (20:00 to 07:00 IST).',
        'Supplement rumen-bypass fat (100–150g/day) to boost caloric density without fermentation heat.',
      ],
      nutritionDirectivesHi: [
        'प्रति गाय 70-100 ग्राम मीठा सोडा (बेकिंग सोडा) व 25 ग्राम मैग्नीशियम ऑक्साइड चारे में मिलाएं।',
        '65% भारी व हरा चारा ठंडे समय (रात 8 बजे से सुबह 7 बजे के बीच) में ही खिलाएं।',
        'चारे में 100-150 ग्राम बाईपास फैट शामिल करें ताकि पाचन में अतिरिक्त गर्मी न बने।',
      ],
    },
    'murrah-buffalo': {
      nameEn: 'Murrah & Indigenous Buffaloes',
      nameHi: 'मुर्राह एवं देशी भैंस',
      scientificEn: 'Bubalus bubalis (Dark Melanin Pigment)',
      icon: 'pets',
      comfortTHI: 74,
      toleranceLevel: 'Low',
      toleranceLevelHi: 'कम सहनशीलता (काली त्वचा द्वारा 90% सौर ताप अवशोषण)',
      milkLossEst: '12% – 22% Milk & Fat Reduction',
      waterIntakeEst: '100 – 140 L / Buffalo / Day',
      symptomsEn: [
        'Dark melanin skin absorbs 90% of solar radiation with only 1/6th sweat glands of zebu cattle.',
        'Silent estrus (unnoticed heat) and acute decline in artificial insemination conception rates.',
        'Severe lethargy, seeking water pools or mud wallowing for evaporative heat release.',
        'Marked drop in milk fat percentage due to reduced rumination time.',
      ],
      symptomsHi: [
        'काली त्वचा 90% धूप सोखती है और पसीने की ग्रंथियां देशी गायों से 1/6 ही होती हैं।',
        'गर्मियों में मूक गर्मी (मदहीनता) और कृत्रिम गर्भाधान की सफलता दर में तीव्र गिरावट।',
        'अत्यधिक सुस्ती, कीचड़ या पानी में बैठने (वलोविंग) की निरंतर चेष्टा।',
        'जुगाली कम होने से दूध में फैट की मात्रा में भारी गिरावट।',
      ],
      housingDirectivesEn: [
        'Provide mandatory wallowing pool access or hosing down at 11:00 and 15:00 IST.',
        'Erect 80% green/black agro-shade nets over open paddocks and wallowing channels.',
        'Hang wet burlap/gunny bags around shed perimeters to chill incoming airflow.',
      ],
      housingDirectivesHi: [
        'दोपहर 11:00 और शाम 15:00 बजे ठंडे पानी से नहलाना या तालाब/नाद में बैठाना अनिवार्य है।',
        'बाड़े के खुले हिस्सों में 80% हरी एग्रो-शेड नेट की दोहरी चादर लगाएं।',
        'हवा के रास्ते पर भीगे हुए टाट के बोरे लटकाएं ताकि ठंडी हवा अंदर आए।',
      ],
      nutritionDirectivesEn: [
        'Add 100g mineral mixture with chelated zinc, selenium, and chromium to alleviate thermal shock.',
        'Ensure continuous ad-libitum clean drinking water (<25°C) within 5 meters of the stall.',
        'Offer succulent green fodder (maize, sorghum, hybrid napier) during twilight hours.',
      ],
      nutritionDirectivesHi: [
        'तनाव कम करने हेतु जिंक व सेलेनियम युक्त 100 ग्राम मिनरल मिक्चर प्रतिदिन दें।',
        'शेड में 5 मीटर के दायरे में 24 घंटे ठंडा व स्वच्छ पीने का पानी उपलब्ध रखें।',
        'सुबह भोर में व देर शाम को रसीला हरा मक्का, ज्वार या नेपियर घास खिलाएं।',
      ],
    },
    'desi-cow': {
      nameEn: 'Indigenous Zebu Cattle (Gir, Sahiwal, Tharparkar)',
      nameHi: 'देशी गोवंश (गीर, साहीवाल, थारपारकर)',
      scientificEn: 'Bos indicus (Tropical Climate Resilient)',
      icon: 'pets',
      comfortTHI: 78,
      toleranceLevel: 'High',
      toleranceLevelHi: 'उच्च ताप सहनशीलता (प्राकृतिक उष्णकटिबंधीय अनुकूलन)',
      milkLossEst: '5% – 10% Minor Variation',
      waterIntakeEst: '60 – 85 L / Cow / Day',
      symptomsEn: [
        'Possesses dense functional sweat glands (up to 1,800/cm²) for active evaporative cooling.',
        'Extensive vascularized dewlap and umbilical folds provide efficient convective cooling surfaces.',
        'Maintains normal rumination and feed intake at THI up to 80.',
        'Water consumption climbs linearly only above 38°C ambient temperature.',
      ],
      symptomsHi: [
        'प्रति वर्ग सेमी 1,800 तक सक्रिय पसीने की ग्रंथियां होती हैं।',
        'बड़ा गलकंबल (dewlap) और झूलती त्वचा शरीर की गर्मी तेजी से निकालती है।',
        '80 THI तक भी सामान्य जुगाली और दाना चरने की क्षमता बनी रहती है।',
        '38°C से अधिक तापमान होने पर ही पानी की मांग बढ़ती है।',
      ],
      housingDirectivesEn: [
        'Dense natural shade of Neem, Peepal, or Banyan trees provides optimal comfort.',
        'Ensure open-sided sheds with free cross-draft air exchange.',
      ],
      housingDirectivesHi: [
        'नीम, पीपल या बरगद के घने पेड़ों की छांव में बांधना पूर्णतः अनुकूल है।',
        'खुले किनारों वाले हवादार शेड में रखें ताकि प्राकृतिक हवा मिलती रहे।',
      ],
      nutritionDirectivesEn: [
        'Provide pure rock salt (Sendha Namak) blocks inside feed troughs for mineral self-regulation.',
        'Replenish shaded earthen water troughs at least twice daily.',
      ],
      nutritionDirectivesHi: [
        'खुरली में सेंधा नमक का ढेला रखें ताकि पशु चाटकर इलेक्ट्रोलाइट संतुलित रख सके।',
        'छायादार स्थान पर मिट्टी की नाद में दिन में दो बार ताजा ठंडा पानी भरें।',
      ],
    },
    'sheep-goat': {
      nameEn: 'Goats & Sheep (Small Ruminants)',
      nameHi: 'बकरी एवं भेड़ (लघु जुगाली पशु)',
      scientificEn: 'Capra hircus / Ovis aries',
      icon: 'pets',
      comfortTHI: 74,
      toleranceLevel: 'Moderate',
      toleranceLevelHi: 'मध्यम सहनशीलता (धूप में चरने पर हीटस्ट्रोक जोखिम)',
      milkLossEst: '10% – 15% Reduction',
      waterIntakeEst: '6 – 12 L / Head / Day',
      symptomsEn: [
        'Open-mouth rapid panting and nasal mucus discharge when exposed to direct sun.',
        'Crowding in corners or clustering around shaded fence posts.',
        'Risk of heat exhaustion and late-term abortion in pregnant does during intense Loo periods.',
      ],
      symptomsHi: [
        'तेज धूप में मुंह खोलकर हांफना और नाक से पानी बहना।',
        'छांव की तलाश में बाड़े के कोनों में एक-दूसरे के ऊपर चिपकना।',
        'लू के दिनों में गाभिन बकरियों में गर्भपात व हीटस्ट्रोक का गंभीर खतरा।',
      ],
      housingDirectivesEn: [
        'Strictly prohibit open-field browsing between 11:00 and 16:00 IST during summer heat.',
        'Provide raised slatted bamboo or wooden flooring with dry straw to eliminate ground thermal radiation.',
      ],
      housingDirectivesHi: [
        'गर्मियों में सुबह 11:00 से शाम 16:00 बजे के बीच खुले में चराने पर पूर्ण रोक रखें।',
        'जमीन की तपिश से बचाने के लिए बांस के मचान या सूखी पराली का बिछावन रखें।',
      ],
      nutritionDirectivesEn: [
        'Offer cool water mixed with 1% jaggery (gur) and rock salt during midday heat.',
        'Feed lopped fresh green tree leaves (Neem, Subabul, Khejri) in late evening.',
      ],
      nutritionDirectivesHi: [
        'दोपहर में पानी में 1% गुड़ और चुटकी भर सेंधा नमक मिलाकर पिलाएं।',
        'देर शाम को सुबबूल, नीम, खेजड़ी या अरडू की ताजी हरी पत्तियां खिलाएं।',
      ],
    },
    'poultry': {
      nameEn: 'Commercial Poultry (Broilers & Layers)',
      nameHi: 'मुर्गीपालन (ब्रॉयलर एवं लेयर)',
      scientificEn: 'Gallus gallus domesticus',
      icon: 'pets',
      comfortTHI: 70,
      toleranceLevel: 'Low',
      toleranceLevelHi: 'अति-संवेदनशील (पसीने की ग्रंथियां न होने से उच्च मृत्यु दर)',
      milkLossEst: '15% – 30% Egg Production Drop',
      waterIntakeEst: '350 – 550 ml / Bird / Day',
      symptomsEn: [
        'Severe panting with wings drooping away from the body to shed feather heat.',
        'Thin-shelled or cracked eggs due to hyperventilation-induced respiratory alkalosis.',
        'Sudden spike in heat stroke mortality when house temperatures cross 36°C with >60% RH.',
      ],
      symptomsHi: [
        'पंखों को शरीर से दूर फैलाकर बहुत तेज गति से हांफना।',
        'अंडों का छिलका पतला या टूटा हुआ निकलना (कैल्शियम अवशोषण बाधित होने से)।',
        'शेड का तापमान 36°C और आर्द्रता 60% से ऊपर जाने पर मुर्गियों की अचानक मृत्यु।',
      ],
      housingDirectivesEn: [
        'Operate high-pressure misting foggers (50-70 bar) in tandem with longitudinal tunnel exhaust fans.',
        'Spread 3 inches of dry sugarcane bagasse or rice husk on roof sheets and keep it constantly moist.',
      ],
      housingDirectivesHi: [
        'टनल एग्जॉस्ट पंखों के साथ हाई-प्रेशर फॉगर्स (फव्वारे) चलाएं।',
        'टीन की छत पर धान की भूसी या गन्ने की खोई की 3 इंच परत बिछाकर पानी टपकाएं।',
      ],
      nutritionDirectivesEn: [
        'Add Vitamin C (200 mg/L) and Potassium Chloride (0.2%) to drinking water tanks.',
        'Withdraw feed 2 hours before peak daily heat (11:00 IST) to avert digestive heat accumulation.',
      ],
      nutritionDirectivesHi: [
        'पीने के पानी की टंकी में विटामिन C (200 मिलीग्राम/लीटर) व पोटेशियम क्लोराइड मिलाएं।',
        'दोपहर की सबसे तेज गर्मी से 2 घंटे पहले (सुबह 11 बजे) दाना हटा लें।',
      ],
    },
  };

  const currentSpecies = speciesData[selectedSpecies];
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
              ? 'खेत कार्य समय-सारणी एवं पशुधन सुरक्षा (FR-7.2)'
              : 'Field Work Windows & Livestock Thermal Safety (FR-7.2)'}
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl">
            {language === 'hi'
              ? 'वेट-बल्ब ग्लोब तापमान (WBGT), पशुधन THI सूचकांक, पराबैंगनी विकिरण (UV), लू का प्रभाव व आंधी रडार द्वारा निर्देशित संपूर्ण कृषि सुरक्षा प्रणाली।'
              : 'Integrated physiological strain modelling combining Wet-Bulb Globe Temperature (WBGT), Cattle THI Index, solar UV, and squall radar telemetry.'}
          </p>
        </div>

        {/* View Switcher Pill */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-container p-1 rounded-2xl self-start lg:self-auto shrink-0 shadow-xs text-xs font-bold">
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
            onClick={() => setActiveView('livestock')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'livestock'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 dark:text-amber-300 hover:text-amber-900 bg-amber-500/10'
            }`}
          >
            <span className="material-symbols-outlined text-[1.125rem]">pets</span>
            <span>{language === 'hi' ? 'पशुधन THI तनाव' : 'Livestock THI Stress'}</span>
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

      {/* Real-time Field Work & Livestock Thermal Stress Bar (5 Metrics) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-sm">
        {/* Box 1: Livestock THI */}
        <div
          onClick={() => setActiveView('livestock')}
          className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high hover:border-amber-500/50 shadow-xs flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <span className="font-bold">{language === 'hi' ? 'पशुधन THI सूचकांक' : 'Livestock THI Score'}</span>
            <span className="material-symbols-outlined text-[1.25rem] text-amber-600">pets</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-on-surface">{livestockIndices.thi}</span>
              <span className="text-xs text-on-surface-variant font-bold">THI</span>
            </div>
            <span
              className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                livestockIndices.thi >= 89
                  ? 'text-red-700 bg-red-100 dark:bg-red-950 dark:text-red-300'
                  : livestockIndices.thi >= 78
                  ? 'text-amber-800 bg-amber-100 dark:bg-amber-950 dark:text-amber-300'
                  : livestockIndices.thi >= 72
                  ? 'text-yellow-800 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300'
                  : 'text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {language === 'hi' ? livestockIndices.livestockStatusHi : livestockIndices.livestockStatus}
            </span>
          </div>
          <span className="text-[0.7rem] text-amber-600 font-semibold flex items-center gap-1">
            <span>{language === 'hi' ? 'पशु तनाव विवरण देखें' : 'View cattle stress'}</span>
            <span className="material-symbols-outlined text-[0.875rem]">arrow_forward</span>
          </span>
        </div>

        {/* Box 2: WBGT Thermal Load */}
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

        {/* Box 3: Field Work-Rest Ratio */}
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

        {/* Box 4: Hydration Directive */}
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

        {/* Box 5: Lightning Alert */}
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
                ? 'बिजली कड़कते ही खेत खाली करें'
                : 'Evacuate open fields at thunder'
              : language === 'hi'
              ? 'आकाशीय बिजली का कोई खतरा नहीं'
              : 'No convective squalls projected'}
          </span>
        </div>
      </section>

      {/* SECTION 1: FIELD WORK WINDOWS (FR-7.2) TIMELINE MATRIX */}
      {activeView === 'windows' && (
        <section className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md animate-fadeIn">
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
      {activeView === 'tasks' && (
        <section className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md animate-fadeIn">
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
      )}

      {/* SECTION: HEAT STRESS & LIVESTOCK SAFETY INDEX (THI) */}
      {activeView === 'livestock' && (
        <section className="bg-surface-container-lowest rounded-3xl p-space-md sm:p-space-lg shadow-sm border border-amber-500/30 flex flex-col gap-space-lg animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container-high pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  {language === 'hi' ? 'पशुधन ताप तनाव सूचकांक' : 'Livestock Temperature-Humidity Index (THI)'}
                </span>
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[0.65rem] font-extrabold px-2 py-0.5 rounded-full">
                  Thom Formulation
                </span>
              </div>
              <h2 className="font-headline-md text-lg sm:text-xl font-extrabold text-on-surface mt-0.5">
                {language === 'hi'
                  ? `${location.district || location.name} हेतु मवेशी एवं पशुधन गर्मी सुरक्षा प्रबंधन`
                  : `Cattle, Buffalo & Livestock Thermal Strain Protection for ${location.district || location.name}`}
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 max-w-3xl">
                {language === 'hi'
                  ? 'दुधारू मवेशियों के शरीर की आंतरिक ताप उत्पादन व वातावरण में गर्मी विसर्जन का वैज्ञानिक विश्लेषण। टी.एच.आई (THI) 72 से अधिक होने पर दुग्ध उत्पादन में गिरावट व हांफना प्रारंभ होता है।'
                  : 'Physiological thermal equilibrium model quantifying sensible and latent heat dissipation limits. THI exceeding 72 triggers panting, ruminal acidosis risk, and 15–28% milk production loss.'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 self-start sm:self-auto">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[1.5rem]">pets</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[0.65rem] uppercase font-bold text-amber-700 dark:text-amber-300">
                  {language === 'hi' ? 'वर्तमान औसत THI' : 'Current Agro THI'}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-on-surface">{livestockIndices.thi}</span>
                  <span className="text-xs font-bold text-on-surface-variant">THI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diurnal 6-Point Hourly THI Forecast Progression */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                {language === 'hi' ? 'आज का 24-घंटे THI ताप तनाव चक्र:' : 'Today’s Diurnal THI Stress Timeline:'}
              </span>
              <span className="text-[0.7rem] text-on-surface-variant">
                {language === 'hi' ? 'मौसम पूर्वानुमान से परिकलित' : 'Derived from live hourly forecast'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {hourlyLivestockForecast.map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex flex-col justify-between gap-1.5 ${
                    slot.status === 'severe'
                      ? 'bg-red-500/10 border-red-500/40 text-on-surface'
                      : slot.status === 'moderate'
                      ? 'bg-amber-500/10 border-amber-500/40 text-on-surface'
                      : slot.status === 'mild'
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-on-surface'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-on-surface'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-extrabold text-on-surface">
                    <span>{slot.hour}</span>
                    <span className="text-[0.7rem] font-semibold text-on-surface-variant">{slot.temp}°C</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-on-surface">{slot.thi}</span>
                    <span className="text-[0.65rem] font-bold text-on-surface-variant">THI</span>
                  </div>
                  <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full text-center ${
                    slot.status === 'severe'
                      ? 'bg-red-600 text-white'
                      : slot.status === 'moderate'
                      ? 'bg-amber-600 text-white'
                      : slot.status === 'mild'
                      ? 'bg-yellow-500 text-slate-900'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {language === 'hi' ? slot.statusLabelHi : slot.statusLabelEn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Species Selector Tabs */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
              {language === 'hi' ? 'पशु प्रजाति चुनें (Species Thermal Sensitivity):' : 'Select Farm Species for Tailored Directives:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {(Object.keys(speciesData) as LivestockSpecies[]).map(sKey => {
                const sp = speciesData[sKey];
                const isSelected = selectedSpecies === sKey;
                return (
                  <button
                    key={sKey}
                    type="button"
                    onClick={() => setSelectedSpecies(sKey)}
                    className={`p-3 rounded-2xl flex flex-col gap-1 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-surface-container-low border-surface-container-high hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`material-symbols-outlined text-[1.25rem] ${isSelected ? 'text-white' : 'text-amber-600'}`}>
                        {sp.icon}
                      </span>
                      <span className={`text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        THI &lt;{sp.comfortTHI}
                      </span>
                    </div>
                    <span className="text-xs font-bold leading-tight line-clamp-1">
                      {language === 'hi' ? sp.nameHi : sp.nameEn}
                    </span>
                    <span className={`text-[0.65rem] line-clamp-1 ${isSelected ? 'text-white/80' : 'text-on-surface-variant'}`}>
                      {language === 'hi' ? sp.toleranceLevelHi : `${sp.toleranceLevel} Tolerance`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Species Detailed Dossier Card */}
          <div className="bg-surface-container-low rounded-2xl p-space-md border border-amber-500/20 flex flex-col gap-space-md">
            {/* Header row with impact metrics */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm border-b border-surface-container pb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {language === 'hi' ? currentSpecies.nameHi : currentSpecies.nameEn}
                  </h3>
                  <span className="text-[0.7rem] font-semibold text-on-surface-variant italic">
                    {currentSpecies.scientificEn}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant">
                  {language === 'hi' ? currentSpecies.toleranceLevelHi : `Thermal Tolerance: ${currentSpecies.toleranceLevel}`}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col">
                  <span className="text-[0.65rem] font-bold text-on-surface-variant uppercase">
                    {language === 'hi' ? 'दूध / उत्पादन नुकसान' : 'Production Loss'}
                  </span>
                  <span className="text-xs font-black text-rose-600">{currentSpecies.milkLossEst}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col">
                  <span className="text-[0.65rem] font-bold text-on-surface-variant uppercase">
                    {language === 'hi' ? 'दैनिक जल आवश्यकता' : 'Water Requirement'}
                  </span>
                  <span className="text-xs font-black text-blue-600">{currentSpecies.waterIntakeEst}</span>
                </div>
              </div>
            </div>

            {/* 3 Columns: Symptoms, Housing Adaptations, Nutrition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {/* Symptoms */}
              <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                  <span className="material-symbols-outlined text-[1.125rem]">vital_signs</span>
                  <span>{language === 'hi' ? 'ताप तनाव के शारीरिक लक्षण' : 'Physiological Stress Symptoms'}</span>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {(language === 'hi' ? currentSpecies.symptomsHi : currentSpecies.symptomsEn).map((sym, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-on-surface leading-relaxed">
                      <span className="material-symbols-outlined text-rose-500 text-[0.875rem] shrink-0 mt-0.5">warning</span>
                      <span>{sym}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Housing & Microclimate */}
              <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <span className="material-symbols-outlined text-[1.125rem]">roofing</span>
                  <span>{language === 'hi' ? 'बाड़ा व शेड शीतलन तकनीक' : 'Housing & Cooling Directives'}</span>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {(language === 'hi' ? currentSpecies.housingDirectivesHi : currentSpecies.housingDirectivesEn).map((dir, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-on-surface leading-relaxed">
                      <span className="material-symbols-outlined text-primary text-[0.875rem] shrink-0 mt-0.5">check_circle</span>
                      <span>{dir}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition & Buffering */}
              <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                  <span className="material-symbols-outlined text-[1.125rem]">medication</span>
                  <span>{language === 'hi' ? 'आहार व इलेक्ट्रोलाइट प्रबंधन' : 'Nutritional & Buffer Protocols'}</span>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {(language === 'hi' ? currentSpecies.nutritionDirectivesHi : currentSpecies.nutritionDirectivesEn).map((nut, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-on-surface leading-relaxed">
                      <span className="material-symbols-outlined text-amber-600 text-[0.875rem] shrink-0 mt-0.5">science</span>
                      <span>{nut}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive THI Scenario Simulator & Veterinary Emergency */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
            {/* Interactive Scenario Simulator */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md border border-surface-container-high flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[1.25rem]">tune</span>
                  <span className="font-bold text-xs sm:text-sm text-on-surface">
                    {language === 'hi' ? 'इंटरएक्टिव THI परिदृश्य सिम्युलेटर' : 'Interactive THI Scenario Simulator'}
                  </span>
                </div>
                <span className="text-[0.68rem] text-on-surface-variant font-medium">
                  {language === 'hi' ? 'तापमान व आर्द्रता बदलकर देखें' : 'Test custom weather values'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Temp Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold text-on-surface">
                    <span>{language === 'hi' ? 'तापमान' : 'Temperature'}</span>
                    <span className="font-bold text-primary">{simTemp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="22"
                    max="48"
                    value={simTemp}
                    onChange={e => setSimTemp(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[0.65rem] text-on-surface-variant">
                    <span>22°C</span>
                    <span>48°C</span>
                  </div>
                </div>

                {/* Humidity Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold text-on-surface">
                    <span>{language === 'hi' ? 'आर्द्रता' : 'Relative Humidity'}</span>
                    <span className="font-bold text-primary">{simHumidity}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="95"
                    value={simHumidity}
                    onChange={e => setSimHumidity(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[0.65rem] text-on-surface-variant">
                    <span>15%</span>
                    <span>95%</span>
                  </div>
                </div>
              </div>

              {/* Simulated Result Pill */}
              <div className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface">
                    {language === 'hi' ? 'अनुमानित THI:' : 'Simulated THI:'}
                  </span>
                  <span className="text-xl font-black text-on-surface">{simulatedIndices.thi}</span>
                  <span className="text-xs font-medium text-on-surface-variant">
                    (WBGT: {simulatedIndices.wbgt}°C)
                  </span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  simulatedIndices.thi >= 89
                    ? 'bg-red-600 text-white'
                    : simulatedIndices.thi >= 78
                    ? 'bg-amber-600 text-white'
                    : simulatedIndices.thi >= 72
                    ? 'bg-yellow-500 text-slate-900'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {language === 'hi' ? simulatedIndices.livestockStatusHi : simulatedIndices.livestockStatus}
                </span>
              </div>
            </div>

            {/* Veterinary Emergency Protocol Card */}
            <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-md border border-rose-500/30 flex flex-col justify-between gap-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs sm:text-sm">
                <span className="material-symbols-outlined text-[1.25rem]">emergency</span>
                <span>{language === 'hi' ? 'पशु हीटस्ट्रोक (Heat Apoplexy) आपातकाल' : 'Acute Cattle Heat Stroke Protocol'}</span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-on-surface leading-relaxed">
                <p>
                  {language === 'hi'
                    ? 'यदि पशु गिर पड़े, मुंह से झाग आए या गुदा का तापमान 41°C से ऊपर हो, तो यह जानलेवा स्थिति है।'
                    : 'If an animal collapses with open-mouth panting, foaming, or rectal temp >41°C, act immediately:'}
                </p>
                <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-[0.72rem] flex flex-col gap-1">
                  <span>1. {language === 'hi' ? 'पशु के सिर व माथे पर लगातार ठंडा पानी डालें (फेफड़ों पर न डालें)।' : 'Pour continuous cold water on forehead & poll (avoid lungs).'}</span>
                  <span>2. {language === 'hi' ? 'सींगों के बीच बर्फ की थैली रखें और तुरंत छाया में खींचें।' : 'Apply ice packs between horns; move to open breezeway.'}</span>
                  <span>3. {language === 'hi' ? 'पशु चिकित्सक को बुलाकर नसों में ठंडी सलाइन (IV Fluid) लगवाएं।' : 'Call local veterinary surgeon for immediate chilled IV therapy.'}</span>
                </div>
              </div>

              <a
                href="tel:18001801551"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[1.125rem]">phone_in_talk</span>
                <span>{language === 'hi' ? 'पशु चिकित्सा हेल्पलाइन: 1800-180-1551' : 'Call Veterinary Helpline: 1800-180-1551'}</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: EMERGENCY RURAL SAFETY DIRECTIVES */}
      {activeView === 'emergency' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-space-md animate-fadeIn">
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
      )}
    </div>
  );
}
