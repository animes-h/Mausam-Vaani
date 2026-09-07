'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';

export default function KisanAlerts() {
  const {
    language,
    alerts,
    playSpeech,
    stopSpeech,
    isPlayingAudio,
  } = useApp();

  const t = translations[language];
  const primaryAlert = alerts[0];
  const [isPlayingAlertAudio, setIsPlayingAlertAudio] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSirenActive, setIsSirenActive] = useState(false);

  const toggleEmergencyAudio = () => {
    if (isPlayingAlertAudio || isPlayingAudio) {
      stopSpeech();
      setIsPlayingAlertAudio(false);
    } else {
      setIsPlayingAlertAudio(true);
      playSpeech(
        primaryAlert.audioScriptHi,
        'hi-IN'
      );
    }
  };

  const toggleStepCompleted = (step: number) => {
    setCompletedSteps(prev =>
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  const toggleSiren = () => {
    if (isSirenActive) {
      setIsSirenActive(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3);
        osc.frequency.linearRampToValueAtTime(520, ctx.currentTime + 0.6);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.9);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setIsSirenActive(true);
        setTimeout(() => {
          try {
            osc.stop();
            ctx.close();
          } catch (_) {}
          setIsSirenActive(false);
        }, 1500);
      }
    } catch (_) {
      setIsSirenActive(false);
    }
  };

  const shareAlertWhatsApp = () => {
    const text = language === 'hi'
      ? `🚨 *आकाश वाणी मौसम आपातकाल अलर्ट: ${primaryAlert.titleHi}*\nसमय: ${primaryAlert.validTo}\nविवरण: ${primaryAlert.hindiSummary}\nप्रभावित तहसीलें: ${primaryAlert.affectedTehsils.join(', ')}\n\nतुरंत सुरक्षित स्थान पर जाएं। 100% नि:शुल्क किसान मौसम सेवा।`
      : `🚨 *Akash-Vaani Weather Emergency Warning: ${primaryAlert.titleEn}*\nValid: ${primaryAlert.validTo}\nSummary: ${primaryAlert.englishSummary}\nAffected: ${primaryAlert.affectedTehsils.join(', ')}\n\nMove to safe shelter immediately.`;
    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto gap-space-lg">
      {/* Top Emergency Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-secondary-fixed text-on-secondary-fixed p-space-sm rounded-2xl shadow-xs border border-secondary/20">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[1.75rem] animate-bounce">
            crisis_alert
          </span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm sm:text-base font-bold leading-tight">
              {language === 'hi' ? 'मौसम आपातकाल सूचना • Urgent Weather Dispatch' : 'Emergency Meteorological Dispatch'}
            </span>
            <span className="font-body-sm text-xs text-on-secondary-fixed-variant">
              {primaryAlert.source}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-1 rounded-full shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
          <span className="font-label-md text-xs text-secondary font-bold tracking-wide">
            {language === 'hi' ? 'लाइव अलर्ट सक्रिय (Live Active)' : 'Active Warning'}
          </span>
        </div>
      </div>

      {/* 1. Urgent Alert Hero Banner */}
      <div className="relative overflow-hidden bg-secondary text-on-secondary rounded-3xl shadow-xl p-space-lg md:p-space-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-secondary-container opacity-40 blur-3xl pointer-events-none"></div>
        <div className="absolute right-12 bottom-0 w-64 h-64 rounded-full bg-tertiary-fixed opacity-15 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-space-md">
          {/* Badges & Timing Row */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="flex items-center gap-1 bg-surface-container-lowest text-secondary px-space-md py-1 rounded-full font-label-md text-xs font-bold shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                {language === 'hi' ? 'लाल स्तर चेतावनी (Red Alert)' : 'Red Alert (Take Action)'}
              </span>
              <span className="bg-secondary-container text-on-secondary-container px-space-sm py-1 rounded-full font-label-sm text-xs font-semibold">
                {language === 'hi' ? 'डॉप्लर रडार ट्रैकिंग' : 'Doppler Radar Tracking'}
              </span>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-lowest/15 px-space-md py-1 rounded-full backdrop-blur-md text-xs font-medium">
              <span className="material-symbols-outlined text-[1.125rem]">schedule</span>
              <span>{language === 'hi' ? 'समय सीमा: दोपहर 2:30 बजे से शाम 6:30 बजे तक' : 'Valid: 14:30 to 18:30 IST'}</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="flex flex-col gap-1 max-w-4xl">
            <h1 className="font-display-lg text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-on-secondary">
              {language === 'hi' ? primaryAlert.titleHi : primaryAlert.titleEn}
            </h1>
            <p className="font-body-lg text-sm sm:text-base text-secondary-fixed opacity-95">
              {language === 'hi' ? primaryAlert.hindiSummary : primaryAlert.englishSummary}
            </p>
          </div>

          {/* Action Row: Siren, WhatsApp Share & Audio Dispatch */}
          <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
            <button
              onClick={toggleSiren}
              type="button"
              className={`h-11 px-4 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md ${
                isSirenActive
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-surface-container-lowest text-secondary hover:bg-surface-container-low'
              }`}
            >
              <span className={`material-symbols-outlined text-[1.25rem] ${isSirenActive ? 'animate-spin' : ''}`}>
                emergency
              </span>
              <span>{isSirenActive ? (language === 'hi' ? 'सायरन बज रहा है!' : 'Siren Sounding!') : (language === 'hi' ? 'खेत सायरन बजाएं' : 'Sound Alarm Siren')}</span>
            </button>

            <button
              onClick={shareAlertWhatsApp}
              type="button"
              className="h-11 px-4 rounded-2xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#1EBE5D] transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[1.25rem]">share</span>
              <span>{language === 'hi' ? 'व्हाट्सएप पर शेयर करें' : 'Share Alert on WhatsApp'}</span>
            </button>
          </div>

          {/* Audio Dispatch Bar & Location Impact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md pt-space-xs items-center">
            {/* Audio Play Control */}
            <div className="lg:col-span-7 bg-surface-container-lowest text-on-surface rounded-2xl p-space-md shadow-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm w-full sm:w-auto">
                <button
                  className="shrink-0 w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  onClick={toggleEmergencyAudio}
                  type="button"
                  aria-label="Play Emergency Audio"
                >
                  <span className="material-symbols-outlined text-[1.75rem]">
                    {isPlayingAlertAudio ? 'pause' : 'volume_up'}
                  </span>
                </button>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-sm font-bold text-secondary">
                    {language === 'hi' ? 'आपातकालीन आवाज सुनें' : 'Listen Emergency Audio'}
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant">
                    {language === 'hi' ? 'मालवी व सरल हिन्दी में उद्घोषणा • 0:32' : 'Spoken in Hindi & Malwi • 0:32'}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-40 flex flex-col gap-1">
                <div className="flex justify-between items-center text-outline font-label-sm text-[0.7rem]">
                  <span>{isPlayingAlertAudio ? '0:14 / 0:32' : '0:00 / 0:32'}</span>
                  <span className="text-secondary font-bold">
                    {isPlayingAlertAudio ? 'लाइव' : 'ऑडियो'}
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-secondary rounded-full transition-all duration-300 ${
                      isPlayingAlertAudio ? 'w-1/2' : 'w-0'
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Affected Tehsils Pill List */}
            <div className="lg:col-span-5 bg-surface-container-lowest/15 backdrop-blur-md rounded-2xl p-space-md flex flex-col gap-1 text-on-secondary">
              <span className="font-label-sm text-[0.7rem] uppercase tracking-wider font-semibold text-secondary-fixed">
                {language === 'hi' ? 'प्रभावित तहसीलें (Critical High Risk Zones)' : 'Affected Tehsils'}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {primaryAlert.affectedTehsils.map((tehsil, idx) => (
                  <span
                    key={idx}
                    className="bg-surface-container-lowest text-secondary px-2.5 py-1 rounded-lg font-bold text-xs shadow-xs"
                  >
                    {tehsil}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. "अब किसान भाई क्या करें?" Checklist (Bold Tactile Action Cards) */}
      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[2rem]">task_alt</span>
            <div className="flex flex-col">
              <h2 className="font-headline-lg text-xl font-extrabold text-on-surface tracking-tight">
                {language === 'hi' ? 'अब किसान भाई क्या करें?' : 'Immediate Farmer Action Directives'}
              </h2>
              <span className="font-label-md text-xs text-on-surface-variant font-medium">
                {language === 'hi'
                  ? 'जीवन व फसल सुरक्षा के लिए 4 त्वरित कदम'
                  : '4 crucial steps for life & crop protection'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto">
              {completedSteps.length} / {primaryAlert.farmerDirectives.length} {language === 'hi' ? 'कदम पूरे' : 'Steps Done'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.length / primaryAlert.farmerDirectives.length) * 100}%` }}
          ></div>
        </div>

        {/* 4 High Impact Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {primaryAlert.farmerDirectives.map(directive => {
            const isDone = completedSteps.includes(directive.step);
            return (
              <div
                key={directive.step}
                className={`rounded-3xl p-space-md shadow-sm hover:shadow-md transition-all border flex flex-col justify-between gap-space-md ${
                  isDone
                    ? 'bg-primary-container/15 border-primary/40'
                    : 'bg-surface-container-lowest border-surface-container-high'
                }`}
              >
                <div className="flex items-start gap-space-md">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                    isDone ? 'bg-primary text-on-primary' : 'bg-secondary-fixed text-secondary'
                  }`}>
                    <span className="material-symbols-outlined text-[2.25rem]">
                      {isDone ? 'check_circle' : directive.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <span className={`font-label-sm text-[0.65rem] px-2 py-0.5 rounded font-bold ${
                        isDone ? 'bg-primary/20 text-primary' : 'bg-secondary-fixed-dim text-on-secondary-fixed-variant'
                      }`}>
                        {language === 'hi' ? `कदम ${directive.step}` : `Step ${directive.step}`}
                      </span>
                      <span className="text-secondary font-label-sm text-xs font-semibold">
                        {directive.urgency.toUpperCase()}
                      </span>
                    </div>
                    <h3 className={`font-headline-md text-base font-bold leading-snug ${
                      isDone ? 'text-primary line-through opacity-80' : 'text-on-surface'
                    }`}>
                      {language === 'hi' ? directive.titleHi : directive.titleEn}
                    </h3>
                    <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                      {language === 'hi' ? directive.descriptionHi : directive.descriptionEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 bg-surface-container-low p-space-sm rounded-xl">
                  <button
                    onClick={() => toggleStepCompleted(directive.step)}
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                      isDone
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-highest text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1rem]">
                      {isDone ? 'check' : 'radio_button_unchecked'}
                    </span>
                    <span>{isDone ? (language === 'hi' ? 'पूरा हुआ' : 'Completed') : (language === 'hi' ? 'किया गया चिन्हित करें' : 'Mark Done')}</span>
                  </button>

                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-container text-on-primary font-label-md text-xs hover:bg-primary shadow-xs transition-colors active:scale-95 cursor-pointer"
                    onClick={() => playSpeech(directive.audioSnippetHi, 'hi-IN')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[1rem]">volume_up</span>
                    <span>{language === 'hi' ? 'सुनिए' : 'Listen'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency Helpline Banner */}
      <section className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[1.5rem]">call</span>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-on-surface">
              {language === 'hi' ? 'निःशुल्क किसान आपातकालीन सहायता केंद्र' : 'Kisan Emergency Toll-Free Helpline'}
            </span>
            <span className="text-xs text-on-surface-variant">
              Kisan Call Centre: 1800-180-1551 | State Disaster Management: 1079
            </span>
          </div>
        </div>
        <a
          href="tel:18001801551"
          className="px-space-md py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-[1rem]">phone_in_talk</span>
          <span>1800-180-1551</span>
        </a>
      </section>
    </div>
  );
}
