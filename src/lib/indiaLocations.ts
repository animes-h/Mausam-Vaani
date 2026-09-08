export interface IndiaLocation {
  name: string;
  nameHi: string;
  state: string;
  stateHi: string;
  region: 'mp' | 'north' | 'west' | 'south' | 'east';
  isLocalPriority?: boolean;
}

export const INDIA_LOCATIONS: IndiaLocation[] = [
  // --- MADHYA PRADESH (Local & Key Corridors) ---
  { name: 'Indore', nameHi: 'इंदौर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Ujjain', nameHi: 'उज्जैन', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Dewas', nameHi: 'देवास', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Bhopal', nameHi: 'भोपाल', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Ashta', nameHi: 'आष्टा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Sehore', nameHi: 'सीहोर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Ratlam', nameHi: 'रतलाम', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Shajapur', nameHi: 'शाजापुर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Sanwer', nameHi: 'सांवेर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Sonkatch', nameHi: 'सोनकच्छ', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Maksi', nameHi: 'मक्सी', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Dhar', nameHi: 'धार', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Khargone', nameHi: 'खरगोन', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Khandwa', nameHi: 'खंडवा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Mhow', nameHi: 'महू (डॉ. अम्बेडकर नगर)', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Gwalior', nameHi: 'ग्वालियर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Jabalpur', nameHi: 'जबलपुर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Sagar', nameHi: 'सागर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Rewa', nameHi: 'रीवा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Satna', nameHi: 'सतना', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Narmadapuram', nameHi: 'नर्मदापुरम (होशंगाबाद)', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', isLocalPriority: true },
  { name: 'Vidisha', nameHi: 'विदिशा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Neemuch', nameHi: 'नीमच', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Mandsaur', nameHi: 'मंदसौर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Barwani', nameHi: 'बड़वानी', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Harda', nameHi: 'हरदा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Betul', nameHi: 'बैतूल', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Chhindwara', nameHi: 'छिंदवाड़ा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Shivpuri', nameHi: 'शिवपुरी', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Guna', nameHi: 'गुना', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Katni', nameHi: 'कटनी', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Burhanpur', nameHi: 'बुरहानपुर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Singrauli', nameHi: 'सिंगरौली', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Damoh', nameHi: 'दमोह', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },
  { name: 'Chhatarpur', nameHi: 'छतरपुर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp' },

  // --- NORTH INDIA (Delhi NCR, UP, Rajasthan, Punjab, Haryana, Uttarakhand, HP, J&K) ---
  { name: 'New Delhi', nameHi: 'नई दिल्ली', state: 'Delhi', stateHi: 'दिल्ली', region: 'north', isLocalPriority: true },
  { name: 'Noida', nameHi: 'नोएडा', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Gurugram', nameHi: 'गुरुग्राम', state: 'Haryana', stateHi: 'हरियाणा', region: 'north' },
  { name: 'Faridabad', nameHi: 'फरीदाबाद', state: 'Haryana', stateHi: 'हरियाणा', region: 'north' },
  { name: 'Ghaziabad', nameHi: 'गाजियाबाद', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Lucknow', nameHi: 'लखनऊ', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', isLocalPriority: true },
  { name: 'Kanpur', nameHi: 'कानपुर', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Agra', nameHi: 'आगरा', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Varanasi', nameHi: 'वाराणसी', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Prayagraj', nameHi: 'प्रयागराज', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Meerut', nameHi: 'मेरठ', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Jhansi', nameHi: 'झांसी', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Mathura', nameHi: 'मथुरा', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Ayodhya', nameHi: 'अयोध्या', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Gorakhpur', nameHi: 'गोरखपुर', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north' },
  { name: 'Jaipur', nameHi: 'जयपुर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north', isLocalPriority: true },
  { name: 'Jodhpur', nameHi: 'जोधपुर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north' },
  { name: 'Kota', nameHi: 'कोटा', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north' },
  { name: 'Udaipur', nameHi: 'उदयपुर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north' },
  { name: 'Bikaner', nameHi: 'बीकानेर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north' },
  { name: 'Ajmer', nameHi: 'अजमेर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north' },
  { name: 'Chandigarh', nameHi: 'चंडीगढ़', state: 'Chandigarh', stateHi: 'चंडीगढ़', region: 'north', isLocalPriority: true },
  { name: 'Ludhiana', nameHi: 'लुधियाना', state: 'Punjab', stateHi: 'पंजाब', region: 'north' },
  { name: 'Amritsar', nameHi: 'अमृतसर', state: 'Punjab', stateHi: 'पंजाब', region: 'north' },
  { name: 'Jalandhar', nameHi: 'जालंधर', state: 'Punjab', stateHi: 'पंजाब', region: 'north' },
  { name: 'Ambala', nameHi: 'अंबाला', state: 'Haryana', stateHi: 'हरियाणा', region: 'north' },
  { name: 'Panipat', nameHi: 'पानीपत', state: 'Haryana', stateHi: 'हरियाणा', region: 'north' },
  { name: 'Dehradun', nameHi: 'देहरादून', state: 'Uttarakhand', stateHi: 'उत्तराखंड', region: 'north' },
  { name: 'Haridwar', nameHi: 'हरिद्वार', state: 'Uttarakhand', stateHi: 'उत्तराखंड', region: 'north' },
  { name: 'Shimla', nameHi: 'शिमला', state: 'Himachal Pradesh', stateHi: 'हिमाचल प्रदेश', region: 'north' },
  { name: 'Jammu', nameHi: 'जम्मू', state: 'Jammu & Kashmir', stateHi: 'जम्मू और कश्मीर', region: 'north' },
  { name: 'Srinagar', nameHi: 'श्रीनगर', state: 'Jammu & Kashmir', stateHi: 'जम्मू और कश्मीर', region: 'north' },

  // --- WESTERN INDIA (Maharashtra, Gujarat, Goa) ---
  { name: 'Mumbai', nameHi: 'मुंबई', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', isLocalPriority: true },
  { name: 'Pune', nameHi: 'पुणे', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', isLocalPriority: true },
  { name: 'Nagpur', nameHi: 'नागपुर', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', isLocalPriority: true },
  { name: 'Nashik', nameHi: 'नासिक', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west' },
  { name: 'Chhatrapati Sambhajinagar', nameHi: 'छत्रपति संभाजीनगर (औरंगाबाद)', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west' },
  { name: 'Thane', nameHi: 'ठाणे', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west' },
  { name: 'Solapur', nameHi: 'सोलापुर', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west' },
  { name: 'Kolhapur', nameHi: 'कोल्हापुर', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west' },
  { name: 'Amravati', nameHi: 'अमरावती', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west' },
  { name: 'Jalgaon', nameHi: 'जलगांव', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west' },
  { name: 'Dhule', nameHi: 'धुले', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west' },
  { name: 'Ahmedabad', nameHi: 'अहमदाबाद', state: 'Gujarat', stateHi: 'गुजरात', region: 'west', isLocalPriority: true },
  { name: 'Surat', nameHi: 'सूरत', state: 'Gujarat', stateHi: 'गुजरात', region: 'west' },
  { name: 'Vadodara', nameHi: 'वडोदरा', state: 'Gujarat', stateHi: 'गुजरात', region: 'west' },
  { name: 'Rajkot', nameHi: 'राजकोट', state: 'Gujarat', stateHi: 'गुजरात', region: 'west' },
  { name: 'Bhavnagar', nameHi: 'भावनगर', state: 'Gujarat', stateHi: 'गुजरात', region: 'west' },
  { name: 'Jamnagar', nameHi: 'जामनगर', state: 'Gujarat', stateHi: 'गुजरात', region: 'west' },
  { name: 'Gandhinagar', nameHi: 'गांधीनगर', state: 'Gujarat', stateHi: 'गुजरात', region: 'west' },
  { name: 'Panaji', nameHi: 'पणजी (गोवा)', state: 'Goa', stateHi: 'गोवा', region: 'west' },

  // --- SOUTH INDIA (Karnataka, Telangana, Andhra Pradesh, Tamil Nadu, Kerala) ---
  { name: 'Bengaluru', nameHi: 'बेंगलुरु', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south', isLocalPriority: true },
  { name: 'Mysuru', nameHi: 'मैसूरु', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south' },
  { name: 'Hubballi', nameHi: 'हुबली-धारवाड़', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south' },
  { name: 'Mangaluru', nameHi: 'मंगलुरु', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south' },
  { name: 'Belagavi', nameHi: 'बेलगावी', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south' },
  { name: 'Hyderabad', nameHi: 'हैदराबाद', state: 'Telangana', stateHi: 'तेलंगाना', region: 'south', isLocalPriority: true },
  { name: 'Warangal', nameHi: 'वारंगल', state: 'Telangana', stateHi: 'तेलंगाना', region: 'south' },
  { name: 'Nizamabad', nameHi: 'निज़ामाबाद', state: 'Telangana', stateHi: 'तेलंगाना', region: 'south' },
  { name: 'Visakhapatnam', nameHi: 'विशाखापट्टनम', state: 'Andhra Pradesh', stateHi: 'आंध्र प्रदेश', region: 'south' },
  { name: 'Vijayawada', nameHi: 'विजयवाड़ा', state: 'Andhra Pradesh', stateHi: 'आंध्र प्रदेश', region: 'south' },
  { name: 'Tirupati', nameHi: 'तिरुपति', state: 'Andhra Pradesh', stateHi: 'आंध्र प्रदेश', region: 'south' },
  { name: 'Guntur', nameHi: 'गुंटूर', state: 'Andhra Pradesh', stateHi: 'आंध्र प्रदेश', region: 'south' },
  { name: 'Chennai', nameHi: 'चेन्नई', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south', isLocalPriority: true },
  { name: 'Coimbatore', nameHi: 'कोयंबटूर', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south' },
  { name: 'Madurai', nameHi: 'मदुरै', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south' },
  { name: 'Tiruchirappalli', nameHi: 'तिरुचिरापल्ली', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south' },
  { name: 'Salem', nameHi: 'सलेम', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south' },
  { name: 'Kochi', nameHi: 'कोच्चि', state: 'Kerala', stateHi: 'केरल', region: 'south' },
  { name: 'Thiruvananthapuram', nameHi: 'तिरुवनंतपुरम', state: 'Kerala', stateHi: 'केरल', region: 'south' },
  { name: 'Kozhikode', nameHi: 'कोझिकोड', state: 'Kerala', stateHi: 'केरल', region: 'south' },

  // --- EAST & CENTRAL / NORTH-EAST (Bengal, Bihar, Jharkhand, Odisha, Chhattisgarh, Assam, etc.) ---
  { name: 'Kolkata', nameHi: 'कोलकाता', state: 'West Bengal', stateHi: 'पश्चिम बंगाल', region: 'east', isLocalPriority: true },
  { name: 'Howrah', nameHi: 'हावड़ा', state: 'West Bengal', stateHi: 'पश्चिम बंगाल', region: 'east' },
  { name: 'Siliguri', nameHi: 'सिलीगुड़ी', state: 'West Bengal', stateHi: 'पश्चिम बंगाल', region: 'east' },
  { name: 'Durgapur', nameHi: 'दुर्गापुर', state: 'West Bengal', stateHi: 'पश्चिम बंगाल', region: 'east' },
  { name: 'Patna', nameHi: 'पटना', state: 'Bihar', stateHi: 'बिहार', region: 'east', isLocalPriority: true },
  { name: 'Gaya', nameHi: 'गया', state: 'Bihar', stateHi: 'बिहार', region: 'east' },
  { name: 'Bhagalpur', nameHi: 'भागलपुर', state: 'Bihar', stateHi: 'बिहार', region: 'east' },
  { name: 'Muzaffarpur', nameHi: 'मुजफ्फरपुर', state: 'Bihar', stateHi: 'बिहार', region: 'east' },
  { name: 'Ranchi', nameHi: 'रांची', state: 'Jharkhand', stateHi: 'झारखंड', region: 'east', isLocalPriority: true },
  { name: 'Jamshedpur', nameHi: 'जमशेदपुर', state: 'Jharkhand', stateHi: 'झारखंड', region: 'east' },
  { name: 'Dhanbad', nameHi: 'धनबाद', state: 'Jharkhand', stateHi: 'झारखंड', region: 'east' },
  { name: 'Bhubaneswar', nameHi: 'भुवनेश्वर', state: 'Odisha', stateHi: 'ओडिशा', region: 'east', isLocalPriority: true },
  { name: 'Cuttack', nameHi: 'कटक', state: 'Odisha', stateHi: 'ओडिशा', region: 'east' },
  { name: 'Rourkela', nameHi: 'राउरकेला', state: 'Odisha', stateHi: 'ओडिशा', region: 'east' },
  { name: 'Puri', nameHi: 'पुरी', state: 'Odisha', stateHi: 'ओडिशा', region: 'east' },
  { name: 'Raipur', nameHi: 'रायपुर', state: 'Chhattisgarh', stateHi: 'छत्तीसगढ़', region: 'east', isLocalPriority: true },
  { name: 'Bilaspur', nameHi: 'बिलासपुर', state: 'Chhattisgarh', stateHi: 'छत्तीसगढ़', region: 'east' },
  { name: 'Durg-Bhilai', nameHi: 'दुर्ग-भिलाई', state: 'Chhattisgarh', stateHi: 'छत्तीसगढ़', region: 'east' },
  { name: 'Guwahati', nameHi: 'गुवाहाटी', state: 'Assam', stateHi: 'असम', region: 'east', isLocalPriority: true },
  { name: 'Silchar', nameHi: 'सिलचर', state: 'Assam', stateHi: 'असम', region: 'east' },
  { name: 'Dibrugarh', nameHi: 'डिब्रूगढ़', state: 'Assam', stateHi: 'असम', region: 'east' },
  { name: 'Agartala', nameHi: 'अगरतला', state: 'Tripura', stateHi: 'त्रिपुरा', region: 'east' },
  { name: 'Shillong', nameHi: 'शिलांग', state: 'Meghalaya', stateHi: 'मेघालय', region: 'east' },
  { name: 'Imphal', nameHi: 'इम्फाल', state: 'Manipur', stateHi: 'मणिपुर', region: 'east' },
  { name: 'Aizawl', nameHi: 'आइजोल', state: 'Mizoram', stateHi: 'मिजोरम', region: 'east' },
  { name: 'Kohima', nameHi: 'कोहिमा', state: 'Nagaland', stateHi: 'नागालैंड', region: 'east' },
  { name: 'Gangtok', nameHi: 'गंगटोक', state: 'Sikkim', stateHi: 'सिक्किम', region: 'east' },
  { name: 'Itanagar', nameHi: 'ईटानगर', state: 'Arunachal Pradesh', stateHi: 'अरुणाचल प्रदेश', region: 'east' },
];

export const REGION_CATEGORIES = [
  { id: 'featured', labelEn: 'Featured & Local MP', labelHi: 'विशेष एवं मालवा-म.प्र.' },
  { id: 'mp', labelEn: 'Madhya Pradesh', labelHi: 'मध्य प्रदेश' },
  { id: 'north', labelEn: 'North (Delhi/UP/Raj/Pb)', labelHi: 'उत्तर भारत' },
  { id: 'west', labelEn: 'West (Maha/Guj/Goa)', labelHi: 'पश्चिम भारत' },
  { id: 'south', labelEn: 'South (Kar/Tel/AP/TN/Ker)', labelHi: 'दक्षिण भारत' },
  { id: 'east', labelEn: 'East & NE (Bengal/Bih/Od/Assam)', labelHi: 'पूर्व एवं पूर्वोत्तर' },
  { id: 'all', labelEn: 'All India Cities (100+)', labelHi: 'संपूर्ण भारत' },
] as const;

export function searchIndiaLocations(query: string): IndiaLocation[] {
  if (!query || query.trim() === '') return INDIA_LOCATIONS.slice(0, 30);
  const q = query.trim().toLowerCase();
  return INDIA_LOCATIONS.filter(
    loc =>
      loc.name.toLowerCase().includes(q) ||
      loc.nameHi.includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.stateHi.includes(q)
  );
}
