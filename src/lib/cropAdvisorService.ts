import { CropRecommendation, SoilConfig } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateContentWithFallback, cleanJsonString } from './geminiHelper';

export const STANDARD_SOIL_TYPES = [
  {
    id: 'black',
    nameEn: 'Deep Black Cotton Soil',
    nameHi: 'काली कपासिया मिट्टी',
    classType: 'Vertisol / रेगुर',
    descriptionHi: 'अधिक नमी रोकने वाली उपजाऊ ज़मीन। सोयाबीन, कपास और चना की पैदावार के लिए सबसे उत्तम।',
    descriptionEn: 'High moisture retention, nutrient-rich clay soil. Ideal for soybean, cotton, and chickpea.',
    moistureCapacity: 'बहुत अधिक (85%)',
    moisturePercentage: 85,
    drainageRate: 'धीमा जल रिसाव',
    ph: 7.4,
    organicContent: 'अति उर्वर (High Organic C >0.75%)',
    // Soil Health Card (soilhealth.dac.gov.in) Benchmarks
    nitrogenStatus: 'Medium (310 kg/ha N)',
    phosphorusStatus: 'Medium (38 kg/ha P2O5)',
    potassiumStatus: 'High (340 kg/ha K2O)',
    organicCarbonPct: 0.76,
    electricalConductivity: 0.38,
    micronutrientSummary: 'Zn: 0.72 ppm (Sufficient), B: 0.58 ppm, Fe: 5.4 ppm',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPKwXx3OeI_TFFzhQH43kHH5AM2SpfdRW_O4TTOW70gsuE2qzKFqZe-nBrmPbmXGSi1IDfVTzzwgIdPuL7RNbb-uBd-Xa-oj8Tu3RVGBo6_5A_RmYKym5iuBey8P6bGPb0QGsQItp-Jms_8tfE8yDSpw0HmLMzwxVnoZtHPo18L9QdXmdlxYAbpdiRM9BqiLp7_scsjWW5kkZv0ResvYsZkzRHLIhD3imSDE-ugGMeCHcmSoTWR5gf',
  },
  {
    id: 'medium',
    nameEn: 'Medium Black / Loamy Soil',
    nameHi: 'मध्यम काली / भूरी दोमट मिट्टी',
    classType: 'Loamy / मध्यम दोमट',
    descriptionHi: 'संतुलित जल निकास। गेहूं, मक्का, चना और सब्जियों की खेती के लिए अत्यंत उपयुक्त।',
    descriptionEn: 'Balanced aeration and water holding. Perfect for wheat, maize, gram, and seasonal vegetables.',
    moistureCapacity: 'मध्यम (60%)',
    moisturePercentage: 60,
    drainageRate: 'संतुलित निकास',
    ph: 7.1,
    organicContent: 'संतुलित कार्बन (0.62% OC)',
    // Soil Health Card (soilhealth.dac.gov.in) Benchmarks
    nitrogenStatus: 'Medium (295 kg/ha N)',
    phosphorusStatus: 'Medium (32 kg/ha P2O5)',
    potassiumStatus: 'Medium (220 kg/ha K2O)',
    organicCarbonPct: 0.62,
    electricalConductivity: 0.28,
    micronutrientSummary: 'Zn: 0.64 ppm (Sufficient), B: 0.52 ppm, Fe: 6.1 ppm',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw4kmm11E1MP53NYL4-QKfUf0D1V9tRw33UnkopYHjHH3z1DJLHQiCYTTRQSWz_kHbYk98rvk4AddP2KSiAItLbE2oC-YuW55geTyipyLUzTOWRVhZouG_csZAQMAe1RyHU8ICfSIGdfj-ud8Jl2YppSYULT_pk7-WC8MetCQTAtJ-pf5Krmdi5_wg_zqcnjrw38jYQRV5JUHvBN2WuA3Ee3sjer1_mDtWmRYzmi0oHm3vDtA5Z_5-',
  },
  {
    id: 'red',
    nameEn: 'Red / Murrum Soil',
    nameHi: 'हल्की लाल / कंकरीली मिट्टी',
    classType: 'Murrum / लाल मुरुम',
    descriptionHi: 'तेज़ जल रिसाव वाली मिट्टी। बार-बार हल्की सिंचाई आवश्यक। मूंगफली और दलहन हेतु उपयुक्त।',
    descriptionEn: 'Well-drained porous gravelly red soil with high iron oxide. Good for groundnut and pulses.',
    moistureCapacity: 'कम (35%)',
    moisturePercentage: 35,
    drainageRate: 'अति तीव्र निकास',
    ph: 6.5,
    organicContent: 'मध्यम-कम (0.44% OC)',
    // Soil Health Card (soilhealth.dac.gov.in) Benchmarks
    nitrogenStatus: 'Low (210 kg/ha N)',
    phosphorusStatus: 'Low (18 kg/ha P2O5)',
    potassiumStatus: 'Medium (165 kg/ha K2O)',
    organicCarbonPct: 0.44,
    electricalConductivity: 0.18,
    micronutrientSummary: 'Zn: 0.48 ppm (Deficient - ZnSO4 needed), Fe: 8.5 ppm (Rich)',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPXcb6D-s2rLylPfv2OmAEL9ztRq87W7fyEm9z-A06A2U_lBr_fsuVN97QSIuzmbL8sHsfGm9NXEBisD3amXX70XId1pf_y3FMGrwPpK2L10GBWiKWx7zUjcIyHcFP2oRKXy_vHZX8FfUGa8vDVLDTs4fXUq2Ibomxr5d19Lq1um6SUy0Tcq3QMbbxISR3wqSedwL3l9RlcTBoed7PWfH6EikOpYaGAcny2LUjZ2Ye5px8eC0dv5iW',
  },
  {
    id: 'sandy',
    nameEn: 'Alluvial / Sandy Loam',
    nameHi: 'रेतीली / कछारी दोमट मिट्टी',
    classType: 'Alluvial / कछारी दोमट',
    descriptionHi: 'नदी घाटी क्षेत्र की भुरभुरी मिट्टी। जड़ विकास उत्तम, सरसों, आलू और तरबूज के लिए आदर्श।',
    descriptionEn: 'Porous river basin loam with golden silt. Excellent root expansion, ideal for mustard, potato, melons.',
    moistureCapacity: 'मध्यम-कम (45%)',
    moisturePercentage: 45,
    drainageRate: 'उत्तम निकास',
    ph: 7.2,
    organicContent: 'मध्यम उर्वर (0.54% OC)',
    // Soil Health Card (soilhealth.dac.gov.in) Benchmarks
    nitrogenStatus: 'Low-to-Medium (240 kg/ha N)',
    phosphorusStatus: 'Medium (28 kg/ha P2O5)',
    potassiumStatus: 'Medium (195 kg/ha K2O)',
    organicCarbonPct: 0.54,
    electricalConductivity: 0.32,
    micronutrientSummary: 'Zn: 0.60 ppm, B: 0.45 ppm (Marginal), Sulphur: 12 ppm',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiye-RESrqbiZ9vvQGOOcpSsl6s1qYD8DVcOPDhOQUUHlqribA6Vqx4r-cVNWwxIAvjHvjlUnLpbIduncDDUsBLRF9MjeHpSi17WbKhxLpzH2tPzeuzTkbaiWMwT1LmJ1xOYFRQ_-Yb4mzZ2Ky9ZewMMdd30Bg1rk35Tc8-THhaYKWTRDwY3ZFuc1Og2n9sszelQtAr3PiQVCEdR3GiGZJO-DP4OFtfyWQb-er9q4IHzHKyJWALUaE',
  },
];

