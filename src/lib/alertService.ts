import { GovernmentAlert, WeatherCurrent } from '@/types';

function getFormattedTimeWindow(hoursAhead: number = 4) {
  const now = new Date();
  const validFrom = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST';
  const end = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  const validTo = end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST';
  const expiresInText = `Expires in ${hoursAhead}h 00m (${validTo})`;
  return { validFrom, validTo, expiresInText };
}

function generateCapId(prefix: string, district: string): string {
  const year = new Date().getFullYear();
  const hexTime = Math.floor(Date.now() / 1000).toString(16).toUpperCase();
  const distCode = (district || 'IND').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'IND';
  return `IN-CAP-NDMA-${year}-${hexTime}-${prefix}-${distCode}`;
}

function getRegionalTehsils(district: string, state: string): string[] {
  const dLower = (district + ' ' + state).toLowerCase();
  if (dLower.includes('indore')) {
    return ['हातोद (Hatod)', 'देपालपुर (Depalpur)', 'सांवेर (Sanwer)', 'बेटमा (Betma)'];
  }
  if (dLower.includes('lucknow') || dLower.includes('uttar pradesh') || dLower.includes('up')) {
    return ['मोहनलालगंज (Mohanlalganj)', 'सरोजिनी नगर (Sarojini Nagar)', 'मलिहाबाद (Malihabad)', 'बक्शी का तालाब (Bakshi Ka Talab)'];
  }
  if (dLower.includes('delhi') || dLower.includes('ncr') || dLower.includes('noida') || dLower.includes('gurugram')) {
    return ['Najafgarh Corridor', 'Yamuna Basin', `${district} North`, `${district} South`];
  }
  return [`${district} सदर (Sadar)`, `${district} ग्रामीण (Rural)`, `${district} पूर्वी (East)`, `${district} पश्चिमी (West)`];
}

export function calculateHeatStressAndLivestockIndices(temp: number = 31, humidity: number = 60) {
  // THI formula for dairy cattle & buffaloes (NRC / Thom formulation)
  const thi = (1.8 * temp + 32) - (0.55 - 0.0055 * humidity) * (1.8 * temp - 26);
  // Outdoor simplified Wet-Bulb Globe Temperature (WBGT) estimate
  const e = (humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp));
  const wbgt = Number((0.567 * temp + 0.393 * e + 3.94).toFixed(1));

  let livestockStatus: 'Comfort' | 'Mild Stress' | 'Moderate Stress' | 'Severe Stress' = 'Comfort';
  let livestockStatusHi: string = 'आरामदायक (सामान्य)';
  let laborStatus: 'Low Risk' | 'Caution' | 'High Risk' | 'Extreme Hazard' = 'Low Risk';
  let laborStatusHi: string = 'कम जोखिम';

  if (thi >= 89) {
    livestockStatus = 'Severe Stress';
    livestockStatusHi = 'अति-गंभीर तनाव (मृत्यु जोखिम)';
  } else if (thi >= 78) {
    livestockStatus = 'Moderate Stress';
    livestockStatusHi = 'मध्यम तनाव (दूध में 15-25% गिरावट)';
  } else if (thi >= 72) {
    livestockStatus = 'Mild Stress';
    livestockStatusHi = 'हल्का तनाव (हांफना व बेचैनी)';
  }

  if (wbgt >= 31.5) {
    laborStatus = 'Extreme Hazard';
    laborStatusHi = 'अत्यधिक खतरा (खुला कार्य निषिद्ध)';
  } else if (wbgt >= 28.5) {
    laborStatus = 'High Risk';
    laborStatusHi = 'उच्च जोखिम (30 मिनट विश्राम)';
  } else if (wbgt >= 26.0) {
    laborStatus = 'Caution';
    laborStatusHi = 'सावधानी (15 मिनट विश्राम)';
  }

  return {
    thi: Number(thi.toFixed(1)),
    wbgt,
    livestockStatus,
    livestockStatusHi,
    laborStatus,
    laborStatusHi,
  };
}

