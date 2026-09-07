'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';

export default function NetworkBanner() {
  const { networkMode, toggleNetworkMode, language } = useApp();
  const t = translations[language];

  if (networkMode !== 'degraded') return null;

  return (
    <div className="w-full bg-secondary-fixed text-on-secondary-fixed border-b border-secondary/30 px-space-md py-2.5 flex items-center justify-between gap-space-sm z-30">
      <div className="flex items-center gap-space-xs">
        <span className="material-symbols-outlined text-secondary text-[1.25rem] animate-pulse">
          signal_cellular_connected_no_internet_1_bar
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span className="font-label-sm text-label-sm font-bold text-secondary">
            {t.lowBandwidthMode}
          </span>
          <span className="font-body-sm text-xs text-on-secondary-fixed-variant">
            {t.lowBandwidthDesc}
          </span>
        </div>
      </div>
      <button
        onClick={toggleNetworkMode}
        className="px-3 py-1 bg-secondary text-on-secondary rounded-full text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
        type="button"
      >
        {language === 'hi' ? '4G मोड चालू करें' : 'Switch to 4G'}
      </button>
    </div>
  );
}