export const MOCK_RECOMMENDATIONS: Record<string, CropRecommendation[]> = {
  black: [
    {
      id: 'soybean-js2034',
      nameEn: 'Soybean',
      nameHi: 'सोयाबीन (Soybean)',
      variety: 'JS 20-34 • पीला सोना किस्म (ICAR-IISR)',
      category: 'primary',
      sowingWindowEn: '15 June to 25 June (Optimal Monsoon Window)',
      sowingWindowHi: '15 जून से 25 जून (सही समय)',
      waterDemandLevel: 3,
      waterDemandLabelEn: 'Moderate (3/5 Raindrops)',
      waterDemandLabelHi: 'मध्यम पानी (3/5)',
      estimatedYieldEn: '18-22 Quintals / Acre',
      estimatedYieldHi: '18-22 क्विंटल/एकड़',
      riskBadgeEn: 'Low Risk ✓ Top Priority',
      riskBadgeHi: 'कम जोखिम ✓ प्रथम वरीयता',
      riskLevel: 'low',
      soilMatchScore: 98,
      rationaleEn: 'Deep black vertisol provides superior moisture retention during monsoon dry spells. JS 20-34 matures in 86-90 days, avoiding terminal drought and sudden pod shattering.',
      rationaleHi: 'काली कपासिया मिट्टी में नमी लंबे समय तक ठहरती है। जेएस 20-34 किस्म 88 दिनों में पककर तैयार हो जाती है और पीला मोज़ेक रोग के प्रति अत्यधिक सहनशील है।',
      audioSpeechText: 'सोयाबीन जेएस बीस चौंतीस आपकी काली मिट्टी के लिए सर्वश्रेष्ठ है। इसकी बुवाई 15 से 25 जून के बीच करें। यह 88 दिनों में 20 क्विंटल तक उपज देगी।',
      keyRisksEn: 'Avoid waterlogging beyond 48 hours. Ridge-and-furrow (BBF) planting recommended.',
      keyRisksHi: 'खेत में 48 घंटे से अधिक जलभराव न होने दें। मेड़-नाली (BBF) विधि से बुवाई करें।',
      marketTrendEn: 'Strong mandi demand at ₹4,850 - ₹5,200 / quintal.',
      marketTrendHi: 'इंदौर व देपालपुर मंडी में ₹4,850 से ₹5,200 का स्थिर भाव।',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfWLebhCj5JsUiyi3U5KEoOGG9d0w5NmtHXzszXmyVX_iTnSFtj-HfWQNKpuv-Ub9Qh1KYUXpgmlXWLeSQwU6PJb1oi6Ym5vdGol_jFpzyOrFoJ1er6G9jL2kS0RmXInHBIDIkgiQAFOUNHqDXJmfjrH2pyMjmjqukn5k7jQOT6jqLQGc8oiUq7PtNxElDwFjRI8KA5IM0fwFzN_okXpjIuFex29J6TFw3tlsC4fRDD7SUaLPyiZAQ',
      icarNorms: {
        npkRatio: '20:60:40:20S kg/ha (DAP 88 kg + MOP 33 kg + Gypsum 100 kg/ha)',
        seedTreatment: 'Bradyrhizobium japonicum (5g/kg) + PSB (5g/kg) + Trichoderma viride',
        shcCompliance: 'Soil Health Card Validated: High K & Neutral pH (7.4) promotes vigorous root nodulation',
        shcComplianceHi: 'मृदा स्वास्थ्य कार्ड अनुकूल: मध्यम N-P एवं उच्च K में सर्वोत्तम ग्रंथिकरण (गांठें)',
      },
    },
    {
      id: 'maize-african-tall',
      nameEn: 'Maize (Corn)',
      nameHi: 'मक्का (Maize)',
      variety: 'African Tall / HQPM-1 (ICAR-IIMR)',
      category: 'safe',
      sowingWindowEn: 'Immediate Sowing (Ready)',
      sowingWindowHi: 'तुरंत बुवाई अनुकूल (Ready)',
      waterDemandLevel: 2,
      waterDemandLabelEn: 'Low-to-Medium (2/5 Raindrops)',
      waterDemandLabelHi: 'कम पानी (2/5)',
      estimatedYieldEn: '30-35 Quintals / Acre',
      estimatedYieldHi: '30-35 क्विंटल/एकड़',
      riskBadgeEn: 'Very Safe • Low Input Cost',
      riskBadgeHi: 'अति सुरक्षित • कम लागत',
      riskLevel: 'low',
      soilMatchScore: 92,
      rationaleEn: 'Sturdy root architecture excels in deep clay soil. Low susceptibility to seedling rot; provides high fodder and grain return with low fertilizer spend.',
      rationaleHi: 'कम लागत में मजबूत पैदावार। भारी बारिश को भी आसानी से सह लेती है। हरा चारा और दाना दोनों में अच्छा मुनाफा देती है।',
      audioSpeechText: 'मक्का सबसे सुरक्षित और कम खर्च वाली फसल है। यह तुरंत बुवाई के लिए तैयार है और 35 क्विंटल तक पैदावार दे सकती है।',
      keyRisksEn: 'Stem borer monitoring required at 20 days. Apply whorl application of cartap.',
      keyRisksHi: 'बुवाई के 20 दिन बाद तना छेदक कीट की निगरानी करें।',
      marketTrendEn: 'Poultry and starch feed procurement at ₹2,200 - ₹2,450 / quintal.',
      marketTrendHi: 'स्थानीय बाज़ार में ₹2,200 से ₹2,450 का मजबूत भाव।',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8j9qS4ZVoXPVtpo0FBSTL54L8IOU79fM7CpVykTfI0nb5QFOvELNS9CPSOErtLLNHAiLRihe1w0NGUcgfx0dd5JyMaIRYHqozAYfdtKc92gpcTK3KxtqST8ScbceBReIPFrozroW6BFHUiqnofTnRAZTwfsbVxbnqwXmwxFZbhCRV24nYlpKn8JpuuREa0KJB3IS0LzX1AY80MSbfN9Pb6QVVfbEzsX_CKiDHH-6REwXvBQ15S2cp',
      icarNorms: {
        npkRatio: '120:60:40 kg/ha (1/3 N basal, 1/3 at knee-high, 1/3 at tasseling)',
        seedTreatment: 'Azotobacter (250g/10kg seed) + Thiram (2g/kg)',
        shcCompliance: 'Matches Vertisol high water capacity; tolerates heavy rainfall without nitrogen starvation',
        shcComplianceHi: 'काली मिट्टी की जलधारण क्षमता के अनुकूल; भारी वर्षा में भी यूरिया की संतुलित खपत',
      },
    },
    {
      id: 'cotton-bt',
      nameEn: 'Cotton (Kapas)',
      nameHi: 'कपास (Bt Cotton)',
      variety: 'RCH 659 BG-II (CICR Nagpur Recommended)',
      category: 'alternative',
      sowingWindowEn: 'Early Monsoon (10 June - 20 June)',
      sowingWindowHi: 'शुरुआती मानसून (10 से 20 जून)',
      waterDemandLevel: 4,
      waterDemandLabelEn: 'High (4/5 Raindrops)',
      waterDemandLabelHi: 'अधिक पानी (4/5)',
      estimatedYieldEn: '12-15 Quintals / Acre',
      estimatedYieldHi: '12-15 क्विंटल/एकड़',
      riskBadgeEn: 'High Cash Yield • Moderate Pest Care',
      riskBadgeHi: 'अधिक मुनाफा • मध्यम देखभाल',
      riskLevel: 'medium',
      soilMatchScore: 95,
      rationaleEn: 'Deep black soil was historically evolved for cotton. Deep taproots extract soil moisture from subsoil layers even during extended dry intervals.',
      rationaleHi: 'काली मिट्टी कपास के लिए विश्व विख्यात है। इसकी जड़ें गहरी जाती हैं जिससे यह लंबे सूखे में भी हरी-भरी रहती है।',
      audioSpeechText: 'कपास आपको सबसे ज्यादा नकद मुनाफा देगी। ट्यूबवेल सिंचाई की व्यवस्था होने पर आरसीएच 659 किस्म की बुवाई करें।',
      keyRisksEn: 'Pink bollworm surveillance needed during flowering. Install pheromone traps.',
      keyRisksHi: 'फूल आते समय गुलाबी सुंडी से बचाव हेतु फेरोमोन ट्रैप लगाएं।',
      marketTrendEn: 'Premium grade cotton buying at ₹7,100 / quintal.',
      marketTrendHi: 'मंडी में सफेद सोना भाव ₹7,100 प्रति क्विंटल तक।',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPKwXx3OeI_TFFzhQH43kHH5AM2SpfdRW_O4TTOW70gsuE2qzKFqZe-nBrmPbmXGSi1IDfVTzzwgIdPuL7RNbb-uBd-Xa-oj8Tu3RVGBo6_5A_RmYKym5iuBey8P6bGPb0QGsQItp-Jms_8tfE8yDSpw0HmLMzwxVnoZtHPo18L9QdXmdlxYAbpdiRM9BqiLp7_scsjWW5kkZv0ResvYsZkzRHLIhD3imSDE-ugGMeCHcmSoTWR5gf',
      icarNorms: {
        npkRatio: '100:50:50 kg/ha + Zinc Sulphate 25 kg/ha basal',
        seedTreatment: 'Pseudomonas fluorescens (10g/kg) + Imidacloprid (5g/kg)',
        shcCompliance: 'Deep taproot utilizes Vertisol subsoil moisture; requires zinc booster per SHC norms',
        shcComplianceHi: 'गहरी जड़ों से उपमृदा नमी का दोहन; जिंक सल्फेट प्रयोग से पत्ती मुड़न से बचाव',
      },
    },
  ],
  medium: [
    {
      id: 'maize-hybrid',
      nameEn: 'Hybrid Maize',
      nameHi: 'संकर मक्का (Hybrid Maize)',
      variety: 'Pioneer P3396 (ICAR-IIMR)',
      category: 'primary',
      sowingWindowEn: 'Early Kharif (15-25 June)',
      sowingWindowHi: '15 से 25 जून',
      waterDemandLevel: 3,
      waterDemandLabelEn: 'Moderate (3/5)',
      waterDemandLabelHi: 'मध्यम पानी',
      estimatedYieldEn: '32-38 Quintals / Acre',
      estimatedYieldHi: '32-38 क्विंटल/एकड़',
      riskBadgeEn: 'Low Risk ✓ Balanced Growth',
      riskBadgeHi: 'कम जोखिम ✓ संतुलित विकास',
      riskLevel: 'low',
      soilMatchScore: 96,
      rationaleEn: 'Medium loamy soil provides optimal aeration and root penetration for high-yielding hybrid maize.',
      rationaleHi: 'मध्यम दोमट मिट्टी में मक्के की जड़ों का फैलाव सबसे अच्छा होता है और बालियां पूरी भरती हैं।',
      audioSpeechText: 'आपकी दोमट ज़मीन में संकर मक्का लगाना सबसे फ़ायदेमंद रहेगा। यह 35 क्विंटल तक पैदावार देगी।',
      keyRisksEn: 'Maintain nitrogen top-dressing at knee-high stage.',
      keyRisksHi: 'घुटने की ऊंचाई पर यूरिया की दूसरी खुराक दें।',
      marketTrendEn: '₹2,350 - ₹2,500 / quintal',
      marketTrendHi: '₹2,350 से ₹2,500 प्रति क्विंटल',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8j9qS4ZVoXPVtpo0FBSTL54L8IOU79fM7CpVykTfI0nb5QFOvELNS9CPSOErtLLNHAiLRihe1w0NGUcgfx0dd5JyMaIRYHqozAYfdtKc92gpcTK3KxtqST8ScbceBReIPFrozroW6BFHUiqnofTnRAZTwfsbVxbnqwXmwxFZbhCRV24nYlpKn8JpuuREa0KJB3IS0LzX1AY80MSbfN9Pb6QVVfbEzsX_CKiDHH-6REwXvBQ15S2cp',
      icarNorms: {
        npkRatio: '120:60:40 kg/ha',
        seedTreatment: 'Azotobacter (250g/10kg) + Thiram (2g/kg)',
        shcCompliance: 'Ideal for medium organic carbon (0.62%) and neutral pH (7.1)',
        shcComplianceHi: 'मध्यम जैविक कार्बन (0.62%) और सामान्य pH (7.1) के लिए पूर्ण अनुकूल',
      },
    },
    {
      id: 'chickpea-jg14',
      nameEn: 'Chickpea / Gram',
      nameHi: 'चना (Desi Gram)',
      variety: 'JG 14 • सूखा-सहिष्णु (ICAR-IIPR)',
      category: 'safe',
      sowingWindowEn: 'Late Kharif / Early Rabi (October - November)',
      sowingWindowHi: 'अक्टूबर से नवंबर (नमी अनुसार)',
      waterDemandLevel: 2,
      waterDemandLabelEn: 'Low Water (2/5)',
      waterDemandLabelHi: 'कम पानी (2/5)',
      estimatedYieldEn: '10-14 Quintals / Acre',
      estimatedYieldHi: '10-14 क्विंटल/एकड़',
      riskBadgeEn: 'Drought Tolerant ✓ Safe',
      riskBadgeHi: 'सूखा सहिष्णु ✓ सुरक्षित',
      riskLevel: 'low',
      soilMatchScore: 94,
      rationaleEn: 'Requires well-drained loamy soil to prevent wilt and root rot. JG 14 is thermotolerant.',
      rationaleHi: 'दोमट मिट्टी में उकठा (विल्ट) रोग का प्रकोप कम होता है। जेजी 14 किस्म अधिक तापमान में भी फलती है।',
      audioSpeechText: 'दोमट मिट्टी में चना जेजी चौदह सबसे सुरक्षित फसल है जो कम पानी में बेहतरीन मुनाफा देती है।',
      keyRisksEn: 'Helicoverpa pod borer at flowering. Install pheromone traps.',
      keyRisksHi: 'फूल व घंटी बनते समय इल्ली से बचाव हेतु फेरोमोन ट्रैप लगाएं।',
      marketTrendEn: 'MSP / Mandi rates at ₹5,440 / quintal.',
      marketTrendHi: 'मंडी भाव ₹5,440 प्रति क्विंटल तक।',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfWLebhCj5JsUiyi3U5KEoOGG9d0w5NmtHXzszXmyVX_iTnSFtj-HfWQNKpuv-Ub9Qh1KYUXpgmlXWLeSQwU6PJb1oi6Ym5vdGol_jFpzyOrFoJ1er6G9jL2kS0RmXInHBIDIkgiQAFOUNHqDXJmfjrH2pyMjmjqukn5k7jQOT6jqLQGc8oiUq7PtNxElDwFjRI8KA5IM0fwFzN_okXpjIuFex29J6TFw3tlsC4fRDD7SUaLPyiZAQ',
      icarNorms: {
        npkRatio: '20:40:20:20S kg/ha (DAP 88 kg/ha)',
        seedTreatment: 'Rhizobium ciceri (10g/kg) + Trichoderma viride (4g/kg)',
        shcCompliance: 'Soil Health Card Validated: Balanced P2O5 ensures nitrogen fixation nodules',
        shcComplianceHi: 'मृदा स्वास्थ्य कार्ड अनुकूल: संतुलित फास्फोरस से जड़ों में वायुमंडलीय नाइट्रोजन संचयन',
      },
    },
  ],
  red: [
    {
      id: 'groundnut-tg37a',
      nameEn: 'Groundnut (Peanut)',
      nameHi: 'मूंगफली (Groundnut)',
      variety: 'TG 37A (ICAR-DGR Junagadh)',
      category: 'primary',
      sowingWindowEn: 'Monsoon Onset (15 June - 30 June)',
      sowingWindowHi: '15 जून से 30 जून',
      waterDemandLevel: 2,
      waterDemandLabelEn: 'Low-to-Medium (2/5)',
      waterDemandLabelHi: 'कम पानी (2/5)',
      estimatedYieldEn: '14-18 Quintals / Acre',
      estimatedYieldHi: '14-18 क्विंटल/एकड़',
      riskBadgeEn: 'Top Choice for Red Soils',
      riskBadgeHi: 'लाल मुरुम मिट्टी हेतु सर्वोत्तम',
      riskLevel: 'low',
      soilMatchScore: 97,
      rationaleEn: 'Friable, porous red murrum soil allows effortless peg penetration and pod expansion without soil compaction.',
      rationaleHi: 'भुरभुरी लाल मुरुम मिट्टी में मूंगफली की सुइयां (पेग्स) आसानी से जमीन में प्रवेश करती हैं और दाने मोटे बनते हैं।',
      audioSpeechText: 'लाल कंकरीली जमीन के लिए मूंगफली टीजी सैंतीस ए सर्वश्रेष्ठ है। यह 16 क्विंटल तक पैदावार देती है।',
      keyRisksEn: 'Tikka leaf spot during humid breaks. Spray hexaconazole if spotted.',
      keyRisksHi: 'टिक्का रोग दिखने पर हेक्साकोनाज़ोल का छिड़काव करें।',
      marketTrendEn: 'Oil mills buying at ₹6,200 - ₹6,800 / quintal.',
      marketTrendHi: 'तेल मिलों में ₹6,200 से ₹6,800 का ऊंचा भाव।',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw4kmm11E1MP53NYL4-QKfUf0D1V9tRw33UnkopYHjHH3z1DJLHQiCYTTRQSWz_kHbYk98rvk4AddP2KSiAItLbE2oC-YuW55geTyipyLUzTOWRVhZouG_csZAQMAe1RyHU8ICfSIGdfj-ud8Jl2YppSYULT_pk7-WC8MetCQTAtJ-pf5Krmdi5_wg_zqcnjrw38jYQRV5JUHvBN2WuA3Ee3sjer1_mDtWmRYzmi0oHm3vDtA5Z_5-',
      icarNorms: {
        npkRatio: '20:40:40 kg/ha + Gypsum 250 kg/ha at flowering',
        seedTreatment: 'Rhizobium (5g/kg) + Carbendazim (2g/kg)',
        shcCompliance: 'Gypsum satisfies high calcium requirement for shell hardening in red soils',
        shcComplianceHi: 'जिप्सम डालने से लाल मिट्टी में दानों का भराव और छिलका मजबूत होता है',
      },
    },
    {
      id: 'pearl-millet-hhb67',
      nameEn: 'Pearl Millet (Bajra)',
      nameHi: 'बाजरा (Bajra)',
      variety: 'HHB 67 Improved (ICAR-IIMR)',
      category: 'safe',
      sowingWindowEn: 'Early Kharif (15 June - 5 July)',
      sowingWindowHi: '15 जून से 5 जुलाई',
      waterDemandLevel: 1,
      waterDemandLabelEn: 'Very Low (1/5)',
      waterDemandLabelHi: 'अति कम पानी (1/5)',
      estimatedYieldEn: '16-20 Quintals / Acre',
      estimatedYieldHi: '16-20 क्विंटल/एकड़',
      riskBadgeEn: 'Ultra Drought Resilient',
      riskBadgeHi: 'सूखे से अप्रभावित',
      riskLevel: 'low',
      soilMatchScore: 95,
      rationaleEn: 'Matures in 62-65 days. Highly efficient water use in nutrient-lean red soils.',
      rationaleHi: 'मात्र 65 दिनों में तैयार होने वाली फसल। कम पानी और कम खाद में भी भरपूर पैदावार।',
      audioSpeechText: 'बाजरा एचएचबी 67 सबसे कम पानी में तैयार होने वाली फसल है।',
      keyRisksEn: 'Downy mildew prevention via certified seed treatment.',
      keyRisksHi: 'डाउनी मिल्ड्यू से बचाव हेतु उपचारित बीज ही बोएं।',
      marketTrendEn: '₹2,500 / quintal MSP',
      marketTrendHi: '₹2,500 प्रति क्विंटल',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8j9qS4ZVoXPVtpo0FBSTL54L8IOU79fM7CpVykTfI0nb5QFOvELNS9CPSOErtLLNHAiLRihe1w0NGUcgfx0dd5JyMaIRYHqozAYfdtKc92gpcTK3KxtqST8ScbceBReIPFrozroW6BFHUiqnofTnRAZTwfsbVxbnqwXmwxFZbhCRV24nYlpKn8JpuuREa0KJB3IS0LzX1AY80MSbfN9Pb6QVVfbEzsX_CKiDHH-6REwXvBQ15S2cp',
      icarNorms: {
        npkRatio: '60:30:20 kg/ha',
        seedTreatment: 'Azospirillum (250g/10kg) + Metalaxyl (2g/kg)',
        shcCompliance: 'Thrives in low organic carbon (0.44%) and low phosphorus soils',
        shcComplianceHi: 'कम जैविक कार्बन (0.44%) और कम फास्फोरस वाली जमीन में भी सक्षम',
      },
    },
  ],
  sandy: [
    {
      id: 'mustard-pusa-bold',
      nameEn: 'Mustard (Sarson)',
      nameHi: 'सरसों (Mustard)',
      variety: 'Pusa Bold / RH 749 (ICAR-DRMR)',
      category: 'primary',
      sowingWindowEn: 'Post-Monsoon (15 October - 30 October)',
      sowingWindowHi: '15 अक्टूबर से 30 अक्टूबर',
      waterDemandLevel: 2,
      waterDemandLabelEn: 'Low Water (2/5)',
      waterDemandLabelHi: 'कम पानी (2/5)',
      estimatedYieldEn: '10-14 Quintals / Acre',
      estimatedYieldHi: '10-14 क्विंटल/एकड़',
      riskBadgeEn: 'High Oil Content ✓ Top Cash Return',
      riskBadgeHi: 'उच्च तेल प्रतिशत ✓ सर्वोत्तम मुनाफा',
      riskLevel: 'low',
      soilMatchScore: 96,
      rationaleEn: 'Deep taproot extracts residual moisture from sandy loam river terraces. Exceptional 42% oil yield.',
      rationaleHi: 'रेतीली दोमट मिट्टी में सरसों की जड़ें गहराई से नमी खींचती हैं और तेल का प्रतिशत 42% तक रहता है।',
      audioSpeechText: 'कछारी दोमट जमीन में सरसों पूसा बोल्ड आपको सबसे अच्छा तेल और मुनाफा देगी।',
      keyRisksEn: 'Aphid control at pod development stage.',
      keyRisksHi: 'फलियां बनते समय माहू (चेपा) की रोकथाम करें।',
      marketTrendEn: '₹5,650 / quintal MSP',
      marketTrendHi: '₹5,650 प्रति क्विंटल समर्थन मूल्य',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfWLebhCj5JsUiyi3U5KEoOGG9d0w5NmtHXzszXmyVX_iTnSFtj-HfWQNKpuv-Ub9Qh1KYUXpgmlXWLeSQwU6PJb1oi6Ym5vdGol_jFpzyOrFoJ1er6G9jL2kS0RmXInHBIDIkgiQAFOUNHqDXJmfjrH2pyMjmjqukn5k7jQOT6jqLQGc8oiUq7PtNxElDwFjRI8KA5IM0fwFzN_okXpjIuFex29J6TFw3tlsC4fRDD7SUaLPyiZAQ',
      icarNorms: {
        npkRatio: '80:40:40:20S kg/ha (Sulphur essential for oil synthesis)',
        seedTreatment: 'Trichoderma (4g/kg) + Imidacloprid (3g/kg)',
        shcCompliance: 'Soil Health Card Validated: Requires Elemental Sulphur (20 kg/ha) for oil synthesis',
        shcComplianceHi: 'मृदा स्वास्थ्य कार्ड अनुकूल: तेल की मात्रा बढ़ाने हेतु 20 किग्रा सल्फर अनिवार्य',
      },
    },
  ],
};

