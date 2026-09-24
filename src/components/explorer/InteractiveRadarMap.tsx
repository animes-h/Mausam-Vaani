'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

// Comprehensive Doppler Weather Radar (DWR) station database across India
const IMD_RADAR_STATIONS = [
  { id: 'LKO-DWR', name: 'Lucknow (Amausi Hub)', lat: 26.8467, lng: 80.9462, band: 'S-Band Doppler (EEC)', rangeKm: 250, qpeRangeKm: 100, state: 'Uttar Pradesh' },
  { id: 'DEL-DWR', name: 'New Delhi (Palam Station)', lat: 28.6139, lng: 77.2090, band: 'C-Band Doppler (BEL)', rangeKm: 250, qpeRangeKm: 100, state: 'Delhi NCR' },
  { id: 'BPL-DWR', name: 'Bhopal (IMD Central Hub)', lat: 23.2599, lng: 77.4126, band: 'S-Band Doppler (ISRO-ADR)', rangeKm: 250, qpeRangeKm: 100, state: 'Madhya Pradesh' },
  { id: 'IND-DWR', name: 'Indore (Hatod Surveillance)', lat: 22.7196, lng: 75.8577, band: 'X-Band High-Res Radar', rangeKm: 150, qpeRangeKm: 75, state: 'Madhya Pradesh' },
  { id: 'PUN-DWR', name: 'Pune (Pashan IITM)', lat: 18.5204, lng: 73.8567, band: 'C-Band Dual-Pol Radar', rangeKm: 250, qpeRangeKm: 100, state: 'Maharashtra' },
  { id: 'BOM-DWR', name: 'Mumbai (Colaba Radar)', lat: 18.9220, lng: 72.8347, band: 'S-Band Coastal Radar', rangeKm: 250, qpeRangeKm: 100, state: 'Maharashtra' },
  { id: 'JAI-DWR', name: 'Jaipur (Sanganer DWR)', lat: 26.9124, lng: 75.7873, band: 'C-Band Doppler', rangeKm: 250, qpeRangeKm: 100, state: 'Rajasthan' },
  { id: 'PAT-DWR', name: 'Patna (Mausam Kendra)', lat: 25.5941, lng: 85.1376, band: 'S-Band Doppler', rangeKm: 250, qpeRangeKm: 100, state: 'Bihar' },
  { id: 'VNS-DWR', name: 'Varanasi (Babatpur Station)', lat: 25.3176, lng: 82.9739, band: 'C-Band Doppler', rangeKm: 200, qpeRangeKm: 90, state: 'Uttar Pradesh' },
];

interface RadarFrame {
  time: number;
  path: string;
}

