'use client';

import React, { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { diagnoseSoilFromPhoto, STANDARD_SOIL_TYPES } from '@/lib/cropAdvisorService';

export default function KisanLandSetup() {
  const {
    language,
    soilConfig,
    setSoilConfig,
    setActiveKisanTab,
    playSpeech,
    networkMode,
  } = useApp();

  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectSoil = (soil: typeof STANDARD_SOIL_TYPES[0]) => {
    setSoilConfig(prev => ({
      ...prev,
      soilType: soil.id,
      soilNameEn: soil.nameEn,
      soilNameHi: soil.nameHi,
      soilClass: soil.classType,
      moistureCapacity: soil.moistureCapacity,
      moisturePercentage: soil.moisturePercentage,
      organicContent: soil.organicContent,
      phValue: soil.ph,
      drainageRate: soil.drainageRate,
    }));

    if (networkMode !== 'degraded') {
      const msg = language === 'hi'
        ? `${soil.nameHi} चुनी गई। ${soil.descriptionHi}`
        : `Selected ${soil.nameEn}. ${soil.descriptionEn}`;
      playSpeech(msg);
    }
  };

  const handleSelectWaterSource = (source: 'tubewell' | 'canal' | 'rainfed') => {
    setSoilConfig(prev => ({ ...prev, waterSource: source }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanMessage(
      language === 'hi'
        ? 'मिट्टी की फोटो का AI विश्लेषण किया जा रहा है...'
        : 'Analyzing soil photo with AI...'
    );

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const diag = await diagnoseSoilFromPhoto(base64);

      setSoilConfig(prev => ({
        ...prev,
        photoUrl: base64,
        aiDiagnosis: {
          identifiedType: diag.identifiedType,
          textureDescription: diag.textureDescription,
          moistureEstimate: diag.moistureEstimate,
          isApproximate: true,
        },
      }));

      setIsScanning(false);
      const resText = language === 'hi'
        ? `फोटो विश्लेषण पूरा हुआ: ${diag.identifiedTypeHi} पहचानी गई। नमी लगभग ${diag.moistureEstimate} है। (यह केवल अनुमानित जांच है)`
        : `Photo diagnosis complete: ${diag.identifiedType}. Moisture: ${diag.moistureEstimate} (Approximate assessment).`;

      setScanMessage(resText);
      playSpeech(resText);
    };
    reader.readAsDataURL(file);
  };

  const handleTestSamplePhoto = async () => {
    setIsScanning(true);
    setScanMessage(
      language === 'hi'
        ? 'नमूना काली कपासिया मिट्टी का AI विश्लेषण किया जा रहा है...'
        : 'Running AI diagnosis on sample Vertisol soil...'
    );

    const sampleDiag = await diagnoseSoilFromPhoto('sample_soil_image_data');
    setSoilConfig(prev => ({
      ...prev,
      photoUrl: STANDARD_SOIL_TYPES[0].image,
      aiDiagnosis: {
        identifiedType: sampleDiag.identifiedType,
        textureDescription: sampleDiag.textureDescription,
        moistureEstimate: sampleDiag.moistureEstimate,
        isApproximate: true,
      },
    }));

    setIsScanning(false);
    const resText = language === 'hi'
      ? `AI परख पूर्ण: ${sampleDiag.identifiedTypeHi} पहचानी गई। नमी लगभग ${sampleDiag.moistureEstimate}।`
      : `AI diagnosis: ${sampleDiag.identifiedType}. Moisture: ${sampleDiag.moistureEstimate}.`;
    setScanMessage(resText);
    playSpeech(resText);
  };

  const handleSaveAndNext = () => {
    setIsSaving(true);
    const saveNotice = language === 'hi'
      ? 'खेत विवरण सहेज लिया गया। फसल सलाह लोड हो रही है...'
      : 'Farm profile saved! Loading tailored crop recommendations...';
    playSpeech(saveNotice);

    setTimeout(() => {
      setIsSaving(false);
      setActiveKisanTab('crop-advisory');
    }, 600);
  };

  const playInstructionsAudio = () => {
    const script = language === 'hi'
      ? 'कृपया अपनी ज़मीन की मिट्टी चुनें। यदि मिट्टी का नाम नहीं पता, तो कैमरा बटन दबाकर खेत की मिट्टी का फोटो खींचें। इसके बाद अपनी पानी की व्यवस्था चुनें।'
      : 'Please choose your soil type, or take a photo of your soil using the camera. Next, select your irrigation water source.';
    playSpeech(script);
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto gap-space-lg">
      {/* Top Banner with Instruction Listen & Voice Buttons */}
      <section className="bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-md max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[2rem]">eco</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs mb-1">
              <span className="bg-primary/10 text-primary px-space-sm py-0.5 rounded-full font-label-sm text-xs uppercase tracking-wider font-bold">
                {language === 'hi' ? 'कदम 1 / 2' : 'Step 1 of 2'}
              </span>
              <span className="text-outline text-label-sm">•</span>
              <span className="font-label-sm text-xs text-on-surface-variant font-semibold">
                {language === 'hi' ? 'खेत विन्यास' : 'Farm Soil Setup'}
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-extrabold">
              {language === 'hi' ? 'अपनी ज़मीन और मिट्टी पहचानें' : 'Identify Your Land & Soil Type'}
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
              {language === 'hi'
                ? 'बोलकर बताएं या नीचे दिए गए बड़े विकल्पों में से अपनी ज़मीन चुनें।'
                : 'Select from visual soil types below or capture a soil photo.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm w-full md:w-auto">
          <button
            className="h-target-touch-kisan px-space-md flex items-center justify-center gap-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-primary transition-all font-label-md text-sm font-bold shadow-xs active:scale-95 w-full sm:w-auto"
            onClick={playInstructionsAudio}
            type="button"
          >
            <span className="material-symbols-outlined text-[1.5rem]">volume_up</span>
            <span>{language === 'hi' ? 'निर्देश सुनें' : 'Listen Instructions'}</span>
          </button>
          <button
            className="h-target-touch-kisan px-space-md flex items-center justify-center gap-space-xs rounded-full bg-secondary-container hover:opacity-90 text-on-secondary-container transition-all font-label-md text-sm font-bold shadow-xs active:scale-95 w-full sm:w-auto"
            onClick={() => {
              playSpeech(language === 'hi' ? 'काली कपासिया मिट्टी चुन ली गई है' : 'Black cotton soil selected');
            }}
            type="button"
          >
            <span className="material-symbols-outlined text-[1.5rem]">mic</span>
            <span>{language === 'hi' ? 'बोलकर चुनें' : 'Speak to Select'}</span>
          </button>
        </div>
      </section>

      {/* Main Grid: Soil Selector (8 cols) & Land Parameters (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left 8 Cols: Soil Selection Cards & AI Camera Scanner */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                {language === 'hi' ? 'मिट्टी का प्रकार (Choose Soil Type)' : 'Soil Type'}
              </h2>
            </div>
            <span className="font-label-sm text-xs text-primary font-bold bg-primary-fixed/40 px-space-sm py-1 rounded-full">
              {language === 'hi' ? '1 प्रकार चयनित' : '1 Type Selected'}
            </span>
          </div>

          {/* 2x2 Soil Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {STANDARD_SOIL_TYPES.map(soil => {
              const isSelected = soilConfig.soilType === soil.id;
              return (
                <div
                  key={soil.id}
                  onClick={() => handleSelectSoil(soil)}
                  className={`cursor-pointer rounded-2xl p-space-md shadow-sm transition-all relative overflow-hidden bg-surface-container-lowest border-2 ${
                    isSelected
                      ? 'border-primary ring-4 ring-primary/20 shadow-md'
                      : 'border-surface-container-high hover:border-primary/40'
                  }`}
                >
                  {/* Selected check badge */}
                  <div
                    className={`absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                      isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline opacity-40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">check</span>
                  </div>

                  {/* Soil Image */}
                  <div className="w-full h-40 rounded-xl overflow-hidden relative mb-space-sm bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt={soil.nameEn}
                      src={soil.image}
                    />
                    <div className="absolute bottom-2 left-2 bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface px-space-xs py-0.5 rounded font-label-sm text-xs font-semibold">
                      {soil.classType}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <h3 className="font-headline-sm text-base font-bold text-on-surface">
                      {language === 'hi' ? soil.nameHi : soil.nameEn}
                    </h3>
                    <span className="font-label-sm text-xs text-primary font-semibold">
                      {soil.nameEn}
                    </span>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 line-clamp-2">
                      {language === 'hi' ? soil.descriptionHi : soil.descriptionEn}
                    </p>

                    <div className="mt-space-sm flex items-center gap-space-xs bg-surface-container-low p-2 rounded-xl">
                      <span className="material-symbols-outlined text-primary text-[1.125rem]">water_drop</span>
                      <span className="font-label-sm text-xs text-on-surface font-medium">
                        {language === 'hi' ? 'नमी क्षमता: ' : 'Moisture Cap: '}
                        <strong className="text-primary font-bold">{soil.moistureCapacity}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Camera Diagnostic Card (FR-4.3 Soil Photo Upload & Assessment) */}
          <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-sm border border-outline-variant/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[2rem]">photo_camera</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-sm text-base font-bold text-on-surface">
                      {language === 'hi' ? 'मिट्टी का फोटो खींचें (AI Camera Scanner)' : 'Take a Photo of Your Soil'}
                    </span>
                    <span className="bg-primary text-on-primary font-label-sm text-[0.65rem] px-2 py-0.5 rounded-full font-bold">
                      AI परख
                    </span>
                  </div>
                  <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                    {language === 'hi'
                      ? 'यदि मिट्टी का प्रकार नहीं पता, तो खेत की ज़मीन का फोटो लें। आकाश वाणी AI अपने आप नमी और प्रकार पहचान लेगा।'
                      : 'Capture a photo of your field soil. AI diagnoses soil texture and moisture level.'}
                  </p>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  className="h-target-touch-kisan px-space-md bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-space-xs w-full sm:w-auto shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">camera</span>
                  <span>{isScanning ? (language === 'hi' ? 'जांच जारी है...' : 'Scanning...') : (language === 'hi' ? 'कैमरा खोलें' : 'Open Camera')}</span>
                </button>

                <button
                  className="h-target-touch-kisan px-space-md bg-surface-container hover:bg-surface-container-high text-primary rounded-xl font-label-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-space-xs w-full sm:w-auto shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50 border border-primary/20"
                  onClick={handleTestSamplePhoto}
                  disabled={isScanning}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">science</span>
                  <span>{language === 'hi' ? 'नमूना मिट्टी परखें' : 'Test Sample'}</span>
                </button>
              </div>
            </div>

            {/* AI Diagnosis Result Box */}
            {scanMessage && (
              <div className="mt-space-md bg-surface-container-lowest p-space-md rounded-xl border border-primary/20 flex flex-col gap-1 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[1.25rem]">document_scanner</span>
                    <span className="font-label-sm text-xs font-bold text-primary uppercase">
                      {language === 'hi' ? 'AI मृदा जांच परिणाम' : 'AI Soil Diagnosis Result'}
                    </span>
                  </div>
                  <span className="text-[0.65rem] text-outline font-semibold bg-surface-container px-2 py-0.5 rounded">
                    {language === 'hi' ? 'अनुमानित परख (Approximate)' : 'Non-Laboratory Estimate'}
                  </span>
                </div>
                <p className="font-body-sm text-xs text-on-surface font-semibold mt-1">
                  {scanMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Season, Irrigation Water Source, Land Area */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Active Season Badge Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs font-bold text-outline uppercase tracking-wider">
                {language === 'hi' ? 'सक्रिय मौसम चक्र' : 'Active Season Cycle'}
              </span>
              <span className="flex items-center gap-1 bg-primary/10 text-primary px-space-xs py-0.5 rounded-full font-label-sm text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                {language === 'hi' ? 'लाइव मौसम' : 'Live Cycle'}
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[1.75rem]">grain</span>
              </div>
              <div className="flex flex-col">
                <h4 className="font-headline-sm text-base font-bold text-on-surface">
                  {language === 'hi' ? 'खरीफ सीज़न 2025' : 'Kharif Season 2025'}
                </h4>
                <span className="font-body-sm text-xs text-on-surface-variant">
                  {language === 'hi' ? 'मानसून आगमन: 12-16 जून (अपेक्षित)' : 'Monsoon Arrival: 12-16 June'}
                </span>
              </div>
            </div>

            {/* Soil Wetness Progress Bar */}
            <div className="bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-xs text-on-surface-variant font-medium">
                  {language === 'hi' ? 'ज़मीनी आर्द्रता' : 'Soil Wetness'}
                </span>
                <span className="font-label-sm text-xs text-primary font-bold">
                  {soilConfig.moisturePercentage}% सामान्य
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${soilConfig.moisturePercentage}%` }}></div>
              </div>
              <span className="text-[0.65rem] text-outline mt-0.5">
                {language === 'hi' ? 'ISRO-MOSDAC एवं IMD उपग्रह द्वारा सत्यापित' : 'ISRO-MOSDAC & IMD Satellite Verified'}
              </span>
            </div>
          </div>

          {/* Water Source Selector */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {language === 'hi' ? 'पानी की व्यवस्था (Water Source)' : 'Water Source'}
              </h3>
              <span className="font-label-sm text-xs text-outline">
                {language === 'hi' ? 'एक चुनें' : 'Select one'}
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">
              {language === 'hi'
                ? 'सिंचाई सुविधा अनुसार आकाश वाणी पानी देने का सही समय बताएगा:'
                : 'Recommendations adapt based on your water availability:'}
            </p>

            <div className="flex flex-col gap-space-xs">
              {/* Tubewell */}
              <button
                className={`w-full min-h-[3.25rem] p-space-sm rounded-xl flex items-center justify-between transition-all text-left border ${
                  soilConfig.waterSource === 'tubewell'
                    ? 'bg-primary-container text-on-primary border-primary font-bold shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-transparent'
                }`}
                onClick={() => handleSelectWaterSource('tubewell')}
                type="button"
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[1.5rem]">water_pump</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm font-bold">
                      {language === 'hi' ? 'कुआं / ट्यूबवेल (Tubewell)' : 'Tubewell / Borewell'}
                    </span>
                    <span className="text-xs opacity-90">
                      {language === 'hi' ? 'निजी बोरवेल अथवा मोटर पंप उपलब्ध' : 'Private borewell or pump available'}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[1.25rem]">
                  {soilConfig.waterSource === 'tubewell' ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
              </button>

              {/* Canal */}
              <button
                className={`w-full min-h-[3.25rem] p-space-sm rounded-xl flex items-center justify-between transition-all text-left border ${
                  soilConfig.waterSource === 'canal'
                    ? 'bg-primary-container text-on-primary border-primary font-bold shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-transparent'
                }`}
                onClick={() => handleSelectWaterSource('canal')}
                type="button"
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[1.5rem]">waves</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm font-bold">
                      {language === 'hi' ? 'नहर / सरकारी वितरिका (Canal)' : 'Canal Irrigation'}
                    </span>
                    <span className="text-xs opacity-90">
                      {language === 'hi' ? 'सीमित दिनों में पानी प्रवाह' : 'Scheduled canal rotation'}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[1.25rem]">
                  {soilConfig.waterSource === 'canal' ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
              </button>

              {/* Rainfed */}
              <button
                className={`w-full min-h-[3.25rem] p-space-sm rounded-xl flex items-center justify-between transition-all text-left border ${
                  soilConfig.waterSource === 'rainfed'
                    ? 'bg-primary-container text-on-primary border-primary font-bold shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-transparent'
                }`}
                onClick={() => handleSelectWaterSource('rainfed')}
                type="button"
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[1.5rem]">cloudy_snowing</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm font-bold">
                      {language === 'hi' ? 'केवल बारिश पर निर्भर (Barani)' : 'Rainfed / Barani'}
                    </span>
                    <span className="text-xs opacity-90">
                      {language === 'hi' ? 'सिंचाई का कोई साधन नहीं' : 'Dependent on rainfall only'}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[1.25rem]">
                  {soilConfig.waterSource === 'rainfed' ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Field Size Preset */}
          <div className="bg-surface-container-low rounded-2xl p-space-md flex flex-col gap-space-xs border border-outline-variant/30">
            <span className="font-label-sm text-xs font-bold text-on-surface">
              {language === 'hi' ? 'खेत का कुल रकबा (Land Area)' : 'Total Land Area'}
            </span>
            <div className="flex items-center gap-space-xs">
              <input
                className="h-12 w-24 px-space-sm bg-surface-container-lowest text-on-surface font-headline-sm text-lg font-bold rounded-xl text-center outline-none shadow-inner border border-outline-variant"
                min="0.5"
                step="0.5"
                type="number"
                value={soilConfig.landArea}
                onChange={(e) => setSoilConfig(prev => ({ ...prev, landArea: parseFloat(e.target.value) || 1 }))}
              />
              <div className="flex items-center gap-space-xs flex-1">
                <button
                  className={`flex-1 h-12 rounded-xl font-label-md text-xs font-bold transition-colors ${
                    soilConfig.landUnit === 'acres'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-on-surface'
                  }`}
                  onClick={() => setSoilConfig(prev => ({ ...prev, landUnit: 'acres' }))}
                  type="button"
                >
                  {language === 'hi' ? 'एकड़ (Acres)' : 'Acres'}
                </button>
                <button
                  className={`flex-1 h-12 rounded-xl font-label-md text-xs font-bold transition-colors ${
                    soilConfig.landUnit === 'bigha'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-on-surface'
                  }`}
                  onClick={() => setSoilConfig(prev => ({ ...prev, landUnit: 'bigha' }))}
                  type="button"
                >
                  {language === 'hi' ? 'बीघा (Bigha)' : 'Bigha'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Giant Sticky Bottom Master Action Bar */}
      <section className="sticky bottom-4 z-30">
        <div className="max-w-4xl mx-auto bg-surface-container-lowest/95 backdrop-blur-xl p-space-md rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-space-md border border-primary/20">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[1.75rem]">check_circle</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-sm font-bold text-on-surface">
                {language === 'hi' ? `${soilConfig.soilNameHi} + ${soilConfig.waterSource === 'tubewell' ? 'ट्यूबवेल' : soilConfig.waterSource === 'canal' ? 'नहर' : 'बारिश'}` : `${soilConfig.soilNameEn} + ${soilConfig.waterSource}`}
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant">
                {language === 'hi'
                  ? 'सोयाबीन, मक्का, कपास हेतु वैज्ञानिक सुझाव तैयार हैं'
                  : 'AI recommendations ready for your field'}
              </span>
            </div>
          </div>

          <button
            className="h-target-touch-kisan w-full sm:w-auto px-space-xl bg-primary hover:bg-primary-container text-on-primary rounded-xl font-headline-sm text-base font-bold flex items-center justify-center gap-space-sm shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 disabled:opacity-75"
            onClick={handleSaveAndNext}
            disabled={isSaving}
            type="button"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[1.5rem] animate-spin">sync</span>
                <span>{language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <span>{t.saveAndNext}</span>
                <span className="material-symbols-outlined text-[1.5rem]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