export function generateLivestockHeatAlert(
  district: string,
  state: string,
  temp: number = 32,
  humidity: number = 65
): GovernmentAlert {
  const { thi, wbgt, livestockStatus, livestockStatusHi, laborStatus, laborStatusHi } =
    calculateHeatStressAndLivestockIndices(temp, humidity);

  const isSevere = thi >= 78 || wbgt >= 28.5;
  const isExtreme = thi >= 89 || wbgt >= 31.5;
  const { validFrom, validTo, expiresInText } = getFormattedTimeWindow(6);

  return {
    id: generateCapId('HEAT', district),
    severity: isExtreme ? 'red' : (isSevere ? 'orange' : 'yellow'),
    severityLabelEn: isExtreme
      ? 'Red Alert (Extreme Thermal Strain & Heat Stroke Risk)'
      : (isSevere ? 'Orange Alert (Livestock & Labor Heat Strain)' : 'Yellow Alert (Heat Stress Caution)'),
    severityLabelHi: isExtreme
      ? 'लाल स्तर (अत्यधिक ताप तनाव व लू जोखिम)'
      : (isSevere ? 'नारंगी स्तर (पशुधन एवं श्रमिक ताप तनाव)' : 'पीला स्तर (गर्मी व लू सावधानी)'),
    source: `Agro-Meteorological Advisory Service (GKMS) & Animal Husbandry Division (${state})`,
    titleEn: `Heat Stress & Livestock Safety Warning: THI ${thi} (WBGT ${wbgt}°C) in ${district}`,
    titleHi: `${district} में पशुधन एवं श्रमिक हेतु ताप तनाव चेतावनी: THI ${thi} (WBGT ${wbgt}°C)`,
    englishSummary: `Elevated Temperature-Humidity Index (${thi}) and thermal WBGT (${wbgt}°C) induce physiological heat strain in dairy cattle, buffaloes, and open-field farm workers.`,
    hindiSummary: `तापमान व आर्द्रता सूचकांक (THI: ${thi}, WBGT: ${wbgt}°C) बढ़ने से दुधारू पशुओं में दूध घटने, हांफने और खेत मजदूरों में हीट स्ट्रोक का खतरा है।`,
    affectedTehsils: getRegionalTehsils(district, state),
    validFrom,
    validTo,
    expiresInText,
    radarTracked: true,
    audioScriptHi: `किसान और पशुपालक भाइयों ध्यान दें! ${district} में उमस और गर्मी से पशुओं का टीएचआई इंडेक्स ${thi} तक पहुंच गया है। गाय-भैंसों को दिन में तीन बार ठंडे पानी से नहलाएं, बाड़े में पंखा चलाएं और पीने के पानी में नमक व ओआरएस मिलाएं। दोपहर 12 से 3 बजे के बीच खुले खेत में मजदूरी न करें।`,
    audioScriptEn: `Alert for livestock owners and farmers in ${district}. Temperature-Humidity Index has reached ${thi}. Shower dairy cows and buffaloes with cool water, run shed fans, and provide mineral electrolytes. Farm labor must take shaded rest during midday.`,
    farmerDirectives: [
      {
        step: 1,
        titleEn: 'Dairy Cattle & Buffalo Water Sprinkling',
        titleHi: 'दुधारू गाय व भैंसों पर ठंडे पानी का छिड़काव',
        descriptionEn: 'Spray water or mist buffaloes and crossbred cows 3-4 times daily between 11 AM and 3 PM to avoid 15-25% drop in milk yield.',
        descriptionHi: 'दोपहर 11 से 3 बजे के बीच पशुओं को 3-4 बार नहलाएं या फव्वारे चलाएं। इससे दूध उत्पादन में गिरावट और पशुओं का हांफना रुकता है।',
        icon: 'water_drop',
        urgency: 'immediate',
        audioSnippetHi: 'पशुओं को दोपहर में 3 बार ठंडे पानी से नहलाएं।',
      },
      {
        step: 2,
        titleEn: 'Field Labor Shaded Work-Rest Protocol',
        titleHi: 'खेत मजदूरों हेतु छायादार विश्राम व ओआरएस',
        descriptionEn: `WBGT is ${wbgt}°C (${laborStatus}). Cease strenuous labor between 12:00 and 15:30 IST. Enforce 15-30 min shaded rest and drink ≥1.0 L/hr electrolyte water.`,
        descriptionHi: `डब्लूबीजीटी ${wbgt}°C है (${laborStatusHi})। दोपहर 12 से 3:30 के बीच भारी कार्य न करें। हर घंटे 15 से 30 मिनट छांव में आराम करें और ओआरएस पिएं।`,
        icon: 'health_and_safety',
        urgency: 'high',
        audioSnippetHi: 'दोपहर में धूप में लगातार काम न करें, हर घंटे छांव में विश्राम करें।',
      },
      {
        step: 3,
        titleEn: 'Electrolyte & Green Fodder Rationing',
        titleHi: 'पानी की चरनी में इलेक्ट्रोलाइट व हरा चारा',
        descriptionEn: 'Add baking soda (sodium bicarbonate 50g) and mineral mixture to clean drinking troughs. Provide green fodder during early morning and late evening.',
        descriptionHi: 'पानी की टंकी में 50 ग्राम मीठा सोडा (सोडियम बाइकार्बोनेट) और खनिज मिश्रण मिलाएं। हरा चारा सुबह-शाम ठंडक में ही खिलाएं।',
        icon: 'medication',
        urgency: 'high',
        audioSnippetHi: 'पशुओं के पानी में मीठा सोडा और खनिज मिश्रण मिलाएं।',
      },
      {
        step: 4,
        titleEn: 'Shed Ventilation & Thatch Whitewashing',
        titleHi: 'पशु शेड में वेंटिलेशन व छत पर सफेदी/पुआल',
        descriptionEn: 'Cover tin sheds with paddy straw or whitewash roofs with lime to reduce radiant heat absorption by 4-6°C.',
        descriptionHi: 'टीन शेड की छत पर पुआल डालें या चूने की सफेदी करें, जिससे बाड़े का तापमान 4 से 6 डिग्री तक कम रहता है।',
        icon: 'roofing',
        urgency: 'precautionary',
        audioSnippetHi: 'टीन शेड की छत पर चूने का लेप करें ताकि गर्मी कम रहे।',
      },
    ],
  };
}

