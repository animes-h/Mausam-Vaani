'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { SpeechHandler, detectQueryLanguage } from '@/lib/speechService';
import { askClimateCopilot, askClimateCopilotWithAudio } from '@/lib/aiCopilotService';

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
  const [queryLanguage, setQueryLanguage] = useState<'hi' | 'en'>(language);
  const [isListening, setIsListening] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
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
    setQueryLanguage(language);
    setTranscript(
      language === 'hi'
        ? 'क्या कल सुबह सोयाबीन में कीटनाशक का छिड़काव कर सकते हैं?'
        : 'Can we spray pesticide on crops tomorrow morning?'
    );
  }, [language]);

  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const toggleListening = async () => {
    SpeechHandler.prewarmAudio();
    if (isListening) {
      setIsListening(false);
      setAudioVolume(0);
      await SpeechHandler.stopListening(true);
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

    const listeningLang = queryLanguage === 'hi' || language === 'hi' ? 'hi-IN' : 'en-IN';
    setIsListening(true);
    setAudioVolume(0);
    setTimerSeconds(0);
    setTranscript(queryLanguage === 'hi' ? 'बोलिए, सुन रहा है...' : 'Listening... please speak now');

    await SpeechHandler.startListening({
      onResult: async (resultText, audioBlob) => {
        setIsListening(false);
        setAudioVolume(0);

        const cleanText = resultText ? resultText.trim() : '';
        const isPlaceholder =
          cleanText === 'बोलिए, सुन रहा है...' ||
          cleanText === 'Listening... please speak now' ||
          cleanText.includes('रिकॉर्ड हो रही है') ||
          cleanText.includes('Recording your voice');

        if (cleanText && !isPlaceholder) {
          const detected = detectQueryLanguage(cleanText);
          setQueryLanguage(detected);
          setTranscript(cleanText);
          await handleQuerySubmit(cleanText, detected);
        } else if (audioBlob && audioBlob.size > 100) {
          // Process recorded audio with Gemini voice-query
          setIsProcessing(true);
          setTranscript(
            queryLanguage === 'hi'
              ? 'आवाज़ का विश्लेषण हो रहा है...'
              : 'Analyzing spoken query...'
          );
          try {
            const voiceResult = await askClimateCopilotWithAudio(
              audioBlob,
              location,
              weather.current,
              queryLanguage
            );

            const hasDevanagari = /[\u0900-\u097F]/.test(voiceResult.transcription || '');
            const detected = language === 'en' ? (hasDevanagari ? 'hi' : 'en') : 'hi';
            setQueryLanguage(detected);

            if (voiceResult.transcription && voiceResult.transcription.trim()) {
              setTranscript(voiceResult.transcription);
            }

            const isHi = detected === 'hi';

            if (voiceResult.message.verdictCallout) {
              setSolution({
                titleHi: voiceResult.message.verdictCallout.titleHi || (isHi ? voiceResult.message.verdictCallout.title : '') || 'मौसम व कृषि सलाह',
                titleEn: voiceResult.message.verdictCallout.titleEn || (!isHi ? voiceResult.message.verdictCallout.title : '') || 'Weather & Crop Advisory',
                descriptionHi: voiceResult.message.verdictCallout.descriptionHi || voiceResult.message.textHi || (isHi ? voiceResult.message.text : '') || 'मौसम स्थिति अनुसार खेत में कार्य करें।',
                descriptionEn: voiceResult.message.verdictCallout.descriptionEn || voiceResult.message.text || (!isHi ? voiceResult.message.textHi : '') || 'Operations can proceed according to weather.',
                bestWindowHi: 'परसों (गुरुवार) सुबह 6:30 से 10:00 बजे तक',
                bestWindowEn: 'Thursday early morning 06:30 to 10:00 IST',
                bestWindowDetailHi: voiceResult.message.verdictCallout.descriptionHi || voiceResult.message.verdictCallout.description,
                bestWindowDetailEn: voiceResult.message.verdictCallout.descriptionEn || voiceResult.message.verdictCallout.description,
              });
            } else {
              setSolution((prev) => ({
                ...prev,
                titleHi: isHi ? 'मौसम व कृषि सलाह' : prev.titleHi,
                titleEn: !isHi ? 'Weather & Crop Advisory' : prev.titleEn,
                descriptionHi: isHi ? (voiceResult.message.textHi || voiceResult.message.text) : prev.descriptionHi,
                descriptionEn: !isHi ? voiceResult.message.text : prev.descriptionEn,
              }));
            }

            const hindiSpeech =
              voiceResult.message.textHi ||
              (voiceResult.message.spokenResponse && /[\u0900-\u097F]/.test(voiceResult.message.spokenResponse)
                ? voiceResult.message.spokenResponse
                : '') ||
              (voiceResult.message.text && /[\u0900-\u097F]/.test(voiceResult.message.text)
                ? voiceResult.message.text
                : '');
            const englishSpeech = voiceResult.message.text || voiceResult.message.spokenResponse || '';

            const speechText = isHi
              ? (hindiSpeech || voiceResult.message.spokenResponse || voiceResult.message.text)
              : englishSpeech;

            if (speechText) {
              playSpeech(speechText, isHi ? 'hi-IN' : 'en-IN');
            }
          } catch (audioErr) {
            console.warn('Voice processing error:', audioErr);
            const fallbackPrompt = queryLanguage === 'en' ? 'Weather and crop advice' : 'मौसम व फसल परामर्श';
            await handleQuerySubmit(fallbackPrompt, queryLanguage);
          } finally {
            setIsProcessing(false);
          }
        } else {
          // If no sound captured, provide immediate weather advisory so an answer is ALWAYS given
          const defaultPrompt = queryLanguage === 'en' ? "Today's weather and crop advisory" : 'आज का मौसम और फसल परामर्श';
          await handleQuerySubmit(defaultPrompt, queryLanguage);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setAudioVolume(0);
        console.warn('Speech err:', err);
        const errMsg = typeof err === 'string' ? err : err?.message || '';
        if (errMsg.includes('permission') || errMsg.includes('not-allowed') || errMsg.includes('denied')) {
          alert(
            queryLanguage === 'hi'
              ? 'कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति (Permission) प्रदान करें।'
              : 'Please allow microphone access in your browser settings.'
          );
        }
      },
      onInterim: (interimText) => {
        if (interimText && interimText.trim()) {
          setTranscript(interimText);
        }
      },
      onVolumeChange: (vol) => {
        setAudioVolume(vol);
      },
      lang: listeningLang,
      pauseTimeoutMs: 2500,
      initialTimeoutMs: 15000,
      maxDurationMs: 45000,
    });
  };

  const handleQuerySubmit = async (queryToSubmit?: string, explicitLang?: 'hi' | 'en') => {
    if (isListening) {
      await SpeechHandler.stopListening(false);
      setIsListening(false);
    }

    const q = (queryToSubmit || transcript || '').trim();
    if (!q || q === 'बोलिए, सुन रहा है...' || q === 'Listening... please speak now') {
      return;
    }

    const detected = explicitLang || detectQueryLanguage(q);
    setQueryLanguage(detected);
    setIsProcessing(true);

    try {
      const resp = await askClimateCopilot(
        q,
        [],
        location,
        weather.current,
        detected
      );

      const isDevanagari = /[\u0900-\u097F]/.test(q);
      const isHi = language === 'en' ? isDevanagari : true;
      const isEn = !isHi;
      setQueryLanguage(isHi ? 'hi' : 'en');

      if (resp.verdictCallout) {
        setSolution({
          titleHi: resp.verdictCallout.titleHi || (isHi ? resp.verdictCallout.title : '') || 'कृषि मौसम परामर्श',
          titleEn: resp.verdictCallout.titleEn || (isEn ? resp.verdictCallout.title : '') || 'Agronomic Advisory',
          descriptionHi: resp.verdictCallout.descriptionHi || resp.textHi || (isHi ? resp.text : '') || 'मौसम स्थिति अनुसार खेत में कार्य करें।',
          descriptionEn: resp.verdictCallout.descriptionEn || resp.text || (isEn ? resp.textHi : '') || 'Field operations can proceed according to weather.',
          bestWindowHi: 'परसों (गुरुवार) सुबह 6:30 से 10:00 बजे तक',
          bestWindowEn: 'Thursday early morning 06:30 to 10:00 IST',
          bestWindowDetailHi: resp.verdictCallout.descriptionHi || resp.verdictCallout.description,
          bestWindowDetailEn: resp.verdictCallout.descriptionEn || resp.verdictCallout.description,
        });
      } else {
        setSolution((prev) => ({
          ...prev,
          titleHi: isHi ? 'मौसम व कृषि सलाह' : prev.titleHi,
          titleEn: isEn ? 'Weather & Crop Advisory' : prev.titleEn,
          descriptionHi: isHi ? (resp.textHi || resp.text) : prev.descriptionHi,
          descriptionEn: isEn ? resp.text : prev.descriptionEn,
        }));
      }

      const hindiSpeech =
        resp.textHi ||
        (resp.reply && /[\u0900-\u097F]/.test(resp.reply) ? resp.reply : '') ||
        (resp.spokenResponse && /[\u0900-\u097F]/.test(resp.spokenResponse) ? resp.spokenResponse : '') ||
        (resp.text && /[\u0900-\u097F]/.test(resp.text) ? resp.text : '');
      const englishSpeech = resp.text || resp.spokenResponse || '';

      const speechText = isHi
        ? (resp.spokenResponse && /[\u0900-\u097F]/.test(resp.spokenResponse)
            ? resp.spokenResponse
            : (hindiSpeech || resp.textHi || resp.text))
        : (englishSpeech || resp.text || resp.spokenResponse);

      if (speechText) {
        playSpeech(speechText, isHi ? 'hi-IN' : 'en-IN');
      }
    } catch (err) {
      console.warn('handleQuerySubmit error:', err);
      const isEn = language === 'en';
      const fallbackText = isEn
        ? `Atmospheric conditions for ${location.name} show temperature at ${weather.current.temperature}°C with ${weather.current.relativeHumidity}% humidity. Farm operations can safely proceed during morning hours.`
        : `${location.nameHi || location.name} में तापमान ${weather.current.temperature}°C एवं आर्द्रता ${weather.current.relativeHumidity}% है। सुबह के समय खेत का कार्य सुरक्षित रूप से किया जा सकता है।`;
      playSpeech(fallbackText, isEn ? 'en-IN' : 'hi-IN');
    } finally {
      setIsProcessing(false);
    }
  };

  const playSolutionAudio = () => {
    SpeechHandler.prewarmAudio();
    if (isPlayingAudio) {
      stopSpeech();
    } else {
      const isHi = language === 'hi';
      const textToSpeak = !isHi
        ? `${solution.titleEn}. ${solution.descriptionEn}. Best window is ${solution.bestWindowEn}.`
        : `${solution.titleHi}। ${solution.descriptionHi}। सर्वोत्तम सुरक्षित समय: ${solution.bestWindowHi}।`;
      playSpeech(textToSpeak, isHi ? 'hi-IN' : 'en-IN', slowAudio ? 0.75 : undefined);
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
                  {language === 'hi' ? 'मौसम वाणी आवाज़ सहायक' : 'Mausam Vaani Voice Assistant'}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-space-xs rounded-full bg-primary/10 px-space-md py-1 text-primary text-xs font-bold">
              <span className="material-symbols-outlined text-[1.125rem] animate-pulse">mic</span>
              <span>
                {isListening
                  ? (queryLanguage === 'hi' ? `बोलिए... 00:${timerSeconds < 10 ? '0' + timerSeconds : timerSeconds}` : `Listening... 00:${timerSeconds < 10 ? '0' + timerSeconds : timerSeconds}`)
                  : (queryLanguage === 'hi' ? 'माइक तैयार है' : 'Mic Ready')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Language Selector */}
              <div className="flex items-center bg-surface-container rounded-full p-0.5 border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => {
                    setQueryLanguage('hi');
                    setTranscript('क्या कल सुबह सोयाबीन में कीटनाशक का छिड़काव कर सकते हैं?');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    queryLanguage === 'hi'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                  title="हिन्दी आवाज़ और उत्तर"
                >
                  🇮🇳 हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQueryLanguage('en');
                    setTranscript('Can we spray pesticide on soybean crops tomorrow morning?');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    queryLanguage === 'en'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                  title="English Voice & Answer"
                >
                  🌐 English
                </button>
              </div>

              <button
                onClick={() => setSlowAudio(!slowAudio)}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  slowAudio
                    ? 'bg-tertiary text-on-tertiary font-bold'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[1rem]">speed</span>
                <span>{queryLanguage === 'hi' ? 'धीमी आवाज़' : 'Slow Audio'}</span>
              </button>
            </div>
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
                className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full text-on-primary shadow-xl transition-all active:scale-95 hover:scale-105 cursor-pointer ${
                  isListening ? 'bg-secondary ring-4 ring-secondary/40 shadow-[0_0_35px_rgba(239,68,68,0.5)]' : 'bg-primary'
                }`}
                onClick={toggleListening}
                type="button"
                aria-label="Toggle Microphone"
              >
                <span className="material-symbols-outlined text-[3rem]">{isListening ? 'stop' : 'mic'}</span>
              </button>
            </div>

            {/* Guidance Hint */}
            <div className="mt-3 text-center">
              <span className={`text-xs font-bold ${isListening ? 'text-secondary animate-pulse' : 'text-on-surface-variant'}`}>
                {isListening
                  ? (language === 'hi' ? 'बोलिए, सुन रहा है... रुकने पर स्वतः उत्तर आएगा (या लाल बटन दबाएं)' : 'Listening... pause when done or tap button to submit')
                  : (language === 'hi' ? 'माइक दबाकर बोलना शुरू करें' : 'Tap microphone to speak')}
              </span>
            </div>

            {/* Audio Equalizer Waves with Real Microphone Telemetry */}
            <div className="mt-space-lg flex h-10 items-center justify-center gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const dynamicHeight = isListening
                  ? Math.max(8, Math.min(38, Math.round((audioVolume * 0.35) + ((i % 3) + 1) * 6)))
                  : 8;
                return (
                  <span
                    key={i}
                    style={{ height: `${dynamicHeight}px` }}
                    className={`w-2 rounded-full transition-all duration-100 ${
                      isListening
                        ? i % 2 === 0
                          ? 'bg-secondary animate-pulse'
                          : 'bg-primary'
                        : 'bg-surface-container-high'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Transcript Box with Interactive Edit Support */}
          <div className="rounded-2xl bg-surface-container-low p-space-md border border-outline-variant/30">
            <div className="flex items-center justify-between text-outline">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[1rem]">graphic_eq</span>
                <span className="font-label-sm text-[0.7rem] font-bold uppercase tracking-wider text-primary">
                  {language === 'hi' ? 'आप बोल रहे हैं • Spoken Query' : 'Live Transcript'}
                </span>
              </div>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-[0.7rem] text-on-surface-variant hover:text-primary transition-colors font-semibold"
                >
                  {language === 'hi' ? 'साफ़ करें' : 'Clear'}
                </button>
              )}
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg bg-transparent font-headline-sm text-sm sm:text-base font-bold text-on-surface leading-snug border-none outline-none focus:ring-1 focus:ring-primary/40 p-1"
              placeholder={language === 'hi' ? 'यहाँ बोलें या प्रश्न लिखें...' : 'Speak or type your question here...'}
            />
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
                const text = queryLanguage === 'hi' ? item.hi : item.en;
                const langToUse: 'hi' | 'en' = queryLanguage === 'hi' ? 'hi' : 'en';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(text);
                      handleQuerySubmit(text, langToUse);
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
                  {language === 'hi' ? 'मौसम वाणी त्वरित समाधान' : 'Instant AI Solution'}
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
                    {queryLanguage === 'en' ? solution.titleEn : solution.titleHi}
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    {queryLanguage === 'en' ? solution.descriptionEn : solution.descriptionHi}
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
                    {queryLanguage === 'en' ? 'Best Work Window' : 'सर्वोत्तम सुरक्षित समय (Best Window)'}
                  </span>
                  <p className="font-headline-sm text-xs font-bold text-on-surface">
                    {queryLanguage === 'en' ? solution.bestWindowEn : solution.bestWindowHi}
                  </p>
                  <p className="font-body-sm text-[0.7rem] text-on-surface-variant">
                    {queryLanguage === 'en' ? solution.bestWindowDetailEn : solution.bestWindowDetailHi}
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
                    {isPlayingAudio ? (queryLanguage === 'en' ? 'Playing Audio...' : 'आवाज़ बज रही है...') : (queryLanguage === 'en' ? 'Listen to Answer' : 'आवाज़ में सुनें')}
                  </span>
                  <span className="text-[0.7rem] text-on-surface-variant">
                    {queryLanguage === 'en' ? 'Spoken English AI voice synthesis' : 'स्पष्ट हिन्दी बोली में समाधान'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const isEn = queryLanguage === 'en';
                  const shareText = isEn
                    ? `🌱 *Mausam-Vaani Agronomic Advisory*\nQuery: ${transcript}\nVerdict: ${solution.titleEn}\nDetails: ${solution.descriptionEn}\nBest Window: ${solution.bestWindowEn}`
                    : `🌱 *मौसम वाणी कृषि सलाह*\nप्रश्न: ${transcript}\nनिर्णय: ${solution.titleHi}\nविवरण: ${solution.descriptionHi}\nसुरक्षित समय: ${solution.bestWindowHi}\n\nमौसम वाणी - आपका मौसम साथी`;
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
