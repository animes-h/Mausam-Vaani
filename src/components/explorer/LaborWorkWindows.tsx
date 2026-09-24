'use client';

import React, { useState } from 'react';
import { Language, WorkSafetyHour } from '@/types';

interface LaborWorkWindowsProps {
  workSafetySchedule: WorkSafetyHour[];
  language: Language;
}

export default function LaborWorkWindows({
  workSafetySchedule,
  language,
}: LaborWorkWindowsProps) {
  const [activeShiftFilter, setActiveShiftFilter] = useState<'all' | 'safe' | 'caution' | 'hazardous'>('all');
  const [selectedSlot, setSelectedSlot] = useState<WorkSafetyHour | null>(null);

  const filteredSlots = workSafetySchedule.filter(slot => {
    if (activeShiftFilter === 'all') return true;
    return slot.safetyStatus === activeShiftFilter;
  });

  return (
    <section className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            {language === 'hi'
              ? 'FR-7.2 खेत कार्य समय-सारणी (Field Work Windows)'
              : 'FR-7.2 Field Work Windows (Safe & Hazardous Hours)'}
          </span>
          <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface mt-0.5">
            {language === 'hi' ? 'दिन के सुरक्षित व जोखिम भरे कार्य घंटे' : 'Hourly Field Work Permitted & Cease-Labor Windows'}
          </h2>
          <p className="text-xs text-on-surface-variant">
            {language === 'hi'
              ? 'किसी भी समय पर क्लिक करके विस्तृत कृषि व श्रमिक निर्देश देखें।'
              : 'Click any time slot below to inspect specific occupational directives and precautions.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-full self-start sm:self-auto text-xs">
          {(['all', 'safe', 'caution', 'hazardous'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveShiftFilter(f)}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer capitalize ${
                activeShiftFilter === f
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f === 'all' ? (language === 'hi' ? 'सभी' : 'All') : f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="space-y-space-xs mt-space-xs">
        {filteredSlots.map((slot, idx) => {
          const isSelected = selectedSlot?.hour === slot.hour;
          return (
            <div
              key={idx}
              onClick={() => setSelectedSlot(isSelected ? null : slot)}
              className={`p-space-sm rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border cursor-pointer transition-all active:scale-[0.99] ${
                isSelected ? 'ring-2 ring-primary shadow-md' : ''
              } ${
                slot.safetyStatus === 'safe'
                  ? 'bg-surface-container-low border-primary/20 hover:bg-surface-container'
                  : slot.safetyStatus === 'caution'
                  ? 'bg-tertiary-fixed/25 border-tertiary/30 hover:bg-tertiary-fixed/40'
                  : 'bg-secondary-fixed/30 border-secondary/40 hover:bg-secondary-fixed/50'
              }`}
            >
              <div className="flex items-center gap-space-md">
                <span className="font-headline-sm text-base font-extrabold w-14 text-on-surface">
                  {slot.hour}
                </span>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ${
                    slot.safetyStatus === 'safe'
                      ? 'bg-primary text-on-primary'
                      : slot.safetyStatus === 'caution'
                      ? 'bg-tertiary text-on-tertiary'
                      : 'bg-secondary text-on-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[1rem]">
                    {slot.safetyStatus === 'safe'
                      ? 'check_circle'
                      : slot.safetyStatus === 'caution'
                      ? 'warning'
                      : 'block'}
                  </span>
                  <span>{language === 'hi' ? slot.safetyLabelHi : slot.safetyLabelEn}</span>
                </div>
                <span className="text-xs text-on-surface font-medium hidden lg:inline line-clamp-1">
                  {language === 'hi' ? slot.advisoryNoteHi : slot.advisoryNoteEn}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold text-on-surface-variant shrink-0">
                <span>
                  Temp: <strong className="text-on-surface">{slot.temperature}°C</strong>
                </span>
                <span>
                  WBGT: <strong className="text-on-surface">{slot.wbgt}°C</strong>
                </span>
                <span>
                  UV: <strong className="text-on-surface">{slot.uvIndex}</strong>
                </span>
                <span>
                  Rain:{' '}
                  <strong className={slot.rainChance > 50 ? 'text-secondary' : 'text-on-surface'}>
                    {slot.rainChance}%
                  </strong>
                </span>
                <span className="material-symbols-outlined text-outline text-[1.125rem]">
                  {isSelected ? 'expand_less' : 'expand_more'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Slot Detailed Agronomic Protocol Modal/Box */}
      {selectedSlot && (
        <div className="p-space-md rounded-2xl bg-surface-container-low border border-primary/30 flex flex-col gap-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[1.25rem]">info</span>
              <span className="font-bold text-xs text-on-surface">
                {language === 'hi'
                  ? `${selectedSlot.hour} बजे हेतु विस्तृत खेत कार्य सुरक्षा निर्देश:`
                  : `Operational Field Safety Directive for ${selectedSlot.hour} IST:`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSlot(null)}
              className="text-outline hover:text-on-surface p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[1rem]">close</span>
            </button>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {language === 'hi' ? selectedSlot.advisoryNoteHi : selectedSlot.advisoryNoteEn}
            {selectedSlot.safetyStatus === 'safe' &&
              (language === 'hi'
                ? ' (पूर्ण शारीरिक श्रम, कीटनाशक छिड़काव व ट्रैक्टर कार्य स्वीकृत)।'
                : ' (Full manual field labor, mechanized operations & pesticide spraying permitted).')}
            {selectedSlot.safetyStatus === 'caution' &&
              (language === 'hi'
                ? ' (प्रत्येक 30 मिनट में जलपान अनिवार्य। सिर पर सूती गमछा या टोपी पहनें)।'
                : ' (Hydration mandatory every 30 minutes. Wear wide-brim headgear & take shaded breaks).')}
            {selectedSlot.safetyStatus === 'hazardous' &&
              (language === 'hi'
                ? ' (खुले खेतों से तुरंत बाहर आएं। ट्रैक्टर व मशीनों को पक्के शेड में लगाएं। लोहे के खंभों से दूर रहें)।'
                : ' (Cease all open-field labor immediately. Relocate tractors to covered sheds. Avoid electrical conduits).')}
          </p>
        </div>
      )}
    </section>
  );
}