export function generateSevereThunderstormAlert(
  district: string,
  state: string,
  windSpeed: number = 60
): GovernmentAlert {
  const { validFrom, validTo, expiresInText } = getFormattedTimeWindow(4);
  const gustSpeed = Math.max(windSpeed + 15, 60);

  return {
    id: generateCapId('THUN', district),
    severity: 'red',
    severityLabelEn: 'Red Alert (Take Immediate Action)',
    severityLabelHi: 'लाल स्तर चेतावनी (तत्काल सावधानी)',
    source: `National Disaster Management Authority (NDMA CAP-CP) / IMD Regional Hub (${state})`,
    titleEn: `Severe Thunderstorm, Cloud-to-Ground Lightning & Hail Hazard in ${district}`,
    titleHi: `${district} एवं आसपास के क्षेत्रों में अति-तीव्र मेघगर्जन, आकाशीय बिजली व ओलावृष्टि की चेतावनी!`,
    englishSummary: `Severe Thunderstorm with ${gustSpeed}+ km/h gusty squall lines, active convective hail cells, and heavy downpour detected across ${district} telemetry grid.`,
    hindiSummary: `अगले 4 घंटों में ${gustSpeed} किमी/घंटा तेज़ आंधी, बादलों की भारी गड़गड़ाहट एवं ओले गिरने का तीव्र जोखिम है। खुले खेतों से तुरंत पक्के सुरक्षित स्थानों पर जाएं।`,
    affectedTehsils: getRegionalTehsils(district, state),
    validFrom,
    validTo,
    expiresInText,
    radarTracked: true,
    audioScriptHi: `सावधान किसान भाइयों! मौसम विभाग एवं आपदा प्रबंधन प्राधिकरण द्वारा ${district} में अगले चार घंटों के लिए भारी मेघगर्जन और ओलावृष्टि का रेड अलर्ट जारी किया गया है। तुरंत पक्के मकान में शरण लें और कटी फसल को तिरपाल से सुरक्षित बांधें।`,
    audioScriptEn: `Attention farmers! National Disaster Management Authority has issued a Red Alert for ${district}. Severe thunderstorm, lightning, and squall winds of ${gustSpeed} km/h expected. Move to secure pucca shelter immediately and weigh down harvested produce.`,
    farmerDirectives: [
      {
        step: 1,
        titleEn: 'Move Indoors Immediately',
        titleHi: 'तुरंत पक्के सुरक्षित स्थान पर जाएं',
        descriptionEn: 'Do not stand under isolated trees, metal sheds, or open tractors. Lightning strikes are most lethal in open agricultural fields.',
        descriptionHi: 'खेत में अकेले पेड़ के नीचे या खुले ट्रैक्टर पर बिल्कुल न खड़े रहें। आकाशीय बिजली चमकने पर तुरंत पक्के कमरे या सुरक्षित ढलान में शरण लें।',
        icon: 'shelves',
        urgency: 'immediate',
        audioSnippetHi: 'खेत में अकेले पेड़ के नीचे या ट्रैक्टर पर न रहें। तुरंत पक्के मकान में जाएं।',
      },
      {
        step: 2,
        titleEn: 'Cover Harvested Crop with Tarpaulin',
        titleHi: 'कटी हुई उपज व अनाज को तिरपाल से कसकर बांधें',
        descriptionEn: 'Cover threshing floors or open bags of soybean, wheat, or chickpea with thick plastic tarpaulins and weigh them down with stones.',
        descriptionHi: 'खलिहान या मंडी में रखी सोयाबीन, गेहूं या चने की बोरियों को मोटे प्लास्टिक तिरपाल से ढककर पत्थरों से दबाएं ताकि तेज हवा में उड़े नहीं।',
        icon: 'warehouse',
        urgency: 'immediate',
        audioSnippetHi: 'खलिहान में रखी फसल को प्लास्टिक तिरपाल से ढककर पत्थरों से बांधें।',
      },
      {
        step: 3,
        titleEn: 'Disconnect Electric Tubewells & Motors',
        titleHi: 'सिंचाई मोटर व बिजली स्टार्टर स्विच बंद करें',
        descriptionEn: 'Switch off submersible pumps and high-tension irrigation lines to prevent transformer burnouts and electrical shocks.',
        descriptionHi: 'खेत में चल रहे ट्यूबवेल, सबमर्सिबल पंप के स्टार्टर तुरंत बंद करें ताकि बिजली गिरने से मोटर न जले और शॉर्ट सर्किट से बचाव हो।',
        icon: 'power_off',
        urgency: 'high',
        audioSnippetHi: 'खेत की मोटर व ट्यूबवेल के स्टार्टर तुरंत बंद करें ताकि मोटर जलने से बचे।',
      },
      {
        step: 4,
        titleEn: 'Secure Livestock in Pucca Cattle Shed',
        titleHi: 'मवेशियों को टीन शेड या पक्के बाड़े में बांधें',
        descriptionEn: 'Move cattle, goats, and calves away from barbed-wire fencing and metal poles into covered, dry shelters.',
        descriptionHi: 'गायों, बैलों व बकरियों को खुले तारों की बाड़ और खंभों से दूर हटाकर पक्के पशु शेड में बांधें ताकि ओलों व करंट से चोट न पहुंचे।',
        icon: 'pets',
        urgency: 'high',
        audioSnippetHi: 'पशुओं को लोहे के तारों और पेड़ों से दूर पक्के बाड़े में सुरक्षित बांधें।',
      },
    ],
  };
}

