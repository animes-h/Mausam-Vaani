'use client';

import React, { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { CropRecommendation } from '@/types';

export default function KisanCropAdvisory() {
  const {
    language,
    cropRecommendations,
    soilConfig,
    weather,
    setActiveKisanTab,
    playSpeech,
    stopSpeech,
    isPlayingAudio,
  } = useApp();

  const t = translations[language];
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'kharif' | 'lowWater' | 'cashCrop'>('all');

  const filteredCrops = cropRecommendations.filter(c => {
    if (categoryFilter === 'kharif') return c.category === 'primary' || c.sowingWindowEn.toLowerCase().includes('june');
    if (categoryFilter === 'lowWater') return c.waterDemandLevel <= 2;
    if (categoryFilter === 'cashCrop') return c.id === 'cotton' || c.id === 'mustard' || c.id === 'soybean';
    return true;
  });

  const scrollCrops = (direction: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: direction * 350, behavior: 'smooth' });
    }
  };

  const fullAdvisoryAudio = language === 'hi'
    ? `आपकी ${soilConfig.soilNameHi} और मौजूदा मानसूनी नमी के लिए वैज्ञानिकों ने तीन प्रमुख फसलें चुनी हैं। पहली वरीयता सोयाबीन किस्म जेएस 20-34 है जिसकी बुवाई 15 से 25 जून के बीच करें। दूसरी सुरक्षित फसल मक्का है जिसमें पानी व खाद का खर्च कम आता है। तीसरी नकद मुनाफे वाली फसल बीटी कपास है।`
    : `Based on your ${soilConfig.soilNameEn} and current monsoon moisture levels, agronomists recommend three primary crops. First choice is Soybean JS 20-34 for the 15-25 June window. Second safe crop is Hybrid Maize with low input cost. Third high-yield cash crop is Bt Cotton.`;

  const toggleFullVoice = () => {
    if (isPlayingAudio) {
      stopSpeech();
    } else {
      playSpeech(fullAdvisoryAudio);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto gap-space-lg">
      {/* Hero Header Strip */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-sm p-space-lg md:p-space-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-surface-container-high">
        <div className="flex flex-col gap-space-xs relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed self-start font-bold text-xs">
            <span className="material-symbols-outlined text-[1.125rem]">verified</span>
            <span>{language === 'hi' ? 'कृषि वैज्ञानिक अनुशंसा • Kisan AI Verified' : 'Agronomist Consensus • Kisan AI Verified'}</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary tracking-tight font-extrabold mt-1">
            {language === 'hi' ? 'आपकी ज़मीन और मौसम के अनुसार सर्वोत्तम फसलें' : 'Best Crops Matched to Your Land & Weather'}
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant">
            {language === 'hi'
              ? `आपकी ${soilConfig.soilNameHi}, मौजूदा नमी (64%) और मानसून आगमन के आधार पर चुनी गई फसलें।`
              : `Matched to ${soilConfig.soilNameEn}, current soil wetness, and IMD monsoon onset window.`}
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
          <button
            className={`h-target-touch-kisan px-space-lg rounded-2xl font-label-lg text-sm shadow-md transition-all flex items-center justify-center gap-space-sm active:scale-95 ${
              isPlayingAudio
                ? 'bg-secondary text-on-secondary animate-pulse'
                : 'bg-primary hover:bg-primary-container text-on-primary'
            }`}
            onClick={toggleFullVoice}
            type="button"
          >
            <span className="material-symbols-outlined text-[1.75rem]">
              {isPlayingAudio ? 'stop_circle' : 'volume_up'}
            </span>
            <div className="flex flex-col text-left">
              <span className="font-label-md text-sm font-bold leading-tight">
                {isPlayingAudio ? (language === 'hi' ? 'रोकें' : 'Stop') : (language === 'hi' ? 'पूरी सलाह सुनें' : 'Listen Advice')}
              </span>
              <span className="font-label-sm text-[0.7rem] opacity-90">
                {language === 'hi' ? 'ऑडियो विवरण (0:48)' : 'Audio Brief (0:48)'}
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Snapshot Deck (Soil + Season Snapshot & Satellite Analysis) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-stretch">
        {/* Left 8 Cols: Soil & Season */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs mb-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[1.5rem]">grass</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-xs text-outline font-semibold uppercase tracking-wider">
                  {language === 'hi' ? 'मृदा स्वास्थ्य एवं ऋतु' : 'Soil & Season Status'}
                </span>
                <span className="font-headline-sm text-base font-bold text-on-surface">
                  {soilConfig.soilNameHi}
                </span>
              </div>
            </div>
            <button
              className="h-10 px-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs flex items-center gap-space-xs transition-colors self-end sm:self-center"
              onClick={() => setActiveKisanTab('land')}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">photo_camera</span>
              <span>{language === 'hi' ? 'ज़मीन बदलें (Edit Land)' : 'Change Land'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            {/* Metric 1: Soil */}
            <div className="bg-surface-container-low rounded-2xl p-space-sm flex flex-col gap-1">
              <span className="font-label-sm text-xs text-outline">
                {language === 'hi' ? 'मिट्टी का प्रकार' : 'Soil Type'}
              </span>
              <span className="font-headline-sm text-sm font-bold text-on-surface">
                {soilConfig.soilClass}
              </span>
              <span className="text-[0.7rem] text-primary font-semibold">
                {soilConfig.organicContent}
              </span>
            </div>

            {/* Metric 2: Season */}
            <div className="bg-surface-container-low rounded-2xl p-space-sm flex flex-col gap-1">
              <span className="font-label-sm text-xs text-outline">
                {language === 'hi' ? 'सक्रिय चक्र' : 'Active Cycle'}
              </span>
              <span className="font-headline-sm text-sm font-bold text-on-surface">
                खरीफ सीज़न 2025
              </span>
              <span className="text-[0.7rem] text-tertiary font-bold">
                आर्द्रता: {weather.current.soilMoisture}% (पर्याप्त नमी)
              </span>
            </div>

            {/* Metric 3: Sowing Window */}
            <div className="bg-surface-container-low rounded-2xl p-space-sm flex flex-col gap-1">
              <span className="font-label-sm text-xs text-outline">
                {language === 'hi' ? 'मानसून बुवाई खिड़की' : 'Sowing Window'}
              </span>
              <span className="font-headline-sm text-sm font-bold text-primary">
                15 जून - 25 जून
              </span>
              <span className="text-[0.7rem] text-secondary font-bold">
                बुवाई खिड़की अनुकूल है
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Satellite & Soil Properties */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-3xl p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
              {language === 'hi' ? 'खेत सैटेलाइट विश्लेषण' : 'Satellite Telemetry'}
            </span>
            <span className="px-space-xs py-0.5 rounded-full bg-surface-container font-label-sm text-[0.65rem] text-on-surface-variant font-bold">
              Sentinel-2 MSI
            </span>
          </div>

          <div className="relative w-full h-28 rounded-xl overflow-hidden my-2 bg-surface-container">
            <img
              className="w-full h-full object-cover"
              alt="Field satellite imagery"
              src={soilConfig.photoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgJ0TqIxUFVVJJUYabKKbdZVscGortF4aKFRTs9lpNjK9SyOmbrRIdt8TNvrLr0C1HQkiAaX2nDnCyM3ZTRKi0Suwsd6_6tNJICiLaLxbIzHg98N9tWzbGyEl6m0WTI0-5bNVmlPwlEXI26hysZwP535L4-lPcybLbtHtmY63V3fqEGXS92Z1M9BhDoy-HgbaIIgyUBKodL2XEOi0i-iG8I1OTIfT8XrUfVvpRlFq9BE0Y4CwPbV47'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-inverse-on-surface text-xs font-bold">
              <span>खेत क्र. ०२ (हातोद रोड)</span>
              <span>{soilConfig.landArea} {soilConfig.landUnit}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-surface-container">
            <div className="flex flex-col">
              <span className="text-[0.7rem] text-on-surface-variant">पीएच मान (pH Level)</span>
              <span className="font-bold text-sm text-on-surface">{soilConfig.phValue} (सामान्य)</span>
            </div>
            <div className="h-6 w-px bg-outline-variant/40"></div>
            <div className="flex flex-col text-right">
              <span className="text-[0.7rem] text-on-surface-variant">जल भराव क्षमता</span>
              <span className="font-bold text-sm text-primary">उत्कृष्ट (85%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Crops Section & Carousel */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[1.5rem]">recommend</span>
              <h2 className="font-headline-md text-xl font-extrabold text-on-surface">
                {language === 'hi' ? 'सुझाई गई प्रमुख फसलें (Recommended Crops)' : 'Recommended Crops'}
              </h2>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">
              {language === 'hi'
                ? 'बाज़ार भाव, कम लागत और मौसम सहिष्णुता के आधार पर चुनी गई फसलें'
                : 'Ranked by market demand, drought tolerance, and soil compatibility'}
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {[
                { id: 'all', hi: 'सभी फसलें', en: 'All Crops' },
                { id: 'kharif', hi: 'खरीफ 2025', en: 'Kharif' },
                { id: 'lowWater', hi: 'कम पानी वाली', en: 'Low Water' },
                { id: 'cashCrop', hi: 'अधिक मुनाफा', en: 'High Profit' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    categoryFilter === f.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                  type="button"
                >
                  {language === 'hi' ? f.hi : f.en}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-space-xs self-end sm:self-auto">
            <button
              onClick={() => scrollCrops(-1)}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center shadow-xs text-on-surface transition-all cursor-pointer active:scale-95"
              type="button"
              aria-label="Previous Crop"
            >
              <span className="material-symbols-outlined text-[1.25rem]">arrow_back</span>
            </button>
            <button
              onClick={() => scrollCrops(1)}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center shadow-xs text-on-surface transition-all cursor-pointer active:scale-95"
              type="button"
              aria-label="Next Crop"
            >
              <span className="material-symbols-outlined text-[1.25rem]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Carousel of Cards */}
        <div
          ref={carouselRef}
          className="flex gap-space-md overflow-x-auto pb-space-sm snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {filteredCrops.map(crop => (
            <div
              key={crop.id}
              onClick={() => setSelectedCrop(crop)}
              className="min-w-[300px] md:min-w-[360px] max-w-[380px] flex-1 snap-start bg-surface-container-lowest rounded-3xl p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between hover:shadow-md transition-all group cursor-pointer active:scale-[0.99]"
            >
              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-space-xs mb-space-xs">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                    <span className="material-symbols-outlined text-[1rem]">check_circle</span>
                    <span>{language === 'hi' ? crop.riskBadgeHi : crop.riskBadgeEn}</span>
                  </div>
                  <span className="text-[0.7rem] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {crop.soilMatchScore}% Match
                  </span>
                </div>

                {/* Crop Image */}
                <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-space-sm bg-surface-container">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={crop.nameEn}
                    src={crop.imageUrl}
                  />
                  <div className="absolute bottom-2 right-2 bg-inverse-surface/80 text-inverse-on-surface px-space-xs py-0.5 rounded-lg text-[0.75rem] backdrop-blur-sm font-semibold">
                    {crop.variety}
                  </div>
                </div>

                <h3 className="font-headline-md text-lg font-extrabold text-on-surface">
                  {language === 'hi' ? crop.nameHi : crop.nameEn}
                </h3>
                <span className="font-label-sm text-xs text-on-surface-variant font-semibold">
                  {crop.variety}
                </span>

                {/* Metric Summary Rows */}
                <div className="space-y-2 bg-surface-container-low rounded-2xl p-space-sm mt-space-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[1.125rem] text-primary">event_available</span>
                      {language === 'hi' ? 'बुवाई का समय' : 'Sowing Window'}
                    </span>
                    <span className="font-bold text-primary">
                      {language === 'hi' ? crop.sowingWindowHi : crop.sowingWindowEn}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[1.125rem] text-primary-container">water_drop</span>
                      {language === 'hi' ? 'पानी की आवश्यकता' : 'Water Demand'}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(dot => (
                        <span
                          key={dot}
                          className={`material-symbols-outlined text-[1rem] ${
                            dot <= crop.waterDemandLevel ? 'text-primary' : 'text-outline-variant'
                          }`}
                        >
                          water_drop
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[1.125rem] text-tertiary">trending_up</span>
                      {language === 'hi' ? 'अनुमानित पैदावार' : 'Expected Yield'}
                    </span>
                    <span className="font-bold text-on-surface">
                      {language === 'hi' ? crop.estimatedYieldHi : crop.estimatedYieldEn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-space-md pt-1 flex items-center gap-space-xs">
                <button
                  className="flex-1 h-target-touch-kisan rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-bold flex items-center justify-center gap-space-xs transition-colors active:scale-95"
                  onClick={() => playSpeech(crop.audioSpeechText)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem] text-primary">play_circle</span>
                  <span>{language === 'hi' ? 'विवरण सुनें' : 'Listen'}</span>
                </button>
                <button
                  onClick={() => setSelectedCrop(crop)}
                  className="w-12 h-target-touch-kisan rounded-xl bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors shrink-0"
                  type="button"
                  title="View Full Package"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Crop Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl p-space-lg w-full max-w-lg border border-primary/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-space-sm">
              <div className="flex flex-col">
                <span className="font-label-sm text-xs text-primary font-bold uppercase">
                  {language === 'hi' ? 'विस्तृत कृषि पैकेज' : 'Complete Agronomic Dossier'}
                </span>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">
                  {language === 'hi' ? selectedCrop.nameHi : selectedCrop.nameEn}
                </h3>
                <span className="text-xs text-on-surface-variant font-semibold">
                  {selectedCrop.variety}
                </span>
              </div>
              <button
                onClick={() => setSelectedCrop(null)}
                className="p-1 rounded-full text-outline hover:text-on-surface"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-space-md">
              <div className="bg-surface-container-low p-space-md rounded-2xl">
                <span className="text-xs font-bold text-primary uppercase block mb-1">
                  {language === 'hi' ? 'वैज्ञानिक चयन का कारण' : 'Selection Rationale'}
                </span>
                <p className="text-xs text-on-surface leading-relaxed font-medium">
                  {language === 'hi' ? selectedCrop.rationaleHi : selectedCrop.rationaleEn}
                </p>
              </div>

              <div className="bg-surface-container-low p-space-md rounded-2xl">
                <span className="text-xs font-bold text-secondary uppercase block mb-1">
                  {language === 'hi' ? 'प्रमुख जोखिम एवं कीट नियंत्रण' : 'Key Risk & Pest Care'}
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {language === 'hi' ? selectedCrop.keyRisksHi : selectedCrop.keyRisksEn}
                </p>
              </div>

              <div className="bg-surface-container-low p-space-md rounded-2xl">
                <span className="text-xs font-bold text-tertiary uppercase block mb-1">
                  {language === 'hi' ? 'मंडी भाव व लाभ का अनुमान' : 'Market & Profit Potential'}
                </span>
                <p className="text-xs text-on-surface leading-relaxed">
                  {language === 'hi' ? selectedCrop.marketTrendHi : selectedCrop.marketTrendEn}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => playSpeech(selectedCrop.audioSpeechText)}
                  className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 cursor-pointer shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined">volume_up</span>
                  <span>{language === 'hi' ? 'आवाज़ में सुनें' : 'Listen Spoken Advice'}</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedCrop(null);
                      setActiveKisanTab('voice');
                    }}
                    className="py-2.5 px-3 bg-secondary-fixed text-on-secondary-fixed rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-secondary-fixed-dim transition-all active:scale-95 cursor-pointer shadow-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[1.125rem]">psychology_alt</span>
                    <span>{language === 'hi' ? 'AI से इस फसल की सलाह लें' : 'Ask AI Copilot'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const shareText = language === 'hi'
                        ? `🌾 *आकाश वाणी फसल सलाह: ${selectedCrop.nameHi} (${selectedCrop.variety})*\nअनुशंसित किस्म: ${selectedCrop.variety}\nअनुमानित उपज: ${selectedCrop.estimatedYieldHi}\nकारण: ${selectedCrop.rationaleHi}\n\nआकाश वाणी - मध्य प्रदेश मौसम व फसल केंद्र`
                        : `🌾 *Akash-Vaani Crop Advisory: ${selectedCrop.nameEn} (${selectedCrop.variety})*\nVariety: ${selectedCrop.variety}\nYield: ${selectedCrop.estimatedYieldEn}\nRationale: ${selectedCrop.rationaleEn}\n\nAkash-Vaani Agrometeorology`;
                      if (typeof window !== 'undefined') {
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                      }
                    }}
                    className="py-2.5 px-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-highest transition-all active:scale-95 cursor-pointer shadow-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[1.125rem] text-primary">share</span>
                    <span>{language === 'hi' ? 'WhatsApp पर शेयर' : 'Share WhatsApp'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
