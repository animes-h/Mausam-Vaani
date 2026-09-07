'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { askClimateCopilot } from '@/lib/aiCopilotService';
import { ChatMessage } from '@/types';
import { SpeechHandler } from '@/lib/speechService';

export default function ExplorerClimateAI() {
  const {
    location,
    weather,
    language,
    playSpeech,
    stopSpeech,
    isPlayingAudio,
    networkMode,
  } = useApp();

  const t = translations[language];

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const clearSession = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        text: 'Session reset. Climate AI copilot is initialized with live ECMWF IFS and IMD Doppler boundary data. How can I assist with your meteorological research or field planning?',
        textHi: 'सत्र रीसेट हो गया है। मैं आपकी मौसम संबंधी शोध अथवा कार्य योजना में कैसे सहायता कर सकता हूँ?',
        consensusScore: 97.0,
        modelBadge: 'ECMWF-IFS v48r1 • IMD Doppler MP-04',
        sources: ['IMD Doppler Radar Station IND-042', 'Copernicus CDS ERA5 Boundary Layer'],
      },
    ]);
  };

  const exportTranscript = () => {
    const text = messages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n`).join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate_ai_session_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      timestamp: '10:14 AM',
      text: 'Evaluate the 48-hour precipitation probability and surface wind shear for drone pesticide spraying in Depalpur block. Are there safe flight windows for ultra-low volume (ULV) fungicide broadcast over JS 20-34 soybean?',
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      timestamp: '10:14:42 AM',
      text: 'Evaluating the 48-hour precipitation probability and surface wind shear for drone pesticide spraying in Depalpur block. High squall shear (>45 km/h), deep convection, and hail risk develop rapidly post-11:30 IST across Depalpur and Sanwer corridors due to intense thermodynamic loading. The marginal drone window is early morning Wednesday 06:00 – 09:30 IST.',
      textHi: 'देपालपुर ब्लॉक में कल दोपहर 11:30 के बाद 45 किमी/घंटा से अधिक तेज आंधी व ओलों की संभावना है। ड्रोन छिड़काव हेतु कल सुबह 6:00 से 9:30 बजे का समय ही सुरक्षित रहेगा।',
      consensusScore: 96.4,
      modelBadge: 'ECMWF-IFS v48r1 • IMD Doppler MP-04',
      sources: ['IMD Doppler Radar Station IND-042', 'Copernicus CDS ERA5 Boundary Layer'],
      verdictCallout: {
        type: 'warning',
        title: 'Executive Flight Status: Constrained Window',
        description: 'Marginal Drone Window: Wednesday 06:00 – 09:30 IST. Postpone afternoon flight schedules.',
      },
      tableData: [
        { 'Time Block': '06:00 - 09:30 IST', 'Gust Field': '8-14 km/h', 'Precip Prob': '15%', 'Stability (CAPE)': '450 J/kg', 'UAV Feasibility': 'Favorable (Safe)' },
        { '09:30 - 12:00 IST': '18-28 km/h', 'Precip Prob': '35%', 'Stability (CAPE)': '1,200 J/kg', 'UAV Feasibility': 'Marginal (Caution)' },
        { '12:00 - 18:00 IST': '45-65 km/h', 'Precip Prob': '75%', 'Stability (CAPE)': '2,600 J/kg', 'UAV Feasibility': 'Unsafe (Aborted)' },
      ],
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: q,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const resp = await askClimateCopilot(
        q,
        [...messages, userMsg],
        location,
        weather.current,
        language
      );
      setMessages(prev => [...prev, resp]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (networkMode === 'degraded') {
      alert('Voice input paused in 2G mode to save bandwidth. Please type query.');
      return;
    }

    setIsListening(true);
    SpeechHandler.startListening(
      (transcript) => {
        setIsListening(false);
        setInputQuery(transcript);
        handleSend(transcript);
      },
      () => setIsListening(false),
      language === 'hi' ? 'hi-IN' : 'en-IN'
    );
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg">
      {/* Header & Telemetry System Status */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-surface-container-high">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex flex-wrap items-center gap-space-xs text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Autonomous Co-Pilot Live
            </span>
            <span className="text-outline">•</span>
            <span className="font-semibold text-on-surface-variant">ECMWF-IFS v48r1</span>
            <span className="text-outline">•</span>
            <span className="font-semibold text-on-surface-variant">IMD Doppler MP-04</span>
            <span className="text-outline">•</span>
            <span className="font-semibold text-on-surface-variant">Copernicus CDS ERA5</span>
          </div>

          <h1 className="font-headline-md text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
            Climate AI Research & Conversational Assistant
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[1rem] text-primary">speed</span>
            <span>Inference Latency: <strong className="text-on-surface font-bold">41.8 ms (Semantic Cache Active)</strong></span>
            <span className="text-outline mx-1">|</span>
            <span className="material-symbols-outlined text-[1rem] text-primary">pin_drop</span>
            <span>Grid Resolution: <strong className="text-on-surface font-bold">0.05° (~5.5km) • Malwa Plateau</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start lg:self-auto">
          <div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-xl gap-2 border border-primary/20 text-xs">
            <div className="flex flex-col text-right">
              <span className="text-[0.65rem] uppercase tracking-wider text-outline">Consensus State</span>
              <span className="font-bold text-primary">96.4% Coherent</span>
            </div>
            <span className="material-symbols-outlined text-primary text-[1.25rem]">verified</span>
          </div>
        </div>
      </section>

      {/* Main 12-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left 8 Cols: Active Chat Stream */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-3xl shadow-sm p-space-lg border border-surface-container-high flex flex-col gap-space-md min-h-[500px]">
            {/* Active Topic Banner */}
            <div className="flex flex-wrap items-center justify-between gap-space-xs p-space-sm bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[1.25rem]">topic</span>
                <div className="flex flex-col">
                  <span className="text-[0.65rem] uppercase text-outline font-bold tracking-wider">Active Session Topic</span>
                  <span className="font-bold text-xs text-on-surface">
                    Malwa Agronomic Boundary Conditions & Spraying Windows
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={exportTranscript}
                  title="Export session transcript"
                  className="px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[0.875rem]">download</span>
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={clearSession}
                  title="Reset conversation"
                  className="px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-secondary text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[0.875rem]">restart_alt</span>
                  <span>Reset</span>
                </button>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  Session #AV-924
                </span>
              </div>
            </div>

            {/* Chat Stream Messages */}
            <div className="flex flex-col gap-space-md flex-1 overflow-y-auto">
              {messages.map(m => (
                <div key={m.id} className="flex flex-col gap-1">
                  {m.sender === 'user' ? (
                    <div className="flex gap-space-sm items-start justify-end ml-space-lg">
                      <div className="flex flex-col gap-1 items-end max-w-xl">
                        <span className="text-[0.7rem] text-outline font-semibold">User • {m.timestamp}</span>
                        <div className="bg-primary text-on-primary p-space-md rounded-2xl rounded-tr-xs shadow-xs text-xs sm:text-sm leading-relaxed font-medium">
                          {m.text}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        AG
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-space-sm items-start mr-space-md">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs mt-1">
                        <span className="material-symbols-outlined text-[1.125rem]">cognition</span>
                      </div>
                      <div className="flex flex-col gap-space-xs w-full min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-bold text-primary">Akash Vaani Atmospheric Engine</span>
                            <span className="text-outline">•</span>
                            <span className="text-outline">{m.timestamp}</span>
                            {m.modelBadge && (
                              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-[0.65rem] font-bold">
                                {m.modelBadge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(m.text);
                                setCopiedId(m.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="text-outline hover:text-on-surface p-1 active:scale-95 transition-transform cursor-pointer"
                              title="Copy response"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[1.125rem]">
                                {copiedId === m.id ? 'check' : 'content_copy'}
                              </span>
                            </button>
                            <button
                              onClick={() => playSpeech(m.text)}
                              className="text-outline hover:text-on-surface p-1 active:scale-95 transition-transform cursor-pointer"
                              title="Speak response"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[1.125rem]">volume_up</span>
                            </button>
                          </div>
                        </div>

                        {/* Verdict Callout Banner */}
                        {m.verdictCallout && (
                          <div className="bg-secondary-container/20 rounded-2xl p-space-sm flex items-start gap-space-sm border border-secondary/20">
                            <span className="material-symbols-outlined text-secondary text-[1.25rem] shrink-0 mt-0.5">
                              warning_amber
                            </span>
                            <div className="flex flex-col">
                              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-secondary">
                                {m.verdictCallout.title}
                              </span>
                              <p className="text-xs text-on-surface font-semibold mt-0.5">
                                {m.verdictCallout.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Text Explanation */}
                        <div className="bg-surface-container-low p-space-md rounded-2xl text-xs sm:text-sm text-on-surface leading-relaxed border border-outline-variant/20">
                          {m.text}
                        </div>

                        {/* Parametric Flight Matrix Table */}
                        {m.tableData && (
                          <div className="overflow-x-auto bg-surface-container-low rounded-2xl p-space-xs border border-outline-variant/30">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="text-outline text-[0.7rem] uppercase tracking-wider bg-surface-container">
                                  {Object.keys(m.tableData[0]).map(key => (
                                    <th key={key} className="py-2 px-3 font-bold">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {m.tableData.map((row, rIdx) => (
                                  <tr key={rIdx} className="border-t border-outline-variant/20">
                                    {Object.values(row).map((val, cIdx) => (
                                      <td key={cIdx} className="py-2 px-3 font-medium">
                                        <span className={val.includes('Safe') ? 'text-primary font-bold' : val.includes('Unsafe') ? 'text-secondary font-bold' : ''}>
                                          {val}
                                        </span>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-space-sm text-xs text-on-surface-variant animate-pulse p-space-sm">
                  <span className="material-symbols-outlined text-primary text-[1.25rem] animate-spin">
                    progress_activity
                  </span>
                  <span>Synthesizing ECMWF ERA5 boundary layer & IMD Doppler radar data...</span>
                </div>
              )}
            </div>

            {/* Prompt Input Form Strip */}
            <div className="pt-space-sm border-t border-surface-container-high flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs bg-surface-container-low rounded-2xl p-space-xs border border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary">
                <input
                  type="text"
                  placeholder="Ask a detailed meteorological query (e.g. 'what about tomorrow?', 'drone flight parameters')..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-on-surface focus:outline-none"
                />
                <button
                  onClick={handleMicToggle}
                  className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                    isListening ? 'bg-secondary text-on-secondary animate-pulse' : 'text-outline hover:text-on-surface'
                  }`}
                  title="Speech to text"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">mic</span>
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputQuery.trim()}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary-container disabled:opacity-50 transition-all active:scale-95 cursor-pointer shrink-0"
                  type="button"
                >
                  Send
                </button>
              </div>

              {/* Quick Inquiry Pills */}
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <span className="text-[0.7rem] text-outline font-bold">Follow-ups:</span>
                {[
                  'What about tomorrow?',
                  'Can I spray fungicide JS 20-34?',
                  'How does this compare to last year?',
                  'Soil moisture forecast for Friday',
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    disabled={isLoading}
                    className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high text-[0.7rem] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Model Capabilities & Live Session Parameters */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-sm">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Copilot Grounding Architecture
            </span>
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">
              Multi-Agent Meteorological Verification
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every inference query cross-references numerical boundary data against localized agronomist heuristics before response delivery.
            </p>

            <div className="space-y-2 mt-2">
              <div className="p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Conversational Session Memory</span>
                <span className="text-primary font-bold">Active (FR-5.3)</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Normalized Semantic Cache</span>
                <span className="text-primary font-bold">&lt;50ms (FR-8.3)</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Doppler Radar Correlation</span>
                <span className="text-primary font-bold">Station IND-042</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
