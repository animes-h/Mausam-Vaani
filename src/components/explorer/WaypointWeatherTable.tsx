'use client';

import React from 'react';
import { Language, RouteWaypoint } from '@/types';

interface WaypointWeatherTableProps {
  language: Language;
  dynamicSegments: RouteWaypoint[];
  selectedSegmentIdx: number | null;
  onSelectSegment: (idx: number | null) => void;
}

export default function WaypointWeatherTable({
  language,
  dynamicSegments,
  selectedSegmentIdx,
  onSelectSegment,
}: WaypointWeatherTableProps) {
  return (
    <div className="flex flex-col gap-space-lg">
      {/* Waypoint Telemetry Matrix Table */}
      <section className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-surface-container-high flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {language === 'hi' ? 'मार्ग पड़ाव मौसम तालिका' : 'Waypoint Weather & Road Surface Telemetry'}
            </span>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface mt-0.5">
              {language === 'hi' ? 'प्रत्येक मार्ग खंड की मौसम व सुरक्षा स्थिति' : 'Segment-by-Segment Atmospheric & Grip Analysis'}
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            {dynamicSegments.length} {language === 'hi' ? 'विश्लेषित खंड' : 'Corridor Segments Analyzed'}
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-container-high text-on-surface-variant font-bold text-[0.7rem] uppercase tracking-wider">
                <th className="py-2.5 px-3">{language === 'hi' ? 'मार्ग खंड' : 'Route Segment'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'अनुमानित समय (ETA)' : 'ETA Window'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'मौसम' : 'Condition'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'तापमान' : 'Temp'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'सड़क सतह' : 'Surface Grip'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'क्रॉसविंड' : 'Crosswind'}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'दृश्यता' : 'Visibility'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'hi' ? 'जोखिम स्तर' : 'Risk Rating'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/40">
              {dynamicSegments.map((seg, idx) => {
                const isSelected = selectedSegmentIdx === idx;
                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectSegment(isSelected ? null : idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-on-surface whitespace-nowrap">
                      {seg.name}
                    </td>
                    <td className="py-3 px-3 text-primary font-semibold whitespace-nowrap">
                      {seg.eta}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[1.125rem] text-primary">
                          {seg.icon}
                        </span>
                        <span className="text-on-surface font-medium">{seg.condition}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-on-surface whitespace-nowrap">
                      {seg.temperature}°C
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[0.68rem] font-bold ${
                          seg.surfaceStatus === 'Waterlogged'
                            ? 'bg-secondary/20 text-secondary'
                            : seg.surfaceStatus === 'Damp'
                            ? 'bg-tertiary/20 text-tertiary'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {seg.surfaceStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-on-surface whitespace-nowrap">
                      <span className={seg.windGustKm >= 38 ? 'text-secondary font-bold' : ''}>
                        {seg.windGustKm} km/h
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-on-surface whitespace-nowrap">
                      <span className={seg.visibilityKm < 3 ? 'text-secondary font-bold' : ''}>
                        {seg.visibilityKm} km
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-extrabold capitalize ${
                          seg.riskLevel === 'severe'
                            ? 'bg-secondary text-on-secondary'
                            : seg.riskLevel === 'moderate'
                            ? 'bg-tertiary text-on-tertiary'
                            : 'bg-primary text-on-primary'
                        }`}
                      >
                        {seg.riskLevel === 'severe'
                          ? language === 'hi' ? 'गंभीर' : 'Severe'
                          : seg.riskLevel === 'moderate'
                          ? language === 'hi' ? 'सावधानी' : 'Caution'
                          : language === 'hi' ? 'सुरक्षित' : 'Clear'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Driver & Logistics Advisory Checklist */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[1.25rem]">local_shipping</span>
            <span className="font-bold text-xs text-on-surface">
              {language === 'hi' ? 'कृषि उपज व अनाज परिवहन' : 'Agricultural Cargo Directives'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {language === 'hi'
              ? 'सोयाबीन व गेहूं की बोरियों को डबल-लेयर वाटरप्रूफ तिरपाल से कसकर बांधें। मोड़ पर अचानक ब्रेक लगाने से बचें।'
              : 'Secure open grain trailers with heavy-duty tarpaulins. Saturated grain leads to rapid spoilage and transit weight deductions.'}
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-tertiary">
            <span className="material-symbols-outlined text-[1.25rem]">warning_amber</span>
            <span className="font-bold text-xs text-on-surface">
              {language === 'hi' ? 'हाइवे सुरक्षा व ब्रेक नियम' : 'High-Speed Brake & Wet Tarmac'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {language === 'hi'
              ? 'गीली सड़क पर ब्रेक दूरी 2.5 गुना बढ़ जाती है। आगे वाले वाहन से कम से कम 40 मीटर का सुरक्षित फासला बनाकर चलें।'
              : 'Wet road friction decreases stopping distance by 150%. Maintain a minimum 3-second buffer distance behind heavy commercial haulers on wet bypass corridors.'}
          </p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-[1.25rem]">emergency</span>
            <span className="font-bold text-xs text-on-surface">
              {language === 'hi' ? 'आपातकालीन हाइवे सहायता' : 'Corridor Emergency Assistance'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {language === 'hi'
              ? 'NHAI आपातकालीन हेल्पलाइन: 1033। राष्ट्रीय आपातकालीन नंबर: 112। तेज आंधी में पेड़ के नीचे गाड़ी पार्क न करें।'
              : 'NHAI Highway Patrol: 1033 • State Emergency Dispatch: 112. In severe squalls, pull over at well-lit toll plazas or designated fuel service stations.'}
          </p>
        </div>
      </section>
    </div>
  );
}