export function generateWashoutAndDrainageAlert(
  district: string,
  state: string,
  precipitation: number = 0,
  windSpeed: number = 25
): GovernmentAlert {
  const { validFrom, validTo, expiresInText } = getFormattedTimeWindow(8);

  return {
    id: generateCapId('WASH', district),
    severity: 'orange',
    severityLabelEn: 'Orange Alert (Chemical Washout & Waterlogging)',
    severityLabelHi: 'नारंगी स्तर (कीटनाशक धुलाई एवं जल-जमाव)',
    source: `State Disaster Management Authority (SDMA ${state}) & ICAR Agromet Unit`,
    titleEn: `Pesticide Washout & Drainage Congestion Advisory in ${district}`,
    titleHi: `${district} में कीटनाशक धुलाई एवं जल-निकासी चेतावनी (छिड़काव स्थगित रखें)`,
    englishSummary: `Surface winds exceeding ${Math.max(windSpeed, 28)} km/h and active rain probability will wash off chemical sprays and cause root-zone ponding in ${district}.`,
    hindiSummary: `दोपहर बाद तेज हवाओं व वर्षा से कीटनाशक का असर धुल जाएगा और खेत में पानी भरने से जड़ सड़न का खतरा है। छिड़काव 48 घंटे स्थगित रखें।`,
    affectedTehsils: getRegionalTehsils(district, state),
    validFrom,
    validTo,
    expiresInText,
    radarTracked: true,
    audioScriptHi: `किसान भाइयों, आज कीटनाशक व यूरिया का छिड़काव रोक दें। बारिश से दवा धुल जाएगी और पैसा बर्बाद होगा। खेत के निचले किनारों से पानी निकलने का रास्ता खोल दें।`,
    audioScriptEn: `Farmers in ${district} are advised to postpone pesticide and fertilizer applications today. High washout risk will render sprays ineffective. Clear field drainage trenches.`,
    farmerDirectives: [
      {
        step: 1,
        titleEn: 'Postpone Chemical & Fungicide Spraying',
        titleHi: 'कीटनाशक व फफूंदनाशक छिड़काव स्थगित करें',
        descriptionEn: 'Rain within 6 hours of application renders systemic chemicals ineffective and wastes farm inputs.',
        descriptionHi: 'दवा छिड़कने के 6 घंटे के भीतर बारिश होने से दवा बह जाती है और कीटों पर कोई असर नहीं होता। मौसम साफ़ होने तक छिड़काव टालें।',
        icon: 'cancel',
        urgency: 'high',
        audioSnippetHi: 'आज छिड़काव न करें, मौसम साफ़ होने पर ही करें।',
      },
      {
        step: 2,
        titleEn: 'Clear Drainage Furrows in Standing Crops',
        titleHi: 'खेत की जल निकासी नालियां साफ़ रखें',
        descriptionEn: 'Prevent water stagnation in black / alluvial soil furrows to protect root systems from fungal rotting (pythium / phytophthora).',
        descriptionHi: 'खेत में पानी भरने से जड़ सड़न का खतरा होता है। खेत के निचले किनारों से पानी निकलने का रास्ता खोलें।',
        icon: 'water',
        urgency: 'precautionary',
        audioSnippetHi: 'खेत की नालियों से पानी निकलने का रास्ता साफ़ कर दें।',
      },
    ],
  };
}

