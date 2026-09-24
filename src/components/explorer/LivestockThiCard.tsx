'use client';

import React, { useState } from 'react';
import { Language } from '@/types';
import ThiScenarioSimulator from './ThiScenarioSimulator';

export type LivestockSpecies = 'hf-cow' | 'murrah-buffalo' | 'desi-cow' | 'sheep-goat' | 'poultry';

interface LivestockThiCardProps {
  language: Language;
  locationName: string;
  livestockIndices: {
    thi: number;
    livestockStatus: string;
    livestockStatusHi: string;
    [key: string]: any;
  };
  hourlyLivestockForecast: Array<{
    hour: string;
    temp: number;
    rh: number;
    thi: number;
    status: 'comfort' | 'mild' | 'moderate' | 'severe';
    statusLabelEn: string;
    statusLabelHi: string;
  }>;
  currentTemp?: number;
  currentHumidity?: number;
}

export const SPECIES_DATA: Record<
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
    nameEn: 'HF & Exotic Crossbred Cows',
    nameHi: 'होलस्टीन फ्रीजियन (HF) व संकरित गाय',
    scientificEn: 'Bos taurus (Temperate Genetics)',
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

export default function LivestockThiCard({
  language,
  locationName,
  livestockIndices,
  hourlyLivestockForecast,
  currentTemp = 28,
  currentHumidity = 65,
}: LivestockThiCardProps) {
  const [selectedSpecies, setSelectedSpecies] = useState<LivestockSpecies>('hf-cow');
  const currentSpecies = SPECIES_DATA[selectedSpecies];

  return (
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
              ? `${locationName} हेतु मवेशी एवं पशुधन गर्मी सुरक्षा प्रबंधन`
              : `Cattle, Buffalo & Livestock Thermal Strain Protection for ${locationName}`}
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
              <span
                className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full text-center ${
                  slot.status === 'severe'
                    ? 'bg-red-600 text-white'
                    : slot.status === 'moderate'
                    ? 'bg-amber-600 text-white'
                    : slot.status === 'mild'
                    ? 'bg-yellow-500 text-slate-900'
                    : 'bg-emerald-600 text-white'
                }`}
              >
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
          {(Object.keys(SPECIES_DATA) as LivestockSpecies[]).map(sKey => {
            const sp = SPECIES_DATA[sKey];
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
                  <span
                    className={`text-[0.65rem] font-extrabold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
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
      <ThiScenarioSimulator
        language={language}
        defaultTemp={currentTemp}
        defaultHumidity={currentHumidity}
      />
    </section>
  );
}
