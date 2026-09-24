'use client';

import React, { useState, useMemo } from 'react';
import { Language } from '@/types';
import { calculateHeatStressAndLivestockIndices } from '@/lib/alertService';

interface ThiScenarioSimulatorProps {
  language: Language;
  defaultTemp?: number;
  defaultHumidity?: number;
}

export default function ThiScenarioSimulator({
  language,
  defaultTemp = 34,
  defaultHumidity = 65,
}: ThiScenarioSimulatorProps) {
  const [simTemp, setSimTemp] = useState<number>(defaultTemp);
  const [simHumidity, setSimHumidity] = useState<number>(defaultHumidity);

  const simulatedIndices = useMemo(() => {
    return calculateHeatStressAndLivestockIndices(simTemp, simHumidity);
  }, [simTemp, simHumidity]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
      {/* Interactive Scenario Simulator */}
      <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md border border-surface-container-high flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[1.25rem]">tune</span>
            <span className="font-bold text-xs sm:text-sm text-on-surface">
              {language === 'hi' ? 'इंटरएक्टिव THI परिदृश्य सिम्युलेटर' : 'Interactive THI Scenario Simulator'}
            </span>
          </div>
          <span className="text-[0.68rem] text-on-surface-variant font-medium">
            {language === 'hi' ? 'तापमान व आर्द्रता बदलकर देखें' : 'Test custom weather values'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Temp Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-semibold text-on-surface">
              <span>{language === 'hi' ? 'तापमान' : 'Temperature'}</span>
              <span className="font-bold text-primary">{simTemp}°C</span>
            </div>
            <input
              type="range"
              min="22"
              max="48"
              value={simTemp}
              onChange={e => setSimTemp(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[0.65rem] text-on-surface-variant">
              <span>22°C</span>
              <span>48°C</span>
            </div>
          </div>

          {/* Humidity Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-semibold text-on-surface">
              <span>{language === 'hi' ? 'आर्द्रता' : 'Relative Humidity'}</span>
              <span className="font-bold text-primary">{simHumidity}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="95"
              value={simHumidity}
              onChange={e => setSimHumidity(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[0.65rem] text-on-surface-variant">
              <span>15%</span>
              <span>95%</span>
            </div>
          </div>
        </div>

        {/* Simulated Result Pill */}
        <div className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface">
              {language === 'hi' ? 'अनुमानित THI:' : 'Simulated THI:'}
            </span>
            <span className="text-xl font-black text-on-surface">{simulatedIndices.thi}</span>
            <span className="text-xs font-medium text-on-surface-variant">
              (WBGT: {simulatedIndices.wbgt}°C)
            </span>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              simulatedIndices.thi >= 89
                ? 'bg-red-600 text-white'
                : simulatedIndices.thi >= 78
                ? 'bg-amber-600 text-white'
                : simulatedIndices.thi >= 72
                ? 'bg-yellow-500 text-slate-900'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {language === 'hi' ? simulatedIndices.livestockStatusHi : simulatedIndices.livestockStatus}
          </span>
        </div>
      </div>

      {/* Veterinary Emergency Protocol Card */}
      <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-md border border-rose-500/30 flex flex-col justify-between gap-3">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-xs sm:text-sm">
          <span className="material-symbols-outlined text-[1.25rem]">emergency</span>
          <span>{language === 'hi' ? 'पशु हीटस्ट्रोक (Heat Apoplexy) आपातकाल' : 'Acute Cattle Heat Stroke Protocol'}</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-on-surface leading-relaxed">
          <p>
            {language === 'hi'
              ? 'यदि पशु गिर पड़े, मुंह से झाग आए या गुदा का तापमान 41°C से ऊपर हो, तो यह जानलेवा स्थिति है।'
              : 'If an animal collapses with open-mouth panting, foaming, or rectal temp >41°C, act immediately:'}
          </p>
          <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-[0.72rem] flex flex-col gap-1">
            <span>
              1. {language === 'hi' ? 'पशु के सिर व माथे पर लगातार ठंडा पानी डालें (फेफड़ों पर न डालें)।' : 'Pour continuous cold water on forehead & poll (avoid lungs).'}
            </span>
            <span>
              2. {language === 'hi' ? 'सींगों के बीच बर्फ की थैली रखें और तुरंत छाया में खींचें।' : 'Apply ice packs between horns; move to open breezeway.'}
            </span>
            <span>
              3. {language === 'hi' ? 'पशु चिकित्सक को बुलाकर नसों में ठंडी सलाइन (IV Fluid) लगवाएं।' : 'Call local veterinary surgeon for immediate chilled IV therapy.'}
            </span>
          </div>
        </div>

        <a
          href="tel:18001801551"
          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[1.125rem]">phone_in_talk</span>
          <span>{language === 'hi' ? 'पशु चिकित्सा हेल्पलाइन: 1800-180-1551' : 'Call Veterinary Helpline: 1800-180-1551'}</span>
        </a>
      </div>
    </div>
  );
}
