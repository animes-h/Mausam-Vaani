export interface IndiaLocation {
  name: string;
  nameHi: string;
  state: string;
  stateHi: string;
  region: 'mp' | 'north' | 'west' | 'south' | 'east';
  lat: number;
  lng: number;
  elevation?: number;
  district?: string;
  isLocalPriority?: boolean;
}

export interface Coord {
  lat: number;
  lng: number;
}

export const INDIA_LOCATIONS: IndiaLocation[] = [
  // --- MADHYA PRADESH (Local & Key Corridors) ---
  { name: 'Indore', nameHi: 'इंदौर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.7196, lng: 75.8577, elevation: 553, district: 'Indore', isLocalPriority: true },
  { name: 'Ujjain', nameHi: 'उज्जैन', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.1765, lng: 75.7885, elevation: 494, district: 'Ujjain', isLocalPriority: true },
  { name: 'Dewas', nameHi: 'देवास', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.9676, lng: 76.0534, elevation: 535, district: 'Dewas', isLocalPriority: true },
  { name: 'Bhopal', nameHi: 'भोपाल', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.2599, lng: 77.4126, elevation: 527, district: 'Bhopal', isLocalPriority: true },
  { name: 'Ashta', nameHi: 'आष्टा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.0189, lng: 76.7214, elevation: 504, district: 'Sehore', isLocalPriority: true },
  { name: 'Sehore', nameHi: 'सीहोर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.2033, lng: 77.0844, elevation: 502, district: 'Sehore', isLocalPriority: true },
  { name: 'Ratlam', nameHi: 'रतलाम', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.3315, lng: 75.0367, elevation: 488, district: 'Ratlam', isLocalPriority: true },
  { name: 'Shajapur', nameHi: 'शाजापुर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.4285, lng: 76.2755, elevation: 454, district: 'Shajapur', isLocalPriority: true },
  { name: 'Sanwer', nameHi: 'सांवेर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.9774, lng: 75.8286, elevation: 531, district: 'Indore', isLocalPriority: true },
  { name: 'Sonkatch', nameHi: 'सोनकच्छ', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.9818, lng: 76.3687, elevation: 440, district: 'Dewas', isLocalPriority: true },
  { name: 'Maksi', nameHi: 'मक्सी', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.2625, lng: 76.1475, elevation: 480, district: 'Shajapur', isLocalPriority: true },
  { name: 'Dhar', nameHi: 'धार', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.5975, lng: 75.2974, elevation: 559, district: 'Dhar', isLocalPriority: true },
  { name: 'Khargone', nameHi: 'खरगोन', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 21.8228, lng: 75.6111, elevation: 258, district: 'Khargone', isLocalPriority: true },
  { name: 'Khandwa', nameHi: 'खंडवा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 21.8314, lng: 76.3498, elevation: 313, district: 'Khandwa', isLocalPriority: true },
  { name: 'Mhow', nameHi: 'महू (डॉ. अम्बेडकर नगर)', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.5539, lng: 75.7548, elevation: 585, district: 'Indore', isLocalPriority: true },
  { name: 'Gwalior', nameHi: 'ग्वालियर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 26.2183, lng: 78.1828, elevation: 197, district: 'Gwalior', isLocalPriority: true },
  { name: 'Jabalpur', nameHi: 'जबलपुर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.1815, lng: 79.9864, elevation: 411, district: 'Jabalpur', isLocalPriority: true },
  { name: 'Sagar', nameHi: 'सागर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.8388, lng: 78.7378, elevation: 536, district: 'Sagar', isLocalPriority: true },
  { name: 'Rewa', nameHi: 'रीवा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 24.5362, lng: 81.3037, elevation: 304, district: 'Rewa', isLocalPriority: true },
  { name: 'Satna', nameHi: 'सतना', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 24.6005, lng: 80.8322, elevation: 315, district: 'Satna', isLocalPriority: true },
  { name: 'Narmadapuram', nameHi: 'नर्मदापुरम (होशंगाबाद)', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.7519, lng: 77.7289, elevation: 278, district: 'Narmadapuram', isLocalPriority: true },
  { name: 'Pipariya', nameHi: 'पिपरिया', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.7619, lng: 78.3553, elevation: 320, district: 'Narmadapuram' },
  { name: 'Narsinghpur', nameHi: 'नरसिंहपुर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.9469, lng: 79.1952, elevation: 350, district: 'Narsinghpur' },
  { name: 'Vidisha', nameHi: 'विदिशा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.5251, lng: 77.8081, elevation: 428, district: 'Vidisha' },
  { name: 'Neemuch', nameHi: 'नीमच', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 24.4754, lng: 74.8693, elevation: 452, district: 'Neemuch' },
  { name: 'Mandsaur', nameHi: 'मंदसौर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 24.0722, lng: 75.0684, elevation: 428, district: 'Mandsaur' },
  { name: 'Barwani', nameHi: 'बड़वानी', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.0368, lng: 74.9030, elevation: 178, district: 'Barwani' },
  { name: 'Harda', nameHi: 'हरदा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.3444, lng: 77.0945, elevation: 296, district: 'Harda' },
  { name: 'Betul', nameHi: 'बैतूल', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 21.9014, lng: 77.9022, elevation: 658, district: 'Betul' },
  { name: 'Chhindwara', nameHi: 'छिंदवाड़ा', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 22.0574, lng: 78.9382, elevation: 675, district: 'Chhindwara' },
  { name: 'Shivpuri', nameHi: 'शिवपुरी', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 25.4326, lng: 77.6583, elevation: 468, district: 'Shivpuri' },
  { name: 'Guna', nameHi: 'गुना', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 24.6324, lng: 77.3006, elevation: 474, district: 'Guna' },
  { name: 'Katni', nameHi: 'कटनी', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.8343, lng: 80.3957, elevation: 304, district: 'Katni' },
  { name: 'Burhanpur', nameHi: 'बुरहानपुर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 21.3145, lng: 76.2299, elevation: 233, district: 'Burhanpur' },
  { name: 'Singrauli', nameHi: 'सिंगरौली', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 24.1992, lng: 82.6645, elevation: 463, district: 'Singrauli' },
  { name: 'Damoh', nameHi: 'दमोह', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 23.8382, lng: 79.4422, elevation: 395, district: 'Damoh' },
  { name: 'Chhatarpur', nameHi: 'छतरपुर', state: 'Madhya Pradesh', stateHi: 'मध्य प्रदेश', region: 'mp', lat: 24.9164, lng: 79.5811, elevation: 305, district: 'Chhatarpur' },

  // --- NORTH INDIA (Delhi NCR, UP, Rajasthan, Punjab, Haryana, Uttarakhand, HP, J&K) ---
  { name: 'New Delhi', nameHi: 'नई दिल्ली', state: 'Delhi', stateHi: 'दिल्ली', region: 'north', lat: 28.6139, lng: 77.2090, elevation: 216, district: 'New Delhi', isLocalPriority: true },
  { name: 'Delhi', nameHi: 'दिल्ली', state: 'Delhi', stateHi: 'दिल्ली', region: 'north', lat: 28.6139, lng: 77.2090, elevation: 216, district: 'Delhi' },
  { name: 'Noida', nameHi: 'नोएडा', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 28.5355, lng: 77.3910, elevation: 200, district: 'Gautam Buddha Nagar' },
  { name: 'Greater Noida', nameHi: 'ग्रेटर नोएडा', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 28.4744, lng: 77.5040, elevation: 200, district: 'Gautam Buddha Nagar' },
  { name: 'Gurugram', nameHi: 'गुरुग्राम', state: 'Haryana', stateHi: 'हरियाणा', region: 'north', lat: 28.4595, lng: 77.0266, elevation: 217, district: 'Gurugram' },
  { name: 'Faridabad', nameHi: 'फरीदाबाद', state: 'Haryana', stateHi: 'हरियाणा', region: 'north', lat: 28.4089, lng: 77.3178, elevation: 205, district: 'Faridabad' },
  { name: 'Ghaziabad', nameHi: 'गाजियाबाद', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 28.6692, lng: 77.4538, elevation: 214, district: 'Ghaziabad' },
  { name: 'Lucknow', nameHi: 'लखनऊ', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.8467, lng: 80.9462, elevation: 123, district: 'Lucknow', isLocalPriority: true },
  { name: 'Vrindavan Yojna, Lucknow', nameHi: 'वृंदावन योजना, लखनऊ', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.7676, lng: 80.9462, elevation: 120, district: 'Lucknow' },
  { name: 'Kanpur', nameHi: 'कानपुर', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.4499, lng: 80.3319, elevation: 126, district: 'Kanpur' },
  { name: 'Unnao', nameHi: 'उन्नाव', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.5458, lng: 80.4878, elevation: 128, district: 'Unnao' },
  { name: 'Agra', nameHi: 'आगरा', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 27.1767, lng: 78.0081, elevation: 171, district: 'Agra' },
  { name: 'Mathura', nameHi: 'मथुरा', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 27.4924, lng: 77.6737, elevation: 174, district: 'Mathura' },
  { name: 'Vrindavan', nameHi: 'वृंदावन', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 27.5806, lng: 77.7006, elevation: 170, district: 'Mathura' },
  { name: 'Firozabad', nameHi: 'फिरोजाबाद', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 27.1592, lng: 78.3957, elevation: 164, district: 'Firozabad' },
  { name: 'Etawah', nameHi: 'इटावा', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.7855, lng: 79.0154, elevation: 153, district: 'Etawah' },
  { name: 'Auraiya', nameHi: 'औरैया', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.4674, lng: 79.5165, elevation: 137, district: 'Auraiya' },
  { name: 'Kannauj', nameHi: 'कन्नौज', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 27.0543, lng: 79.9199, elevation: 139, district: 'Kannauj' },
  { name: 'Varanasi', nameHi: 'वाराणसी', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 25.3176, lng: 82.9739, elevation: 81, district: 'Varanasi' },
  { name: 'Prayagraj', nameHi: 'प्रयागराज', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 25.4358, lng: 81.8463, elevation: 98, district: 'Prayagraj' },
  { name: 'Meerut', nameHi: 'मेरठ', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 28.9845, lng: 77.7064, elevation: 219, district: 'Meerut' },
  { name: 'Bareilly', nameHi: 'बरेली', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 28.3670, lng: 79.4304, elevation: 168, district: 'Bareilly' },
  { name: 'Aligarh', nameHi: 'अलीगढ़', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 27.8974, lng: 78.0880, elevation: 187, district: 'Aligarh' },
  { name: 'Moradabad', nameHi: 'मुरादाबाद', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 28.8386, lng: 78.7733, elevation: 198, district: 'Moradabad' },
  { name: 'Jhansi', nameHi: 'झांसी', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 25.4484, lng: 78.5685, elevation: 284, district: 'Jhansi' },
  { name: 'Ayodhya', nameHi: 'अयोध्या', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.7922, lng: 82.1998, elevation: 102, district: 'Ayodhya' },
  { name: 'Gorakhpur', nameHi: 'गोरखपुर', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.7606, lng: 83.3732, elevation: 84, district: 'Gorakhpur' },
  { name: 'Sultanpur', nameHi: 'सुल्तानपुर', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.2648, lng: 82.0727, elevation: 95, district: 'Sultanpur' },
  { name: 'Jaunpur', nameHi: 'जौनपुर', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 25.7464, lng: 82.6837, elevation: 82, district: 'Jaunpur' },
  { name: 'Raebareli', nameHi: 'रायबरेली', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'north', lat: 26.2303, lng: 81.2409, elevation: 111, district: 'Raebareli' },
  { name: 'Jaipur', nameHi: 'जयपुर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north', lat: 26.9124, lng: 75.7873, elevation: 431, district: 'Jaipur', isLocalPriority: true },
  { name: 'Jodhpur', nameHi: 'जोधपुर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north', lat: 26.2389, lng: 73.0243, elevation: 231, district: 'Jodhpur' },
  { name: 'Kota', nameHi: 'कोटा', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north', lat: 25.2138, lng: 75.8648, elevation: 271, district: 'Kota' },
  { name: 'Udaipur', nameHi: 'उदयपुर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north', lat: 24.5854, lng: 73.7125, elevation: 598, district: 'Udaipur' },
  { name: 'Bikaner', nameHi: 'बीकानेर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north', lat: 28.0229, lng: 73.3119, elevation: 242, district: 'Bikaner' },
  { name: 'Ajmer', nameHi: 'अजमेर', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north', lat: 26.4499, lng: 74.6399, elevation: 480, district: 'Ajmer' },
  { name: 'Dausa', nameHi: 'दौसा', state: 'Rajasthan', stateHi: 'राजस्थान', region: 'north', lat: 26.8932, lng: 76.3377, elevation: 333, district: 'Dausa' },
  { name: 'Chandigarh', nameHi: 'चंडीगढ़', state: 'Chandigarh', stateHi: 'चंडीगढ़', region: 'north', lat: 30.7333, lng: 76.7794, elevation: 321, district: 'Chandigarh', isLocalPriority: true },
  { name: 'Ludhiana', nameHi: 'लुधियाना', state: 'Punjab', stateHi: 'पंजाब', region: 'north', lat: 30.9010, lng: 75.8573, elevation: 244, district: 'Ludhiana' },
  { name: 'Amritsar', nameHi: 'अमृतसर', state: 'Punjab', stateHi: 'पंजाब', region: 'north', lat: 31.6340, lng: 74.8723, elevation: 234, district: 'Amritsar' },
  { name: 'Jalandhar', nameHi: 'जालंधर', state: 'Punjab', stateHi: 'पंजाब', region: 'north', lat: 31.3260, lng: 75.5762, elevation: 228, district: 'Jalandhar' },
  { name: 'Ambala', nameHi: 'अंबाला', state: 'Haryana', stateHi: 'हरियाणा', region: 'north', lat: 30.3782, lng: 76.7767, elevation: 264, district: 'Ambala' },
  { name: 'Karnal', nameHi: 'करनाल', state: 'Haryana', stateHi: 'हरियाणा', region: 'north', lat: 29.6857, lng: 76.9905, elevation: 253, district: 'Karnal' },
  { name: 'Panipat', nameHi: 'पानीपत', state: 'Haryana', stateHi: 'हरियाणा', region: 'north', lat: 29.3909, lng: 76.9635, elevation: 219, district: 'Panipat' },
  { name: 'Dehradun', nameHi: 'देहरादून', state: 'Uttarakhand', stateHi: 'उत्तराखंड', region: 'north', lat: 30.3165, lng: 78.0322, elevation: 435, district: 'Dehradun' },
  { name: 'Haridwar', nameHi: 'हरिद्वार', state: 'Uttarakhand', stateHi: 'उत्तराखंड', region: 'north', lat: 29.9457, lng: 78.1642, elevation: 314, district: 'Haridwar' },
  { name: 'Shimla', nameHi: 'शिमला', state: 'Himachal Pradesh', stateHi: 'हिमाचल प्रदेश', region: 'north', lat: 31.1048, lng: 77.1734, elevation: 2276, district: 'Shimla' },
  { name: 'Jammu', nameHi: 'जम्मू', state: 'Jammu & Kashmir', stateHi: 'जम्मू और कश्मीर', region: 'north', lat: 32.7266, lng: 74.8570, elevation: 327, district: 'Jammu' },
  { name: 'Srinagar', nameHi: 'श्रीनगर', state: 'Jammu & Kashmir', stateHi: 'जम्मू और कश्मीर', region: 'north', lat: 34.0837, lng: 74.7973, elevation: 1585, district: 'Srinagar' },

  // --- WESTERN INDIA (Maharashtra, Gujarat, Goa) ---
  { name: 'Mumbai', nameHi: 'मुंबई', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 19.0760, lng: 72.8777, elevation: 14, district: 'Mumbai City', isLocalPriority: true },
  { name: 'Navi Mumbai', nameHi: 'नवी मुंबई', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 19.0330, lng: 73.0297, elevation: 10, district: 'Thane' },
  { name: 'Lonavala', nameHi: 'लोनावला', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 18.7557, lng: 73.4091, elevation: 624, district: 'Pune' },
  { name: 'Pune', nameHi: 'पुणे', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 18.5204, lng: 73.8567, elevation: 560, district: 'Pune', isLocalPriority: true },
  { name: 'Nagpur', nameHi: 'नागपुर', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 21.1458, lng: 79.0882, elevation: 310, district: 'Nagpur', isLocalPriority: true },
  { name: 'Nashik', nameHi: 'नासिक', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 19.9975, lng: 73.7898, elevation: 560, district: 'Nashik' },
  { name: 'Chhatrapati Sambhajinagar', nameHi: 'छत्रपति संभाजीनगर (औरंगाबाद)', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 19.8762, lng: 75.3433, elevation: 568, district: 'Chhatrapati Sambhajinagar' },
  { name: 'Thane', nameHi: 'ठाणे', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 19.2183, lng: 72.9781, elevation: 7, district: 'Thane' },
  { name: 'Solapur', nameHi: 'सोलापुर', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 17.6599, lng: 75.9064, elevation: 458, district: 'Solapur' },
  { name: 'Kolhapur', nameHi: 'कोल्हापुर', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 16.7050, lng: 74.2433, elevation: 569, district: 'Kolhapur' },
  { name: 'Amravati', nameHi: 'अमरावती', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 20.9374, lng: 77.7796, elevation: 343, district: 'Amravati' },
  { name: 'Jalgaon', nameHi: 'जलगांव', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 21.0077, lng: 75.5626, elevation: 209, district: 'Jalgaon' },
  { name: 'Dhule', nameHi: 'धुले', state: 'Maharashtra', stateHi: 'महाराष्ट्र', region: 'west', lat: 20.9042, lng: 74.7749, elevation: 240, district: 'Dhule' },
  { name: 'Ahmedabad', nameHi: 'अहमदाबाद', state: 'Gujarat', stateHi: 'गुजरात', region: 'west', lat: 23.0225, lng: 72.5714, elevation: 53, district: 'Ahmedabad', isLocalPriority: true },
  { name: 'Surat', nameHi: 'सूरत', state: 'Gujarat', stateHi: 'गुजरात', region: 'west', lat: 21.1702, lng: 72.8311, elevation: 13, district: 'Surat' },
  { name: 'Vadodara', nameHi: 'वडोदरा', state: 'Gujarat', stateHi: 'गुजरात', region: 'west', lat: 22.3072, lng: 73.1812, elevation: 39, district: 'Vadodara' },
  { name: 'Rajkot', nameHi: 'राजकोट', state: 'Gujarat', stateHi: 'गुजरात', region: 'west', lat: 22.3039, lng: 70.8022, elevation: 128, district: 'Rajkot' },
  { name: 'Bhavnagar', nameHi: 'भावनगर', state: 'Gujarat', stateHi: 'गुजरात', region: 'west', lat: 21.7645, lng: 72.1519, elevation: 24, district: 'Bhavnagar' },
  { name: 'Jamnagar', nameHi: 'जामनगर', state: 'Gujarat', stateHi: 'गुजरात', region: 'west', lat: 22.4707, lng: 70.0577, elevation: 20, district: 'Jamnagar' },
  { name: 'Gandhinagar', nameHi: 'गांधीनगर', state: 'Gujarat', stateHi: 'गुजरात', region: 'west', lat: 23.2156, lng: 72.6369, elevation: 81, district: 'Gandhinagar' },
  { name: 'Panaji', nameHi: 'पणजी (गोवा)', state: 'Goa', stateHi: 'गोवा', region: 'west', lat: 15.4909, lng: 73.8278, elevation: 7, district: 'North Goa' },

  // --- SOUTH INDIA (Karnataka, Telangana, Andhra Pradesh, Tamil Nadu, Kerala) ---
  { name: 'Bengaluru', nameHi: 'बेंगलुरु', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south', lat: 12.9716, lng: 77.5946, elevation: 920, district: 'Bengaluru Urban', isLocalPriority: true },
  { name: 'Mysuru', nameHi: 'मैसूरु', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south', lat: 12.2958, lng: 76.6394, elevation: 763, district: 'Mysuru' },
  { name: 'Hubballi', nameHi: 'हुबली-धारवाड़', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south', lat: 15.3647, lng: 75.1240, elevation: 671, district: 'Dharwad' },
  { name: 'Mangaluru', nameHi: 'मंगलुरु', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south', lat: 12.9141, lng: 74.8560, elevation: 22, district: 'Dakshina Kannada' },
  { name: 'Belagavi', nameHi: 'बेलगावी', state: 'Karnataka', stateHi: 'कर्नाटक', region: 'south', lat: 15.8497, lng: 74.4977, elevation: 762, district: 'Belagavi' },
  { name: 'Hyderabad', nameHi: 'हैदराबाद', state: 'Telangana', stateHi: 'तेलंगाना', region: 'south', lat: 17.3850, lng: 78.4867, elevation: 542, district: 'Hyderabad', isLocalPriority: true },
  { name: 'Warangal', nameHi: 'वारंगल', state: 'Telangana', stateHi: 'तेलंगाना', region: 'south', lat: 17.9689, lng: 79.5941, elevation: 302, district: 'Warangal' },
  { name: 'Nizamabad', nameHi: 'निज़ामाबाद', state: 'Telangana', stateHi: 'तेलंगाना', region: 'south', lat: 18.6725, lng: 78.0941, elevation: 395, district: 'Nizamabad' },
  { name: 'Visakhapatnam', nameHi: 'विशाखापट्टनम', state: 'Andhra Pradesh', stateHi: 'आंध्र प्रदेश', region: 'south', lat: 17.6868, lng: 83.2185, elevation: 45, district: 'Visakhapatnam' },
  { name: 'Vijayawada', nameHi: 'विजयवाड़ा', state: 'Andhra Pradesh', stateHi: 'आंध्र प्रदेश', region: 'south', lat: 16.5062, lng: 80.6480, elevation: 23, district: 'NTR' },
  { name: 'Tirupati', nameHi: 'तिरुपति', state: 'Andhra Pradesh', stateHi: 'आंध्र प्रदेश', region: 'south', lat: 13.6288, lng: 79.4192, elevation: 161, district: 'Tirupati' },
  { name: 'Guntur', nameHi: 'गुंटूर', state: 'Andhra Pradesh', stateHi: 'आंध्र प्रदेश', region: 'south', lat: 16.3067, lng: 80.4365, elevation: 33, district: 'Guntur' },
  { name: 'Chennai', nameHi: 'चेन्नई', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south', lat: 13.0827, lng: 80.2707, elevation: 6, district: 'Chennai', isLocalPriority: true },
  { name: 'Coimbatore', nameHi: 'कोयंबटूर', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south', lat: 11.0168, lng: 76.9558, elevation: 411, district: 'Coimbatore' },
  { name: 'Madurai', nameHi: 'मदुरै', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south', lat: 9.9252, lng: 78.1198, elevation: 136, district: 'Madurai' },
  { name: 'Tiruchirappalli', nameHi: 'तिरुचिरापल्ली', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south', lat: 10.7905, lng: 78.7047, elevation: 88, district: 'Tiruchirappalli' },
  { name: 'Salem', nameHi: 'सलेम', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south', lat: 11.6643, lng: 78.1460, elevation: 278, district: 'Salem' },
  { name: 'Hosur', nameHi: 'होसुर', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south', lat: 12.7409, lng: 77.8253, elevation: 879, district: 'Krishnagiri' },
  { name: 'Krishnagiri', nameHi: 'कृष्णागिरि', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south', lat: 12.5186, lng: 78.2137, elevation: 491, district: 'Krishnagiri' },
  { name: 'Vellore', nameHi: 'वेल्लोर', state: 'Tamil Nadu', stateHi: 'तमिलनाडु', region: 'south', lat: 12.9165, lng: 79.1325, elevation: 216, district: 'Vellore' },
  { name: 'Kochi', nameHi: 'कोच्चि', state: 'Kerala', stateHi: 'केरल', region: 'south', lat: 9.9312, lng: 76.2673, elevation: 5, district: 'Ernakulam' },
  { name: 'Thiruvananthapuram', nameHi: 'तिरुवनंतपुरम', state: 'Kerala', stateHi: 'केरल', region: 'south', lat: 8.5241, lng: 76.9366, elevation: 10, district: 'Thiruvananthapuram' },
  { name: 'Kozhikode', nameHi: 'कोझिकोड', state: 'Kerala', stateHi: 'केरल', region: 'south', lat: 11.2588, lng: 75.7804, elevation: 1, district: 'Kozhikode' },

  // --- EAST & CENTRAL / NORTH-EAST (Bengal, Bihar, Jharkhand, Odisha, Chhattisgarh, Assam, etc.) ---
  { name: 'Kolkata', nameHi: 'कोलकाता', state: 'West Bengal', stateHi: 'पश्चिम बंगाल', region: 'east', lat: 22.5726, lng: 88.3639, elevation: 9, district: 'Kolkata', isLocalPriority: true },
  { name: 'Howrah', nameHi: 'हावड़ा', state: 'West Bengal', stateHi: 'पश्चिम बंगाल', region: 'east', lat: 22.5958, lng: 88.2636, elevation: 12, district: 'Howrah' },
  { name: 'Siliguri', nameHi: 'सिलीगुड़ी', state: 'West Bengal', stateHi: 'पश्चिम बंगाल', region: 'east', lat: 26.7271, lng: 88.3953, elevation: 122, district: 'Darjeeling' },
  { name: 'Durgapur', nameHi: 'दुर्गापुर', state: 'West Bengal', stateHi: 'पश्चिम बंगाल', region: 'east', lat: 23.5204, lng: 87.3119, elevation: 65, district: 'Paschim Bardhaman' },
  { name: 'Patna', nameHi: 'पटना', state: 'Bihar', stateHi: 'बिहार', region: 'east', lat: 25.5941, lng: 85.1376, elevation: 53, district: 'Patna', isLocalPriority: true },
  { name: 'Gaya', nameHi: 'गया', state: 'Bihar', stateHi: 'बिहार', region: 'east', lat: 24.7914, lng: 85.0002, elevation: 111, district: 'Gaya' },
  { name: 'Bhagalpur', nameHi: 'भागलपुर', state: 'Bihar', stateHi: 'बिहार', region: 'east', lat: 25.2425, lng: 86.9842, elevation: 52, district: 'Bhagalpur' },
  { name: 'Muzaffarpur', nameHi: 'मुजफ्फरपुर', state: 'Bihar', stateHi: 'बिहार', region: 'east', lat: 26.1209, lng: 85.3647, elevation: 60, district: 'Muzaffarpur' },
  { name: 'Buxar', nameHi: 'बक्सर', state: 'Bihar', stateHi: 'बिहार', region: 'east', lat: 25.5647, lng: 83.9777, elevation: 65, district: 'Buxar' },
  { name: 'Ghazipur', nameHi: 'गाजीपुर', state: 'Uttar Pradesh', stateHi: 'उत्तर प्रदेश', region: 'east', lat: 25.5840, lng: 83.5770, elevation: 67, district: 'Ghazipur' },
  { name: 'Ranchi', nameHi: 'रांची', state: 'Jharkhand', stateHi: 'झारखंड', region: 'east', lat: 23.3441, lng: 85.3096, elevation: 651, district: 'Ranchi', isLocalPriority: true },
  { name: 'Jamshedpur', nameHi: 'जमशेदपुर', state: 'Jharkhand', stateHi: 'झारखंड', region: 'east', lat: 22.8046, lng: 86.2029, elevation: 135, district: 'East Singhbhum' },
  { name: 'Dhanbad', nameHi: 'धनबाद', state: 'Jharkhand', stateHi: 'झारखंड', region: 'east', lat: 23.7957, lng: 86.4304, elevation: 227, district: 'Dhanbad' },
  { name: 'Bhubaneswar', nameHi: 'भुवनेश्वर', state: 'Odisha', stateHi: 'ओडिशा', region: 'east', lat: 20.2961, lng: 85.8245, elevation: 45, district: 'Khurda', isLocalPriority: true },
  { name: 'Cuttack', nameHi: 'कटक', state: 'Odisha', stateHi: 'ओडिशा', region: 'east', lat: 20.4625, lng: 85.8828, elevation: 36, district: 'Cuttack' },
  { name: 'Rourkela', nameHi: 'राउरकेला', state: 'Odisha', stateHi: 'ओडिशा', region: 'east', lat: 22.2604, lng: 84.8536, elevation: 219, district: 'Sundargarh' },
  { name: 'Puri', nameHi: 'पुरी', state: 'Odisha', stateHi: 'ओडिशा', region: 'east', lat: 19.8135, lng: 85.8312, elevation: 0, district: 'Puri' },
  { name: 'Raipur', nameHi: 'रायपुर', state: 'Chhattisgarh', stateHi: 'छत्तीसगढ़', region: 'east', lat: 21.2514, lng: 81.6296, elevation: 298, district: 'Raipur', isLocalPriority: true },
  { name: 'Bilaspur', nameHi: 'बिलासपुर', state: 'Chhattisgarh', stateHi: 'छत्तीसगढ़', region: 'east', lat: 22.0797, lng: 82.1409, elevation: 264, district: 'Bilaspur' },
  { name: 'Durg-Bhilai', nameHi: 'दुर्ग-भिलाई', state: 'Chhattisgarh', stateHi: 'छत्तीसगढ़', region: 'east', lat: 21.1938, lng: 81.2849, elevation: 290, district: 'Durg' },
  { name: 'Guwahati', nameHi: 'गुवाहाटी', state: 'Assam', stateHi: 'असम', region: 'east', lat: 26.1445, lng: 91.7362, elevation: 55, district: 'Kamrup Metropolitan', isLocalPriority: true },
  { name: 'Silchar', nameHi: 'सिलचर', state: 'Assam', stateHi: 'असम', region: 'east', lat: 24.8333, lng: 92.7789, elevation: 22, district: 'Cachar' },
  { name: 'Dibrugarh', nameHi: 'डिब्रूगढ़', state: 'Assam', stateHi: 'असम', region: 'east', lat: 27.4728, lng: 94.9120, elevation: 108, district: 'Dibrugarh' },
  { name: 'Agartala', nameHi: 'अगरतला', state: 'Tripura', stateHi: 'त्रिपुरा', region: 'east', lat: 23.8315, lng: 91.2868, elevation: 15, district: 'West Tripura' },
  { name: 'Shillong', nameHi: 'शिलांग', state: 'Meghalaya', stateHi: 'मेघालय', region: 'east', lat: 25.5788, lng: 91.8933, elevation: 1525, district: 'East Khasi Hills' },
  { name: 'Imphal', nameHi: 'इम्फाल', state: 'Manipur', stateHi: 'मणिपुर', region: 'east', lat: 24.8170, lng: 93.9368, elevation: 786, district: 'Imphal West' },
  { name: 'Aizawl', nameHi: 'आइजोल', state: 'Mizoram', stateHi: 'मिजोरम', region: 'east', lat: 23.7271, lng: 92.7176, elevation: 1132, district: 'Aizawl' },
  { name: 'Kohima', nameHi: 'कोहिमा', state: 'Nagaland', stateHi: 'नागालैंड', region: 'east', lat: 25.6751, lng: 94.1086, elevation: 1444, district: 'Kohima' },
  { name: 'Gangtok', nameHi: 'गंगटोक', state: 'Sikkim', stateHi: 'सिक्किम', region: 'east', lat: 27.3389, lng: 88.6065, elevation: 1650, district: 'East Sikkim' },
  { name: 'Itanagar', nameHi: 'ईटानगर', state: 'Arunachal Pradesh', stateHi: 'अरुणाचल प्रदेश', region: 'east', lat: 27.0844, lng: 93.6053, elevation: 320, district: 'Papum Pare' },
];

/**
 * Global Indian City & Highway Node Coordinates dictionary
 * Generated directly from INDIA_LOCATIONS to eliminate coordinate redundancy.
 */
export const CITY_COORDS: Record<string, Coord> = INDIA_LOCATIONS.reduce((acc, loc) => {
  acc[loc.name.toLowerCase()] = { lat: loc.lat, lng: loc.lng };
  return acc;
}, {} as Record<string, Coord>);

// Additional highway aliases / synonyms
CITY_COORDS['delhi'] = { lat: 28.6139, lng: 77.2090 };
CITY_COORDS['allahabad'] = { lat: 25.4358, lng: 81.8463 };
CITY_COORDS['aurangabad'] = { lat: 19.8762, lng: 75.3433 };
CITY_COORDS['vrindavan yojna'] = { lat: 26.7676, lng: 80.9462 };

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
      loc.stateHi.includes(q) ||
      (loc.district && loc.district.toLowerCase().includes(q))
  );
}

// In-memory dynamic geocoding cache for custom searched locations
export const DYNAMIC_GEOCODE_CACHE: Record<string, Coord> = {};

/**
 * Universal lookup helper to retrieve { lat, lng } for any Indian city or locality
 */
export function findCityCoords(cityName: string, customCoords?: Record<string, Coord>): Coord {
  if (!cityName) return { lat: 28.6139, lng: 77.2090 };
  const clean = cityName.toLowerCase().trim();
  if (customCoords && customCoords[clean]) return customCoords[clean];
  if (DYNAMIC_GEOCODE_CACHE[clean]) return DYNAMIC_GEOCODE_CACHE[clean];
  if (CITY_COORDS[clean]) return CITY_COORDS[clean];

  for (const [key, coord] of Object.entries(CITY_COORDS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coord;
    }
  }

  const found = INDIA_LOCATIONS.find(
    c => c.name.toLowerCase() === clean || c.nameHi === clean || clean.includes(c.name.toLowerCase())
  );
  if (found) {
    return { lat: found.lat, lng: found.lng };
  }

  // Fallback to Gangetic / Central plain baseline
  return { lat: 26.8467, lng: 80.9462 };
}