export async function getCropRecommendations(soil: SoilConfig, locationName: string = 'Indore'): Promise<CropRecommendation[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const soilKey = soil.soilType || 'black';
  const baseline = MOCK_RECOMMENDATIONS[soilKey] || MOCK_RECOMMENDATIONS.black;

  if (!apiKey) {
    return baseline;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are an expert Indian Agronomist AI for the Mausam Vaani platform, grounding all recommendations against ICAR (Indian Council of Agricultural Research) Package of Practices and Government of India Soil Health Card (soilhealth.dac.gov.in) benchmarks.
Given:
- Location: ${locationName}
- Soil: ${soil.soilNameEn} (${soil.soilClass})
- pH: ${soil.phValue}, Moisture: ${soil.moistureCapacity}
- Soil Health Card Parameters: Nitrogen (${soil.nitrogenStatus || 'Medium'}), Phosphorus (${soil.phosphorusStatus || 'Medium'}), Potassium (${soil.potassiumStatus || 'High'}), Organic Carbon (${soil.organicCarbonPct || 0.72}%), EC (${soil.electricalConductivity || 0.35} dS/m)
- Irrigation Source: ${soil.waterSource}
- Land Area: ${soil.landArea} ${soil.landUnit}
- Current Season: Kharif / Post-Monsoon window

Generate a JSON array of 3 top recommended crops grounded strictly in ICAR released varieties and SHC fertilizer guidelines with this exact structure:
[
  {
    "id": "crop-unique-slug",
    "nameEn": "Crop Name",
    "nameHi": "Crop Name in Hindi",
    "variety": "Recommended Indian Variety & ICAR Institute (e.g. JS 20-34 - ICAR-IISR)",
    "category": "primary" | "safe" | "alternative",
    "sowingWindowEn": "Sowing date window",
    "sowingWindowHi": "बुवाई की समय सीमा",
    "waterDemandLevel": 1-5,
    "waterDemandLabelEn": "Low / Moderate / High",
    "waterDemandLabelHi": "कम / मध्यम / अधिक पानी",
    "estimatedYieldEn": "X-Y Quintals/Acre",
    "estimatedYieldHi": "X-Y क्विंटल/एकड़",
    "riskBadgeEn": "Low Risk / High Yield",
    "riskBadgeHi": "कम जोखिम",
    "riskLevel": "low" | "medium" | "high",
    "soilMatchScore": 90-99,
    "rationaleEn": "2-line technical rationale referencing soil parameters",
    "rationaleHi": "2-line simple Hindi explanation for farmer",
    "audioSpeechText": "1 concise sentence in spoken Hindi for text-to-speech",
    "keyRisksEn": "key agronomic risk",
    "keyRisksHi": "मुख्य जोखिम व बचाव",
    "marketTrendEn": "market price outlook",
    "marketTrendHi": "बाजार भाव का अनुमान",
    "imageUrl": "keep empty or use valid placeholder",
    "icarNorms": {
      "npkRatio": "Recommended N:P:K:S ratio (e.g. 20:60:40:20S kg/ha)",
      "seedTreatment": "Certified seed treatment (Rhizobium/Trichoderma/PSB)",
      "shcCompliance": "Soil Health Card compliance explanation in English",
      "shcComplianceHi": "मृदा स्वास्थ्य कार्ड अनुकूलता की हिन्दी व्याख्या"
    }
  }
]
Return ONLY valid raw JSON array, without markdown backticks.`;

    const { result } = await generateContentWithFallback(genAI, prompt);
    const text = cleanJsonString(result.response.text());
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => ({
        ...item,
        imageUrl: baseline[idx % baseline.length]?.imageUrl || baseline[0].imageUrl,
        icarNorms: item.icarNorms || baseline[idx % baseline.length]?.icarNorms || baseline[0]?.icarNorms,
      }));
    }
  } catch (error) {
    console.warn('Gemini API call failed, falling back to ICAR knowledge base:', error);
  }

  return baseline;
}

export async function diagnoseSoilFromPhoto(imageBase64: string): Promise<{
  identifiedType: string;
  identifiedTypeHi: string;
  textureDescription: string;
  textureDescriptionHi: string;
  moistureEstimate: string;
  organicEstimate: string;
  phEstimate: number;
  nitrogenEstimate?: string;
  phosphorusEstimate?: string;
  potassiumEstimate?: string;
  recommendationNote: string;
  isApproximate: true;
}> {
  // First try /api/diagnose-soil if running in browser
  if (typeof window !== 'undefined') {
    try {
      const apiRes = await fetch('/api/diagnose-soil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      if (apiRes.ok) {
        const parsed = await apiRes.json();
        if (parsed && parsed.identifiedType) {
          return { ...parsed, isApproximate: true };
        }
      }
    } catch (apiErr) {
      console.warn('API /api/diagnose-soil call failed, trying direct Gemini or fallback:', apiErr);
    }
  }

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const prompt = `Analyze this soil photograph for agricultural assessment aligned with Government Soil Health Card standards in Central / Northern India.
Identify:
1. Soil type (Deep Black Cotton, Medium Loamy, Red Murrum, Sandy Loam)
2. Apparent texture (crumbly clay, friable loam, gravelly murrum, sandy silt)
3. Surface moisture level
4. Estimated pH range, organic carbon status, and N-P-K nutrient tendency
5. Actionable ICAR crop recommendation

Return ONLY a JSON object:
{
  "identifiedType": "Deep Black Cotton Soil",
  "identifiedTypeHi": "काली कपासिया मिट्टी",
  "textureDescription": "Crumbly clay aggregate with visible organic darkening",
  "textureDescriptionHi": "भुरभुरी चिकनी मिट्टी जिसमें जैविक कार्बन व पर्याप्त नमी के लक्षण हैं",
  "moistureEstimate": "65% - 70% (Adequate for sowing)",
  "organicEstimate": "High Organic Carbon (>0.75%)",
  "phEstimate": 7.4,
  "nitrogenEstimate": "Medium (280-320 kg/ha)",
  "phosphorusEstimate": "Medium (30-40 kg/ha)",
  "potassiumEstimate": "High (>300 kg/ha)",
  "recommendationNote": "Ideal for ICAR Soybean (JS 20-34), Maize (African Tall), and Bt Cotton"
}`;
      const { result } = await generateContentWithFallback(genAI, [
        prompt,
        {
          inlineData: {
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            mimeType: 'image/jpeg',
          },
        },
      ]);
      const cleanJson = cleanJsonString(result.response.text());
      const parsed = JSON.parse(cleanJson);
      return { ...parsed, isApproximate: true };
    } catch (e) {
      console.warn('Gemini vision soil analysis fallback:', e);
    }
  }

  return {
    identifiedType: 'Deep Black Cotton Soil (Regur Vertisol)',
    identifiedTypeHi: 'काली कपासिया मिट्टी (रेगुर)',
    textureDescription: 'Dark basaltic clay crumb aggregates with optimal pore spaces.',
    textureDescriptionHi: 'गहरे काले रंग की भुरभुरी चिकनी मिट्टी, जिसमें जल रोकने की प्राकृतिक क्षमता अधिक है।',
    moistureEstimate: '64% - 68% (पर्याप्त नमी)',
    organicEstimate: 'उच्च जैविक कार्बन (>0.75% OC per Soil Health Card)',
    phEstimate: 7.4,
    nitrogenEstimate: 'Medium (310 kg/ha N)',
    phosphorusEstimate: 'Medium (38 kg/ha P2O5)',
    potassiumEstimate: 'High (340 kg/ha K2O)',
    recommendationNote: 'ICAR-IISR सोयाबीन जेएस 20-34 एवं मक्का बुवाई के लिए उत्तम समय।',
    isApproximate: true,
  };
}