export default function InteractiveRadarMap() {
  const { location, weather, language } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const radarLayerRef = useRef<any>(null);
  const ringsLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const activeMarkerRef = useRef<any>(null);

  // Radar frames & animation state
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [radarHost, setRadarHost] = useState<string>('https://tilecache.rainviewer.com');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.75);

  // Layer toggles
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [showWind, setShowWind] = useState<boolean>(true);
  const [showRadarRings, setShowRadarRings] = useState<boolean>(true);
  const [mapTheme, setMapTheme] = useState<'dark' | 'satellite' | 'terrain' | 'osm'>('dark');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<typeof IMD_RADAR_STATIONS[0] | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isTouchLocked, setIsTouchLocked] = useState<boolean>(true);

  // Detect touch-capable devices on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    }
  }, []);

  // Fetch Live RainViewer radar frames
  useEffect(() => {
    let isMounted = true;
    async function loadRainViewerData() {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) throw new Error('RainViewer API unreachable');
        const data = await res.json();
        if (!isMounted) return;

        if (data.host) setRadarHost(data.host);
        const past = data.radar?.past || [];
        const nowcast = data.radar?.nowcast || [];
        const allFrames = [...past, ...nowcast];

        if (allFrames.length > 0) {
          setRadarFrames(allFrames);
          setCurrentFrameIndex(past.length > 0 ? past.length - 1 : 0);
        }
      } catch (e) {
        console.warn('Live radar feed fallback:', e);
        // Resilient fallback timestamps (last 50 mins in 10-min increments)
        const now = Math.floor(Date.now() / 1000);
        const fallback = [-40, -30, -20, -10, 0].map(mins => ({
          time: now + mins * 60,
          path: `/v2/radar/${now + mins * 60}`,
        }));
        if (isMounted) {
          setRadarFrames(fallback);
          setCurrentFrameIndex(fallback.length - 1);
        }
      }
    }

    loadRainViewerData();
    const interval = setInterval(loadRainViewerData, 5 * 60 * 1000); // refresh every 5 min
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    let isCancelled = false;

    import('leaflet').then((leafletModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      L = leafletModule.default || leafletModule;

      // Fix leaflet default icon path
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [location.lat || 22.7, location.lng || 75.8],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Base tile layer (100% Free & Open - Zero API Key Required, No Watermarks)
      let baseTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      let tileOptions: any = {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        className: 'radar-dark-tiles',
      };

      if (mapTheme === 'satellite') {
        baseTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        tileOptions = {
          maxZoom: 18,
          subdomains: [],
          className: '',
        };
      } else if (mapTheme === 'terrain') {
        baseTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
        tileOptions = {
          maxZoom: 18,
          subdomains: [],
          className: '',
        };
      } else if (mapTheme === 'osm') {
        baseTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        tileOptions = {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          className: '',
        };
      }

      const baseLayer = L.tileLayer(baseTileUrl, tileOptions).addTo(map);

      // Layer groups
      const ringsGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);
      ringsLayerRef.current = ringsGroup;
      markersLayerRef.current = markersGroup;

      // User location pulsing marker
      const userIcon = L.divIcon({
        className: 'user-radar-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(30, 150, 110, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="width: 14px; height: 14px; border-radius: 9999px; background: #1b8755; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([location.lat, location.lng], { icon: userIcon })
        .bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <div style="font-weight: 800; font-size: 13px; color: #141d1a;">${location.name}</div>
            <div style="font-size: 11px; color: #55625c; margin-top: 2px;">
              Temp: <b>${weather.current.temperature}°C</b> • Wind: <b>${weather.current.windSpeed} km/h ${weather.current.windCompass}</b>
            </div>
          </div>
        `)
        .addTo(map);
      activeMarkerRef.current = userMarker;

      // Populate DWR Radar stations
      IMD_RADAR_STATIONS.forEach(stn => {
        const isSelected = selectedStation?.id === stn.id;
        const stationIcon = L.divIcon({
          className: 'imd-radar-station-pin',
          html: `
            <div style="background: ${isSelected ? '#e85d04' : '#1b8755'}; color: white; width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white; cursor: pointer;">
              <span class="material-symbols-outlined" style="font-size: 16px;">radar</span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const stnMarker = L.marker([stn.lat, stn.lng], { icon: stationIcon })
          .bindPopup(`
            <div style="font-family: inherit; padding: 6px; min-width: 180px;">
              <div style="font-size: 10px; font-weight: 700; color: #1b8755; text-transform: uppercase;">IMD Doppler Radar</div>
              <div style="font-weight: 800; font-size: 13px; color: #111;">${stn.name}</div>
              <div style="font-size: 11px; color: #555; margin-top: 2px;">${stn.band}</div>
              <div style="font-size: 11px; color: #777; margin-top: 4px;">
                Surveillance Range: <b>${stn.rangeKm} km</b><br/>
                QPE Rain Grid: <b>${stn.qpeRangeKm} km</b>
              </div>
            </div>
          `);

        stnMarker.on('click', () => {
          setSelectedStation(stn);
        });

        markersGroup.addLayer(stnMarker);

        // Add Doppler Range Rings
        if (showRadarRings) {
          // 250km surveillance ring
          const ring250 = L.circle([stn.lat, stn.lng], {
            radius: stn.rangeKm * 1000,
            color: '#1b8755',
            weight: 1,
            dashArray: '4, 6',
            fillColor: '#1b8755',
            fillOpacity: 0.02,
          });
          // 100km QPE ring
          const ring100 = L.circle([stn.lat, stn.lng], {
            radius: stn.qpeRangeKm * 1000,
            color: '#2d6a4f',
            weight: 1.5,
            dashArray: '2, 4',
            fillColor: '#2d6a4f',
            fillOpacity: 0.04,
          });
          ringsGroup.addLayer(ring250);
          ringsGroup.addLayer(ring100);
        }
      });

      if (isTouchDevice && isTouchLocked && !isFullscreen) {
        map.dragging?.disable();
        map.touchZoom?.disable();
      }

      mapInstanceRef.current = map;
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapTheme, showRadarRings, isTouchDevice, isTouchLocked, isFullscreen]);

  // Synchronize mobile gesture locking to prevent page scrolling interception
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isFullscreen || !isTouchDevice || !isTouchLocked) {
      map.dragging?.enable();
      map.touchZoom?.enable();
    } else {
      map.dragging?.disable();
      map.touchZoom?.disable();
    }
  }, [isTouchLocked, isTouchDevice, isFullscreen]);

  // Recalculate leaflet tile layout on fullscreen transition
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);

  // Update map center when user location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !location) return;
    mapInstanceRef.current.panTo([location.lat, location.lng], { animate: true, duration: 1.2 });
    if (activeMarkerRef.current) {
      activeMarkerRef.current.setLatLng([location.lat, location.lng]);
    }
  }, [location.lat, location.lng]);

  // Update Live Radar Tile Layer on current frame change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || radarFrames.length === 0 || !showRadar) {
      if (radarLayerRef.current && map) {
        map.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
      return;
    }

    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default || leafletModule;
      const frame = radarFrames[currentFrameIndex] || radarFrames[radarFrames.length - 1];
      if (!frame) return;

      const tileUrl = `${radarHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

      if (radarLayerRef.current) {
        map.removeLayer(radarLayerRef.current);
      }

      const radarLayer = L.tileLayer(tileUrl, {
        opacity: radarOpacity,
        zIndex: 10,
        maxZoom: 18,
      }).addTo(map);

      radarLayerRef.current = radarLayer;
    });
  }, [radarFrames, currentFrameIndex, radarHost, showRadar, radarOpacity]);

  // Animation player for radar timeline
  useEffect(() => {
    if (!isPlaying || radarFrames.length === 0) return;

    const timer = setInterval(() => {
      setCurrentFrameIndex(prev => (prev + 1) % radarFrames.length);
    }, 700);

    return () => clearInterval(timer);
  }, [isPlaying, radarFrames.length]);

  // Wind Particle Streamlines Overlay (HTML5 Canvas)
  useEffect(() => {
    if (!showWind || !canvasRef.current || !mapContainerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resizeCanvas = () => {
      if (mapContainerRef.current) {
        canvas.width = mapContainerRef.current.clientWidth;
        canvas.height = mapContainerRef.current.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle vector setup based on real weather windSpeed and windDirection
    const windSpeedKmH = weather.current.windSpeed || 14;
    const windDirDeg = weather.current.windDirection || 270;
    // Mathematical angle in radians (wind compass indicates where wind comes from, vectors point where it flows)
    const flowAngleRad = ((windDirDeg + 180) % 360) * (Math.PI / 180);
    const speedMagnitude = Math.max(0.8, Math.min(4.5, windSpeedKmH / 7));

    const numParticles = 140;
    const particles: { x: number; y: number; age: number; maxAge: number; speedOffset: number }[] = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        age: Math.floor(Math.random() * 80),
        maxAge: 70 + Math.floor(Math.random() * 40),
        speedOffset: 0.8 + Math.random() * 0.5,
      });
    }

    const render = () => {
      // Fade previous particle trails
      ctx.fillStyle = 'rgba(10, 25, 20, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Slight micro-turbulence
        const turbAngle = flowAngleRad + (Math.sin(p.age * 0.08) * 0.15);
        const vx = Math.cos(turbAngle) * speedMagnitude * p.speedOffset;
        const vy = Math.sin(turbAngle) * speedMagnitude * p.speedOffset;

        const nextX = p.x + vx;
        const nextY = p.y + vy;

        // Particle alpha curve (fade in, peak, fade out)
        const lifeRatio = p.age / p.maxAge;
        const alpha = Math.sin(lifeRatio * Math.PI) * 0.65;

        ctx.strokeStyle = `rgba(100, 220, 160, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();

        p.x = nextX;
        p.y = nextY;
        p.age++;

        // Reset particle if out of bounds or expired
        if (p.age >= p.maxAge || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.age = 0;
          p.maxAge = 70 + Math.floor(Math.random() * 40);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [showWind, weather.current.windSpeed, weather.current.windDirection]);

  // Current frame timestamp label formatted to IST
  const currentFrameTimeStr = useMemo(() => {
    if (radarFrames.length === 0 || !radarFrames[currentFrameIndex]) return 'Live Telemetry';
    const d = new Date(radarFrames[currentFrameIndex].time * 1000);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }, [radarFrames, currentFrameIndex]);

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-lg border border-surface-container-high transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[520px] sm:h-[580px]'
      }`}
    >
      {/* Map Element Container */}
      <div ref={mapContainerRef} className="w-full h-full bg-[#121c18]" />

      {/* Wind Streamlines Canvas Overlay */}
      {showWind && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-[15]"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* Mobile Gesture Trap Prevention Overlay (Tapping enables interaction; swiping scrolls page) */}
      {isTouchDevice && isTouchLocked && !isFullscreen && (
        <div
          onClick={() => setIsTouchLocked(false)}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] transition-all cursor-pointer"
        >
          <div className="px-4 py-2.5 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-xl border border-primary/40 flex items-center gap-2.5 transform active:scale-95 transition-transform pointer-events-auto">
            <span className="material-symbols-outlined text-primary text-[1.35rem]">touch_app</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface">
                {language === 'hi' ? 'मैप चलाने के लिए टैप करें' : 'Tap to interact with map'}
              </span>
              <span className="text-[0.65rem] text-on-surface-variant">
                {language === 'hi' ? 'पेज स्क्रॉल करने के लिए बाहर स्वाइप करें' : 'Swipe outside or tap Lock to scroll page'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Floating Telemetry & Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Active Radar Station & Live Frame Indicator */}
        <div className="flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-outline-variant/30 pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-label-sm text-xs font-bold text-on-surface">
                {language === 'hi' ? 'लाइव डॉपलर रडार' : 'Live Doppler Radar'}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-primary/15 text-primary text-[0.65rem] font-bold">
                {currentFrameTimeStr} IST
              </span>
            </div>
            <span className="text-[0.68rem] text-on-surface-variant font-medium">
              RainViewer DWR Mesh • {location.district || location.name}
            </span>
          </div>
        </div>

        {/* Quick Map Controls */}
        <div className="flex items-center gap-1.5 bg-surface-container-lowest/90 backdrop-blur-md p-1 rounded-2xl shadow-md border border-outline-variant/30 pointer-events-auto">
          {/* Radar Toggle */}
          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showRadar ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
            title="Toggle Live Precipitation Radar"
            type="button"
          >
            <span className="material-symbols-outlined text-[1rem]">water_drop</span>
            <span className="hidden sm:inline">Radar</span>
          </button>

          {/* Wind Streamlines Toggle */}
          <button
            onClick={() => setShowWind(!showWind)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showWind ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
            title="Toggle Wind Particle Streamlines"
            type="button"
          >
            <span className="material-symbols-outlined text-[1rem]">air</span>
            <span className="hidden sm:inline">Wind ({weather.current.windSpeed} km/h)</span>
          </button>

          {/* Radar Rings Toggle */}
          <button
            onClick={() => setShowRadarRings(!showRadarRings)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              showRadarRings ? 'bg-tertiary text-on-tertiary' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
            title="Toggle IMD Doppler Range Circles"
            type="button"
          >
            <span className="material-symbols-outlined text-[1rem]">radar</span>
            <span className="hidden sm:inline">Stations</span>
          </button>

          {/* Map Theme Toggle (100% Keyless, Zero Watermark) */}
          <select
            value={mapTheme}
            onChange={(e) => setMapTheme(e.target.value as any)}
            className="px-2 py-1 bg-surface-container text-xs font-semibold rounded-xl text-on-surface border-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="dark">Dark Radar</option>
            <option value="satellite">Satellite (HD)</option>
            <option value="terrain">Topographic</option>
            <option value="osm">Street Map</option>
          </select>

          {/* Recenter View on Current Location */}
          <button
            onClick={() => {
              if (mapInstanceRef.current && location) {
                mapInstanceRef.current.setView([location.lat, location.lng], 7, { animate: true });
              }
            }}
            className="p-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            title={language === 'hi' ? 'स्थान पर रीसेट करें' : 'Recenter on current location'}
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">my_location</span>
          </button>

          {/* Fullscreen Expand */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>

          {/* Mobile Pan Lock/Unlock Toggle */}
          {isTouchDevice && !isFullscreen && (
            <button
              onClick={() => setIsTouchLocked(!isTouchLocked)}
              className={`px-2 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isTouchLocked
                  ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  : 'bg-primary text-on-primary shadow-xs'
              }`}
              title={isTouchLocked ? 'Unlock map for touch gestures' : 'Lock map to scroll page'}
              type="button"
            >
              <span className="material-symbols-outlined text-[1rem]">
                {isTouchLocked ? 'lock' : 'lock_open'}
              </span>
              <span className="text-[0.68rem]">
                {isTouchLocked
                  ? (language === 'hi' ? 'लॉक' : 'Locked')
                  : (language === 'hi' ? 'अनलॉक' : 'Active')}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Floating Playback & Reflectivity Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        {/* Time Playback Controls */}
        <div className="flex items-center gap-2 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-outline-variant/30 pointer-events-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
            type="button"
            title={isPlaying ? 'Pause Loop' : 'Play Radar Loop'}
          >
            <span className="material-symbols-outlined text-[1.2rem]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Step Back */}
          <button
            onClick={() => setCurrentFrameIndex(prev => (prev - 1 + radarFrames.length) % radarFrames.length)}
            className="p-1 text-on-surface-variant hover:text-on-surface active:scale-95 cursor-pointer"
            type="button"
            title="Step Back"
          >
            <span className="material-symbols-outlined text-[1rem]">fast_rewind</span>
          </button>

          {/* Timeline Range Slider */}
          <div className="flex items-center gap-2 min-w-[130px] sm:min-w-[170px]">
            <input
              type="range"
              min={0}
              max={Math.max(0, radarFrames.length - 1)}
              value={currentFrameIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentFrameIndex(parseInt(e.target.value, 10));
              }}
              className="w-full accent-primary h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
            />
          </div>

          {/* Step Forward */}
          <button
            onClick={() => setCurrentFrameIndex(prev => (prev + 1) % radarFrames.length)}
            className="p-1 text-on-surface-variant hover:text-on-surface active:scale-95 cursor-pointer"
            type="button"
            title="Step Forward"
          >
            <span className="material-symbols-outlined text-[1rem]">fast_forward</span>
          </button>

          <span className="text-[0.7rem] font-bold text-primary whitespace-nowrap">
            {currentFrameTimeStr}
          </span>
        </div>

        {/* Doppler Reflectivity dBZ Scale Legend */}
        <div className="flex flex-col gap-1 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-outline-variant/30 pointer-events-auto">
          <div className="flex items-center justify-between text-[0.65rem] font-bold text-on-surface-variant">
            <span>15 dBZ (Light)</span>
            <span className="text-primary font-bold">Rainfall Reflectivity</span>
            <span className="text-red-600">65 dBZ (Hail/Severe)</span>
          </div>
          <div
            className="h-2 w-full sm:w-56 rounded-full"
            style={{
              background: 'linear-gradient(to right, #00ffff, #00aa00, #ffff00, #ff8800, #ff0000, #cc00ff)',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