export function generateHighWindSquallAlert(
  district: string,
  state: string,
  windSpeed: number = 42
): GovernmentAlert {
  const { validFrom, validTo, expiresInText } = getFormattedTimeWindow(5);

  return {
    id: generateCapId('WIND', district),
    severity: 'orange',
    severityLabelEn: 'Orange Alert (High Velocity Wind Squalls)',
    severityLabelHi: 'नारंगी स्तर (तेज़ आंधी व धूल भरी हवाएं)',
    source: `National Disaster Management Authority (NDMA CAP-CP) / SDMA ${state}`,
    titleEn: `High Velocity Wind Squalls (${windSpeed}+ km/h) Hazard across ${district}`,
    titleHi: `${district} में ${windSpeed} किमी/घंटा तेज़ आंधी व धूल भरी हवाओं की चेतावनी!`,
    englishSummary: `Strong surface wind gusts (${windSpeed} km/h) risk tearing greenhouse polythene, toppling tall standing crops, and scattering loose produce.`,
    hindiSummary: `${windSpeed} किमी प्रति घंटे की रफ्तार से तेज हवाएं चलने की संभावना है। पॉलीहाउस की रस्सियां कसें और कटी उपज को सुरक्षित रखें।`,
    affectedTehsils: getRegionalTehsils(district, state),
    validFrom,
    validTo,
    expiresInText,
    radarTracked: true,
    audioScriptHi: `सावधान! ${district} में ${windSpeed} किमी प्रति घंटा की तेज आंधी चलने की संभावना है। पॉलीहाउस के वेंट्स बंद करें और खुले ट्रकों में उपज परिवहन रोकें।`,
    audioScriptEn: `Wind Squall Advisory for ${district}. Gusts up to ${windSpeed} km/h expected. Fasten greenhouse sheets, stake tall crops, and secure mandi produce.`,
    farmerDirectives: [
      {
        step: 1,
        titleEn: 'Secure Polyhouses & Greenhouse Sheeting',
        titleHi: 'पॉलीहाउस व टनल शीट्स को कसकर बांधें',
        descriptionEn: 'Strong cross-winds can tear UV polyfilms. Close side vents and tighten tie-down ratchets.',
        descriptionHi: 'तेज हवाओं से पॉलीहाउस की प्लास्टिक उड़ सकती है। वेंट्स बंद करें और रस्सियां कसें।',
        icon: 'warehouse',
        urgency: 'immediate',
        audioSnippetHi: 'पॉलीहाउस के वेंट्स बंद करें और तिरपाल कसें।',
      },
      {
        step: 2,
        titleEn: 'Cease Highway Transport of Open Perishables',
        titleHi: 'खुले वाहनों में फल व सब्जी परिवहन रोकें',
        descriptionEn: 'High crosswinds along arterial highways risk vehicle sway and cargo scattering.',
        descriptionHi: 'हाईवे पर तेज हवाओं से खुले ट्रकों में रखी सब्जियां उड़ने का खतरा है, वाहन सुरक्षित स्थान पर रोकें।',
        icon: 'local_shipping',
        urgency: 'high',
        audioSnippetHi: 'सब्जियों से भरे खुले वाहनों को सुरक्षित स्थान पर खड़ा करें।',
      },
      {
        step: 3,
        titleEn: 'Stake Tall Standing Crops against Lodging',
        titleHi: 'मक्का, गन्ना व पपीता की फसलों को सहारा दें',
        descriptionEn: 'Erect earthen ridges or tie bamboo supports for tall stalks vulnerable to wind lodging.',
        descriptionHi: 'मक्का, सूरजमुखी और गन्ने की फसलों को गिरने से बचाने के लिए जड़ों पर मिट्टी चढ़ाएं व सहारा दें।',
        icon: 'park',
        urgency: 'high',
        audioSnippetHi: 'लंबी फसलों को गिरने से बचाने के लिए सहारा दें।',
      },
    ],
  };
}

