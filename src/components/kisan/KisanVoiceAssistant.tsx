'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { SpeechHandler } from '@/lib/speechService';
import { askClimateCopilot } from '@/lib/aiCopilotService';

export default function KisanVoiceAssistant() {
  const {
    language,
    location,
    weather,
    setActiveKisanTab,
    playSpeech,
    stopSpeech,
    isPlayingAudio,
    networkMode,
  } = useApp();

  const t = translations[language];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(
    language === 'hi'
      ? 'क्या कल सुबह सोयाबीन में कीटनाशक का छिड़काव कर सकते हैं?'
      : 'Can we spray pesticide on soybean crops tomorrow morning?'
  );
  const [timerSeconds, setTimerSeconds] = useState(6);
  const [slowAudio, setSlowAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [solution, setSolution] = useState({
    titleHi: 'कल सुबह छिड़काव बिल्कुल न करें!',
    titleEn: 'Do NOT spray tomorrow morning (High Washout Risk)',
    descriptionHi: 'दोपहर 12 बजे के बाद 70% तेज वर्षा और 28 किमी/घंटा हवा चलने का अनुमान है। कीटनाशक बह जाएगा और पैसा व्यर्थ होगा।',
    descriptionEn: 'Heavy rain (>70% chance) and 28 km/h wind squalls post-noon will wash off chemical sprays.',
    bestWindowHi: 'परसों (गुरुवार) सुबह 6:30 से 10:00 बजे तक',
    bestWindowEn: 'Thursday early morning 06:30 to 10:00 IST',
    bestWindowDetailHi: 'हवा शांत (6 किमी/घंटा) रहेगी और दिनभर खिली धूप रहेगी।',
    bestWindowDetailEn: 'Winds will be calm (6 km/h) with clear sunshine.',
  });

  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (networkMode === 'degraded') {
      alert(
        language === 'hi'
          ? 'धीमे 2G नेटवर्क मोड में वॉयस इनपुट सीमित है। कृपया नीचे दिए गए प्रश्नों में से किसी एक पर टैप करें।'
          : 'Voice paused in 2G mode. Please tap any suggestion below.'
      );
      return;
    }

    setIsListening(true);
    setTimerSeconds(0);
    setTranscript(language === 'hi' ? 'बोलिए, सुन रहा है...' : 'Listening... please speak now');

    SpeechHandler.startListening(
      async (resultText) => {
        setTranscript(resultText);
        setIsListening(false);
        await handleQuerySubmit(resultText);
      },
      (err) => {
        setIsListening(false);
        console.warn('Speech err:', err);
      },
      language === 'hi' ? 'hi-IN' : 'en-IN'
    );
  };

  const handleQuerySubmit = async (queryToSubmit?: string) => {
    const q = queryToSubmit || transcript;
    setIsProcessing(true);

    try {
      const resp = await askClimateCopilot(
        q,
        [],
        location,
        weather.current,
        language
      );

      if (resp.verdictCallout) {
        setSolution({
          titleHi: resp.verdictCallout.title,
          titleEn: resp.verdictCallout.title,
          descriptionHi: resp.textHi || resp.text,
          descriptionEn: resp.text,
          bestWindowHi: 'परसों (गुरुवार) सुबह 6:30 से 10:00 बजे तक',
          bestWindowEn: 'Thursday 06:30 - 10:00 IST',
          bestWindowDetailHi: resp.verdictCallout.description,
          bestWindowDetailEn: resp.verdictCallout.description,
        });
      }

      playSpeech(resp.textHi || resp.text);
    } finally {
      setIsProcessing(false);
    }
  };

  const playSolutionAudio = () => {
    if (isPlayingAudio) {
      stopSpeech();
    } else {
      const textToSpeak = language === 'hi'
        ? `${solution.titleHi} ${solution.descriptionHi} सर्वोत्तम सुरक्षित समय: ${solution.bestWindowHi}`
        : `${solution.titleEn}. ${solution.descriptionEn}. Best window is ${solution.bestWindowEn}`;
      playSpeech(textToSpeak, undefined, slowAudio ? 0.75 : undefined);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto gap-space-lg">
      {/* Top Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-low p-space-md md:p-space-lg shadow-sm border border-surface-container-high">
        <div className="flex flex-col gap-space-md lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="flex h-4 w-4 items-center justify-center relative">
              <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-secondary"></span>
            </span>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-headline-sm text-base font-bold text-primary">
                  {language === 'hi' ? 'आकाश वाणी आवाज़ सहायक' : 'Akash Vaani Voice Assistant'}
                </span>
                <span className="rounded-full bg-secondary/15 px-space-xs py-0.5 font-label-sm text-xs font-semibold text-secondary">
                  {isListening
                    ? (language === 'hi' ? 'लाइव सुन रहा है (Listening Live)' : 'Listening Live')
                    : (language === 'hi' ? 'तैयार है (Ready)' : 'Ready')}
                </span>
              </div>
              <span className="font-body-sm text-xs text-on-surface-variant">
                {language === 'hi' ? 'मध्य प्रदेश मौसम व फसल सहमति केंद्र • 100% नि:शुल्क ग्रामीण सेवा' : 'Central India Agrometeorology Voice Interface'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            <div className="flex items-center gap-1 rounded-full bg-surface-container-lowest px-space-md py-1 shadow-xs text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[1.125rem]">location_on</span>
              <span>{location.name}</span>
            </div>
            <button
              className="flex items-center gap-1 rounded-full bg-surface-container-lowest px-space-md py-1.5 font-label-md text-xs font-semibold text-on-surface shadow-xs hover:bg-surface-container-high transition-all"
              onClick={() => setActiveKisanTab('home')}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">arrow_back</span>
              <span>{language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Two Column Assistant Workspace */}
      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-12 items-start">
        {/* Left Section (7 cols): Microphone Stage & Transcript */}
        <section className="flex flex-col justify-between rounded-3xl bg-surface-container-lowest p-space-md md:p-space-lg shadow-sm border border-surface-container-high lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-space-xs rounded-full bg-primary/10 px-space-md py-1 text-primary text-xs font-bold">
              <span className="material-symbols-outlined text-[1.125rem] animate-pulse">mic</span>
              <span>{isListening ? `बोलिए... 00:${timerSeconds < 10 ? '0' + timerSeconds : timerSeconds}` : 'माइक तैयार है'}</span>
            </div>

            <button
              onClick={() => setSlowAudio(!slowAudio)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                slowAudio
                  ? 'bg-tertiary text-on-tertiary font-bold'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[1rem]">speed</span>
              <span>{language === 'hi' ? 'धीमी आवाज़' : 'Slow Audio'}</span>
            </button>
          </div>

          {/* Concentric Circle Mic Stage */}
          <div className="relative my-space-lg flex flex-col items-center justify-center py-space-md">
            <div className="absolute h-64 w-64 rounded-full bg-primary-fixed-dim/25 blur-3xl pointer-events-none"></div>
            <div className="absolute h-48 w-48 rounded-full bg-tertiary-fixed/30 blur-2xl pointer-events-none"></div>

            <div className="relative flex items-center justify-center">
              <div className={`absolute h-48 w-48 rounded-full bg-primary/10 ${isListening ? 'animate-ping' : ''}`}></div>
              <div className={`absolute h-36 w-36 rounded-full bg-primary/15 ${isListening ? 'animate-pulse' : ''}`}></div>
              <div className="absolute h-28 w-28 rounded-full bg-primary-container shadow-[0_0_30px_rgba(45,106,79,0.35)]"></div>

              <button
                className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full text-on-primary shadow-xl transition-transform active:scale-95 hover:scale-105 ${
                  isListening ? 'bg-secondary animate-bounce' : 'bg-primary'
                }`}
                onClick={toggleListening}
                type="button"
                aria-label="Toggle Microphone"
              >
                <span className="material-symbols-outlined text-[3rem]">mic</span>
              </button>
            </div>

            {/* Audio Equalizer Waves */}
            <div className="mt-space-lg flex h-8 items-center justify-center gap-1.5">
              <span className={`w-1.5 rounded-full bg-primary ${isListening ? 'animate-wave-1' : 'h-3'}`}></span>
              <span className={`w-1.5 rounded-full bg-primary ${isListening ? 'animate-wave-2' : 'h-5'}`}></span>
              <span className={`w-1.5 rounded-full bg-primary ${isListening ? 'animate-wave-3' : 'h-7'}`}></span>
              <span className={`w-1.5 rounded-full bg-tertiary ${isListening ? 'animate-wave-4' : 'h-4'}`}></span>
              <span className={`w-1.5 rounded-full bg-primary ${isListening ? 'animate-wave-5' : 'h-6'}`}></span>
              <span className={`w-1.5 rounded-full bg-primary ${isListening ? 'animate-wave-1' : 'h-3'}`}></span>
            </div>
          </div>

          {/* Transcript Box */}
          <div className="rounded-2xl bg-surface-container-low p-space-md border border-outline-variant/30">
            <div className="flex items-center gap-1 text-outline">
              <span className="material-symbols-outlined text-[1rem]">graphic_eq</span>
              <span className="font-label-sm text-[0.7rem] font-bold uppercase tracking-wider text-primary">
                {language === 'hi' ? 'आप बोल रहे हैं • Spoken Query' : 'Live Transcript'}
              </span>
            </div>
            <p className="mt-1 font-headline-sm text-sm sm:text-base font-bold text-on-surface leading-snug">
              "{transcript}"
            </p>
          </div>

          {/* Quick Question Suggestions */}
          <div className="mt-space-sm flex flex-col gap-1.5">
            <span className="font-label-sm text-[0.7rem] text-outline font-bold">
              {language === 'hi' ? 'जल्दी पूछने के लिए टैप करें:' : 'Quick Tap Questions:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { hi: 'क्या कल सुबह सोयाबीन में छिड़काव कर सकते हैं?', en: 'Can we spray pesticide tomorrow morning?' },
                { hi: 'आज शाम को तेज आंधी-बारिश होगी क्या?', en: 'Will there be rain or squall this evening?' },
                { hi: 'क्या अभी खेत में यूरिया खाद डालना सुरक्षित है?', en: 'Is it safe to apply urea fertilizer right now?' },
                { hi: 'मंडी में फसल ले जाने का सबसे सुरक्षित समय क्या है?', en: 'Safest time window to transport harvest to mandi?' },
              ].map((item, idx) => {
                const text = language === 'hi' ? item.hi : item.en;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(text);
                      handleQuerySubmit(text);
                    }}
                    disabled={isProcessing}
                    className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-all active:scale-95 cursor-pointer border border-outline-variant/30 text-left"
                  >
                    💬 {text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-space-md flex flex-col gap-space-xs sm:flex-row sm:items-center">
            <button
              className="flex min-h-[3.25rem] flex-1 items-center justify-center gap-space-xs rounded-2xl bg-primary px-space-md font-label-lg text-sm font-bold text-on-primary shadow-sm hover:bg-primary-container transition-all active:scale-95 cursor-pointer"
              onClick={() => handleQuerySubmit()}
              disabled={isProcessing}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">check_circle</span>
              <span>{isProcessing ? (language === 'hi' ? 'उत्तर तैयार हो रहा है...' : 'Processing...') : (language === 'hi' ? 'समाधान देखें (Submit)' : 'Submit Query')}</span>
            </button>

            <button
              className="flex min-h-[3.25rem] items-center justify-center gap-space-xs rounded-2xl bg-surface-container-high px-space-md font-label-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors active:scale-95 cursor-pointer"
              onClick={() => {
                setTranscript('');
                toggleListening();
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">refresh</span>
              <span>{language === 'hi' ? 'फिर से बोलें (Reset)' : 'Reset'}</span>
            </button>
          </div>
        </section>

        {/* Right Section (5 cols): Instant Agronomic Solution */}
        <section className="flex flex-col gap-space-md lg:col-span-5">
          <div className="overflow-hidden rounded-3xl bg-surface-container-lowest p-space-md md:p-space-lg shadow-sm border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[1.25rem]">psychology_alt</span>
                <span className="font-label-md text-xs font-bold text-primary uppercase tracking-wide">
                  {language === 'hi' ? 'आकाश वाणी त्वरित समाधान' : 'Instant AI Solution'}
                </span>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-label-sm text-[0.7rem] font-bold text-primary">
                सहमति 96%
              </span>
            </div>

            {/* Verdict Callout */}
            <div className="mt-space-sm rounded-2xl bg-secondary-container/20 p-space-md border border-secondary/20">
              <div className="flex items-start gap-space-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-on-secondary shadow-sm">
                  <span className="material-symbols-outlined text-[1.5rem]">block</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-sm sm:text-base font-extrabold text-secondary">
                    {language === 'hi' ? solution.titleHi : solution.titleEn}
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    {language === 'hi' ? solution.descriptionHi : solution.descriptionEn}
                  </span>
                </div>
              </div>
            </div>

            {/* Weather Reason & Safe Window */}
            <div className="mt-space-sm flex flex-col gap-space-xs">
              <div className="flex items-start gap-space-sm rounded-xl bg-primary-fixed/30 p-space-sm border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[1.25rem] mt-0.5">schedule</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-xs font-bold text-primary">
                    {language === 'hi' ? 'सर्वोत्तम सुरक्षित समय (Best Window)' : 'Best Work Window'}
                  </span>
                  <p className="font-headline-sm text-xs font-bold text-on-surface">
                    {language === 'hi' ? solution.bestWindowHi : solution.bestWindowEn}
                  </p>
                  <p className="font-body-sm text-[0.7rem] text-on-surface-variant">
                    {language === 'hi' ? solution.bestWindowDetailHi : solution.bestWindowDetailEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Play Answer Audio & Share */}
            <div className="mt-space-md flex flex-col gap-2">
              <div className="rounded-2xl bg-surface-container-high p-space-sm flex items-center justify-between gap-space-sm">
                <button
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-xs transition-transform active:scale-95 cursor-pointer ${
                    isPlayingAudio ? 'bg-secondary text-on-secondary animate-pulse' : 'bg-primary text-on-primary'
                  }`}
                  onClick={playSolutionAudio}
                  type="button"
                  aria-label="Listen Solution Audio"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">
                    {isPlayingAudio ? 'stop' : 'volume_up'}
                  </span>
                </button>
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-xs text-on-surface">
                    {isPlayingAudio ? (language === 'hi' ? 'आवाज़ बज रही है...' : 'Playing Audio...') : (language === 'hi' ? 'आवाज़ में सुनें' : 'Listen to Answer')}
                  </span>
                  <span className="text-[0.7rem] text-on-surface-variant">
                    {language === 'hi' ? 'स्पष्ट बोली में समाधान' : 'Spoken bilingual audio synthesis'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const shareText = language === 'hi'
                    ? `🌱 *आकाश वाणी कृषि सलाह*\nप्रश्न: ${transcript}\nनिर्णय: ${solution.titleHi}\nविवरण: ${solution.descriptionHi}\nसुरक्षित समय: ${solution.bestWindowHi}\n\nआकाश वाणी - आपका मौसम साथी`
                    : `🌱 *Akash-Vaani Agronomic Advisory*\nQuery: ${transcript}\nVerdict: ${solution.titleEn}\nDetails: ${solution.descriptionEn}\nBest Window: ${solution.bestWindowEn}`;
                  if (typeof window !== 'undefined') {
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                  }
                }}
                className="w-full py-2 bg-[#25D366] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#1EBE5D] transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[1.125rem]">share</span>
                <span>{language === 'hi' ? 'सलाह WhatsApp पर साझा करें' : 'Share Solution on WhatsApp'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
