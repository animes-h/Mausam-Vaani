'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { SpeechHandler } from '@/lib/speechService';
import { askClimateCopilot, askClimateCopilotWithAudio } from '@/lib/aiCopilotService';

export default function KisanHome() {
  const {
    language,
    weather,
    location,
    setActiveKisanTab,
    playSpeech,
    stopSpeech,
    isPlayingAudio,
    networkMode,
  } = useApp();

  const t = translations[language];
  const [isRecording, setIsRecording] = useState(false);
  const [voiceQueryText, setVoiceQueryText] = useState('');
  const [quickResponse, setQuickResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fullWeatherSpokenScript = language === 'hi'
    ? `नमस्ते रमेश जी। आज इंदौर में तापमान 31 डिग्री सेल्सियस है और आंशिक बादल छाए हुए हैं। दोपहर बाद 40 प्रतिशत हल्की बारिश की संभावना है। हवा 14 किलोमीटर प्रति घंटा की रफ्तार से चल रही है। आपकी काली मिट्टी में 64 प्रतिशत नमी है जो बुवाई के अनुकूल है। आज कीटनाशक का छिड़काव न करें।`
    : `Namaste Ramesh ji. Today in Indore the temperature is 31 degrees Celsius with partly cloudy skies. There is a 40 percent chance of rain in the afternoon. Soil moisture is optimal at 64 percent. Please withhold pesticide spraying today.`;

  const toggleAudioReadout = () => {
    if (isPlayingAudio) {
      stopSpeech();
    } else {
      playSpeech(fullWeatherSpokenScript);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      setIsRecording(false);
      SpeechHandler.stopListening(true);
      return;
    }

    if (networkMode === 'degraded') {
      alert(
        language === 'hi'
          ? 'धीमे 2G नेटवर्क में वॉयस इनपुट सीमित है।'
          : 'Voice paused in 2G mode.'
      );
      return;
    }

    setIsRecording(true);
    setVoiceQueryText(language === 'hi' ? 'सुन रहा है... कृपया बोलिए' : 'Listening... please speak now');

    await SpeechHandler.startListening({
      onResult: async (transcript, audioBlob) => {
        setIsRecording(false);
        const cleanText = transcript ? transcript.trim() : '';
        const isPlaceholder =
          cleanText === 'सुन रहा है... कृपया बोलिए' ||
          cleanText === 'Listening... please speak now' ||
          cleanText.includes('रिकॉर्ड हो रही है') ||
          cleanText.includes('Recording your voice');

        if (cleanText && !isPlaceholder) {
          setVoiceQueryText(cleanText);
          await processSpokenQuery(cleanText);
        } else if (audioBlob && audioBlob.size > 1500) {
          setIsProcessing(true);
          setVoiceQueryText(language === 'hi' ? 'आवाज़ का विश्लेषण हो रहा है...' : 'Processing spoken query...');
          try {
            const voiceResult = await askClimateCopilotWithAudio(
              audioBlob,
              location,
              weather.current,
              language
            );
            if (voiceResult.transcription) {
              setVoiceQueryText(voiceResult.transcription);
            }
            setQuickResponse(voiceResult.message.textHi || voiceResult.message.text);
            playSpeech(voiceResult.message.textHi || voiceResult.message.text);
          } catch (e) {
            setVoiceQueryText(
              language === 'hi'
                ? 'आवाज़ साफ़ नहीं आई। कृपया नीचे दिए गए विकल्पों से पूछें।'
                : 'Could not hear clearly. Please tap a question below.'
            );
          } finally {
            setIsProcessing(false);
          }
        } else {
          setVoiceQueryText(
            language === 'hi'
              ? 'आवाज़ नहीं सुनी गई। कृपया माइक दबाकर पुनः बोलें।'
              : 'No audio detected. Please tap mic and speak again.'
          );
        }
      },
      onError: (err) => {
        setIsRecording(false);
        console.warn('Voice error:', err);
        const errMsg = typeof err === 'string' ? err : err?.message || '';
        if (errMsg.includes('permission') || errMsg.includes('not-allowed') || errMsg.includes('denied')) {
          setVoiceQueryText(
            language === 'hi'
              ? 'कृपया माइक्रोफ़ोन की अनुमति प्रदान करें।'
              : 'Please allow microphone access in your browser settings.'
          );
        }
      },
      onInterim: (interim) => {
        if (interim && interim.trim()) {
          setVoiceQueryText(interim);
        }
      },
      lang: language === 'hi' ? 'hi-IN' : 'en-IN',
      pauseTimeoutMs: 3000,
      initialTimeoutMs: 15000,
    });
  };

  const processSpokenQuery = async (query: string) => {
    setIsProcessing(true);
    setQuickResponse(null);

    try {
      const resp = await askClimateCopilot(
        query,
        [],
        location,
        weather.current,
        language
      );

      const reply = language === 'hi' ? resp.textHi || resp.text : resp.text;
      setQuickResponse(reply);
      playSpeech(reply);
    } catch (err) {
      console.warn('AI copilot error:', err);
      const fallback = language === 'hi'
        ? 'आज का तापमान 31 डिग्री है, हवा सामान्य है और खेत में नमी बुवाई के लिए पर्याप्त है।'
        : 'Today temperature is 31°C, winds are normal, and soil moisture is ideal.';
      setQuickResponse(fallback);
      playSpeech(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setVoiceQueryText(question);
    await processSpokenQuery(question);
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto gap-space-md">
      {/* Top Greeting & Audio Readout Strip */}
      <section className="relative bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-surface-container-high">
        <div className="flex items-center gap-space-md">
          <div className="relative shrink-0">
            <img
              alt="Ramesh Patel Profile"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-md ring-4 ring-primary-fixed"
              src="/images/farmer-ramesh.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq7Fe2bTiC-A9FsJWLnWrxhyQlYkBFVjVPuYhiTVv3hJKENXuTiPeAtTs9oLod3oWd1NSkvYHfZl_mEtL9PnXR3SxwxjeiIl7m9z_blNtMHW5hXnbLIy6bL3YJXDpYmFIxKCgAT4nsvF31edW7cnS0BVMq4FyFDAoYBfDxRb8N9I__vTkYFAVuLACso4_1hNEtmzr00N1JqpuEA5EnJDAlvj67up9DYbOhMIrGP1kYIK7rdqv6dppR';
              }}
            />
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-primary-container rounded-full flex items-center justify-center text-on-primary shadow-sm ring-2 ring-surface-container-lowest">
              <span className="material-symbols-outlined text-[1rem]">check</span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold tracking-wide">
                {language === 'hi' ? 'ग्राम: हातोद • इंदौर (MP)' : 'Hatod Village • Indore (MP)'}
              </span>
              <span className="font-label-sm text-label-sm text-outline">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                {language === 'hi' ? 'आज का दिन' : 'Today'}
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-extrabold tracking-tight mt-1">
              {language === 'hi' ? (
                <>नमस्ते रमेश जी! <span className="text-on-surface font-semibold">आज मौसम कैसा है, पूछिए।</span></>
              ) : (
                <>Namaste Ramesh ji! <span className="text-on-surface font-semibold">Ask your weather question.</span></>
              )}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {language === 'hi'
                ? 'बोलकर या एक टैप में अपने खेत का मौसम व फसल सलाह जानें।'
                : 'Hands-free voice & tactile agronomic intelligence for your farmland.'}
            </p>
          </div>
        </div>

        {/* 56px Listen Spoken Readout Trigger */}
        <div className="flex items-center gap-space-xs w-full md:w-auto shrink-0">
          <button
            className={`w-full md:w-auto h-target-touch-kisan px-space-lg rounded-full flex items-center justify-center gap-space-sm font-label-lg text-label-lg shadow-sm transition-all active:scale-95 ${
              isPlayingAudio
                ? 'bg-secondary text-on-secondary animate-pulse'
                : 'bg-surface-container hover:bg-surface-container-high text-primary'
            }`}
            onClick={toggleAudioReadout}
            type="button"
          >
            <span className="material-symbols-outlined text-[1.75rem]">
              {isPlayingAudio ? 'stop_circle' : 'volume_up'}
            </span>
            <span className="flex flex-col text-left">
              <span className="leading-none font-bold">
                {isPlayingAudio ? (language === 'hi' ? 'रोकें (Stop)' : 'Stop Audio') : t.listen}
              </span>
              <span className="font-label-sm text-xs opacity-90 font-normal">
                {language === 'hi' ? 'पूरा मौसम विवरण' : 'Full Weather Brief'}
              </span>
            </span>
          </button>
        </div>
      </section>

      {/* Urgent Harvest Amber Advisory Banner */}
      <section className="bg-tertiary-fixed text-on-tertiary-fixed p-space-md rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-tertiary-container/30">
        <div className="flex items-start gap-space-sm">
          <div className="w-12 h-12 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <span className="material-symbols-outlined text-[1.75rem]">eco</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-xs uppercase tracking-widest text-tertiary font-extrabold">
                {t.urgentAdvisory}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
            </div>
            <p className="font-headline-sm text-headline-sm text-on-tertiary-fixed font-bold mt-1">
              {language === 'hi'
                ? 'फसल सूचना: सोयाबीन और कपास के लिए आज कीटनाशक छिड़काव रोकें।'
                : 'Crop Directive: Postpone pesticide spray for Soybean & Cotton today.'}
            </p>
            <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant mt-0.5">
              {language === 'hi'
                ? 'दोपहर बाद बादलों की गति तेज़ होने एवं 40% बारिश की संभावना से दवा बहने का जोखिम है।'
                : 'Afternoon rain probability (40%) and squall winds will wash off chemical sprays.'}
            </p>
          </div>
        </div>

        <button
          className="shrink-0 w-full md:w-auto h-12 px-space-md bg-tertiary hover:bg-tertiary-container text-on-tertiary rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs transition-colors shadow-sm"
          onClick={() => setActiveKisanTab('crop-advisory')}
          type="button"
        >
          <span>{t.details}</span>
          <span className="material-symbols-outlined text-[1.25rem]">arrow_forward</span>
        </button>
      </section>

      {/* Giant Interactive Voice Card (Hero Anchor) */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-lg md:p-space-xl shadow-md relative overflow-hidden flex flex-col items-center text-center border border-surface-container-high">
        {/* Ambient organic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-fixed/25 via-transparent to-surface-container-low/40 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto w-full">
          <span className="px-space-md py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-bold uppercase tracking-wider flex items-center gap-space-xs mb-space-sm shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>{language === 'hi' ? 'मौसम वाणी वाक सहायक • 24x7 निःशुल्क आवाज़ सेवा' : 'Mausam Vaani Rural Voice Assistant • 24x7 Free'}</span>
          </span>

          <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mb-1">
            {language === 'hi' ? 'माइक दबाकर बोलें या पूछें' : 'Tap Microphone to Ask in Your Language'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
            {language === 'hi'
              ? 'हिंदी, मालवी या निमाड़ी में बिना लिखे सीधे अपनी भाषा में मौसम या खेती का सवाल पूछें।'
              : 'Speak naturally in Hindi or English hands-free.'}
          </p>

          {/* 80px Big Tactile Voice Microphone Button with Concentric Rings */}
          <div className="relative flex items-center justify-center my-space-md">
            <div className={`absolute w-32 h-32 rounded-full bg-primary-fixed opacity-40 ${isRecording ? 'animate-ping' : ''}`}></div>
            <div className={`absolute w-24 h-24 rounded-full bg-primary-fixed-dim opacity-50 ${isRecording ? 'animate-pulse' : ''}`}></div>
            <button
              className={`relative z-20 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(15,82,56,0.3)] transition-all active:scale-95 ${
                isRecording
                  ? 'bg-secondary text-on-secondary scale-110 ring-4 ring-secondary-container'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
              onClick={handleMicClick}
              type="button"
              aria-label="Toggle Voice Recording"
            >
              <span className="material-symbols-outlined text-[2.75rem] md:text-[3.25rem]">
                {isRecording ? 'mic' : 'mic'}
              </span>
            </button>
          </div>

          {/* Spoken Feedback Indicator & Loading State */}
          <div className="mt-space-sm flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md shadow-xs max-w-lg">
            <span className={`material-symbols-outlined text-primary text-[1.25rem] ${isProcessing ? 'animate-spin' : isRecording ? 'animate-pulse' : ''}`}>
              {isProcessing ? 'sync' : isRecording ? 'graphic_eq' : 'record_voice_over'}
            </span>
            <span className="truncate">
              {isProcessing
                ? (language === 'hi' ? 'AI मौसम वैज्ञानिक सलाह तैयार कर रहे हैं...' : 'AI agronomist generating recommendation...')
                : voiceQueryText || (language === 'hi' ? t.readyToSpeak : 'Ready: Tap microphone to speak')}
            </span>
          </div>

          {/* Quick Spoken Solution Box (if query was answered) */}
          {quickResponse && (
            <div className="mt-space-md w-full max-w-xl bg-surface-container-low border border-primary/30 rounded-2xl p-space-md text-left shadow-sm flex flex-col gap-space-sm animate-fadeIn">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[1.75rem] mt-0.5">psychology</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-xs font-bold text-primary uppercase flex items-center gap-1">
                      <span>{language === 'hi' ? 'मौसम वाणी सलाह' : 'Mausam Vaani Advisory'}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-[0.65rem]">AI Live</span>
                    </span>
                    <p className="font-body-md text-xs sm:text-sm text-on-surface font-semibold mt-1 leading-relaxed">
                      {quickResponse}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons on Response */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/30">
                <button
                  onClick={() => playSpeech(quickResponse)}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                  title="Hear again"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1rem]">volume_up</span>
                  <span>{language === 'hi' ? 'दोबारा सुनें' : 'Listen Again'}</span>
                </button>

                <button
                  onClick={() => setActiveKisanTab('crop-advisory')}
                  className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1rem]">potted_plant</span>
                  <span>{language === 'hi' ? 'फसल सलाह देखें' : 'View Crops'}</span>
                </button>

                <button
                  onClick={() => setActiveKisanTab('voice')}
                  className="px-3 py-1.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs ml-auto"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1rem]">mic</span>
                  <span>{language === 'hi' ? 'और पूछें' : 'Ask More'}</span>
                </button>
              </div>
            </div>
          )}

          {/* One-tap Quick Question Prompts */}
          <div className="mt-space-lg w-full flex flex-col items-center">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-outline mb-space-xs">
              {language === 'hi' ? 'किसान भाइयों द्वारा पूछे गए मुख्य सवाल (Tap to Ask):' : 'Popular Farmer Queries (Tap to Ask):'}
            </span>
            <div className="flex flex-wrap justify-center gap-2 w-full">
              {[
                { hi: 'क्या आज शाम को बारिश होगी?', en: 'Will it rain this evening?' },
                { hi: 'सोयाबीन में कीटनाशक छिड़काव कब करें?', en: 'When to spray pesticide on soybean?' },
                { hi: 'कल बारिश होगी क्या?', en: 'Will it rain tomorrow?' },
                { hi: 'काली मिट्टी में कौन सी फसल बोएं?', en: 'Which crop suits black soil?' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  disabled={isProcessing}
                  className="px-3 sm:px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  onClick={() => handleQuickQuestion(language === 'hi' ? item.hi : item.en)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-primary text-[1.125rem]">help</span>
                  <span>{language === 'hi' ? item.hi : item.en}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Today's Agronomic Weather Snapshot */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Main Condition Tile */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-outline uppercase tracking-wider">
              {language === 'hi' ? 'आज का मौसम' : "Today's Temperature"}
            </span>
            <span className="material-symbols-outlined text-primary text-[1.5rem]">thermostat</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-display-lg text-4xl sm:text-5xl font-extrabold text-on-surface">
              {weather.current.temperature}°
            </span>
            <span className="font-headline-sm text-lg text-outline">C</span>
            <span className="font-body-sm text-xs text-on-surface-variant ml-2">
              {language === 'hi' ? `अनुभव: ${weather.current.apparentTemperature}°C` : `Feels like ${weather.current.apparentTemperature}°C`}
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-primary font-bold text-sm">
            <span className="material-symbols-outlined text-[1.25rem]">{weather.current.icon}</span>
            <span>{language === 'hi' ? weather.current.conditionHi : weather.current.conditionEn}</span>
          </div>
        </div>

        {/* Soil Moisture Tile */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-outline uppercase tracking-wider">
              {language === 'hi' ? 'खेत की नमी (Soil Wetness)' : 'Soil Moisture'}
            </span>
            <span className="material-symbols-outlined text-primary text-[1.5rem]">water_drop</span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-display-lg text-4xl sm:text-5xl font-extrabold text-primary">
              {weather.current.soilMoisture}%
            </span>
            <span className="font-label-sm text-xs font-bold bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full">
              {language === 'hi' ? 'पर्याप्त नमी' : 'Optimal'}
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${weather.current.soilMoisture}%` }}></div>
          </div>
        </div>

        {/* Rain Probability & Wind Tile */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-outline uppercase tracking-wider">
              {language === 'hi' ? 'बारिश व हवा' : 'Rain & Wind'}
            </span>
            <span className="material-symbols-outlined text-secondary text-[1.5rem]">air</span>
          </div>
          <div className="flex items-baseline justify-between my-2">
            <div>
              <span className="font-headline-lg text-2xl font-bold text-on-surface">40%</span>
              <span className="font-body-sm text-xs text-on-surface-variant block">
                {language === 'hi' ? 'वर्षा संभावना' : 'Rain Chance'}
              </span>
            </div>
            <div className="text-right">
              <span className="font-headline-lg text-2xl font-bold text-on-surface">
                {weather.current.windSpeed} km/h
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant block">
                {weather.current.windCompass} ({language === 'hi' ? 'पछुआ हवा' : 'WNW'})
              </span>
            </div>
          </div>
          <span className="text-[0.75rem] text-outline">
            {language === 'hi' ? 'शाम को ओलों व गरज चमक से सावधान रहें' : 'Caution against evening gusty squalls'}
          </span>
        </div>
      </section>

      {/* Quick Action Navigation Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-xs">
        <button
          onClick={() => setActiveKisanTab('land')}
          className="bg-surface-container-lowest hover:bg-surface-container-low p-space-md rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-space-md text-left transition-all group"
          type="button"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[1.75rem]">landscape</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-base font-bold text-on-surface">
              {language === 'hi' ? 'मेरी ज़मीन (My Land)' : 'My Land Setup'}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              {language === 'hi' ? 'मिट्टी चुनें या फोटो खींचें' : 'Select soil or scan with AI camera'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveKisanTab('crop-advisory')}
          className="bg-surface-container-lowest hover:bg-surface-container-low p-space-md rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-space-md text-left transition-all group"
          type="button"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[1.75rem]">potted_plant</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-base font-bold text-on-surface">
              {language === 'hi' ? 'फसल सलाह (Crop Advisory)' : 'Crop Advisory'}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              {language === 'hi' ? 'सोयाबीन, मक्का व कपास के कार्ड्स' : 'Recommended seeds & sowing windows'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveKisanTab('alerts')}
          className="bg-surface-container-lowest hover:bg-surface-container-low p-space-md rounded-2xl shadow-sm border border-secondary/30 flex items-center gap-space-md text-left transition-all group"
          type="button"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[1.75rem]">crisis_alert</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-base font-bold text-secondary">
              {language === 'hi' ? 'मौसम चेतावनी (Alerts)' : 'Weather Alerts'}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              {language === 'hi' ? 'रेड अलर्ट व सुरक्षा निर्देश' : 'Disaster alerts & farmer safety steps'}
            </span>
          </div>
        </button>
      </section>
    </div>
  );
}