export function generateOptimalAgrometAdvisory(
  district: string,
  state: string
): GovernmentAlert {
  const { validFrom, validTo, expiresInText } = getFormattedTimeWindow(12);

  return {
    id: generateCapId('GKMS', district),
    severity: 'green',
    severityLabelEn: 'Green Advisory (Optimal Agro-Weather Window)',
    severityLabelHi: 'हरा स्तर परामर्श (अनुकूल कृषि मौसम अवधि)',
    source: `Gramin Krishi Mausam Sewa (GKMS - IMD / ICAR Krishi Vigyan Kendra, ${district})`,
    titleEn: `Favorable Field Spraying & Agro-Operations Window in ${district}`,
    titleHi: `${district} में कीटनाशक छिड़काव एवं खेत कार्य हेतु अनुकूल मौसम परामर्श`,
    englishSummary: `Calm surface winds (<15 km/h), stable atmospheric pressure, and clear skies provide an optimal window for foliar chemical sprays, soil aeration, and field harvesting.`,
    hindiSummary: `हवा की गति 15 किमी/घंटे से कम व मौसम साफ़ रहने से कीटनाशक छिड़काव, यूरिया टॉप-ड्रेसिंग एवं कटी फसल की मड़ाई के लिए परिस्थितियां सर्वथा अनुकूल हैं।`,
    affectedTehsils: getRegionalTehsils(district, state),
    validFrom,
    validTo,
    expiresInText,
    radarTracked: false,
    audioScriptHi: `किसान भाइयों, वर्तमान में ${district} में मौसम साफ़ व हवा की गति धीमी है। यह समय कीटनाशक छिड़काव और यूरिया डालने के लिए बहुत अनुकूल है। इस अवसर का लाभ उठाकर खेत के काम पूरे करें।`,
    audioScriptEn: `Agromet advisory for ${district}: Weather conditions are favorable with gentle winds and dry skies. This is an ideal operational window for foliar pesticide application and harvest processing.`,
    farmerDirectives: [
      {
        step: 1,
        titleEn: 'Optimal Chemical Spraying Window',
        titleHi: 'कीटनाशक व फफूंदनाशक छिड़काव का उत्तम समय',
        descriptionEn: 'Light winds prevent drift and 0% rain chance ensures maximum absorption of systemic sprays.',
        descriptionHi: 'हवा धीमी होने से दवा हवा में नहीं उड़ती और बारिश न होने से पूरा असर पत्तियों पर होता है।',
        icon: 'check_circle',
        urgency: 'precautionary',
        audioSnippetHi: 'आज कीटनाशक का छिड़काव आसानी से कर सकते हैं।',
      },
      {
        step: 2,
        titleEn: 'Field Aeration & Inter-Cultivation',
        titleHi: 'निराई-गुड़ाई एवं खेत की जुताई करें',
        descriptionEn: 'Dry topsoil allows tractor inter-cultivation to destroy weeds and improve soil root respiration.',
        descriptionHi: 'मिट्टी में उचित नमी होने से खरपतवार निकालने और गुड़ाई करने से जड़ों का विकास अच्छा होता है।',
        icon: 'agriculture',
        urgency: 'precautionary',
        audioSnippetHi: 'खेत में निराई-गुड़ाई का कार्य समय पर पूरा करें।',
      },
    ],
  };
}

export function getAlertsForLocation(
  locInput?: any,
  currentWeather?: Partial<WeatherCurrent>
): GovernmentAlert[] {
  const locName = typeof locInput === 'string' ? locInput : (locInput?.name || 'Indore');
  const district = typeof locInput === 'string' ? locInput : (locInput?.district || locInput?.city || 'Indore');
  const state = typeof locInput === 'string' ? 'Madhya Pradesh' : (locInput?.state || 'Madhya Pradesh');

  const temp = currentWeather?.temperature ?? 31;
  const humidity = currentWeather?.relativeHumidity ?? 60;
  const windSpeed = currentWeather?.windSpeed ?? 14;
  const precip = currentWeather?.precipitation ?? 0;
  const weatherCode = currentWeather?.weatherCode ?? 2;

  const heatAlert = generateLivestockHeatAlert(district, state, temp, humidity);
  const alertsList: GovernmentAlert[] = [heatAlert];

  // 1. Severe Convective / Thunderstorm / Hailstorm Condition (weather code 95-99, squall >= 50, violent showers)
  if (weatherCode >= 95 || windSpeed >= 50 || weatherCode === 82) {
    alertsList.unshift(generateSevereThunderstormAlert(district, state, windSpeed));
  }
  // 2. High Wind Squalls without severe thunderstorm
  else if (windSpeed >= 32) {
    alertsList.unshift(generateHighWindSquallAlert(district, state, windSpeed));
  }

  // 3. Washout & Heavy Rain / Ponding Risk
  if (precip > 0.5 || weatherCode === 61 || weatherCode === 63 || weatherCode === 65 || weatherCode === 80 || weatherCode === 81) {
    alertsList.push(generateWashoutAndDrainageAlert(district, state, precip, windSpeed));
  }

  // 4. Default: If no severe weather and conditions are calm/favorable, include GKMS agromet operational advisory
  if (alertsList.length === 1) {
    alertsList.push(generateOptimalAgrometAdvisory(district, state));
  }

  return alertsList;
}

export const ACTIVE_GOVERNMENT_ALERTS: GovernmentAlert[] = getAlertsForLocation();
