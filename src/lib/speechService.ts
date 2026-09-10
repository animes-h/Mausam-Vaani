// Web Speech API Voice Layer (STT & TTS) + MediaRecorder Audio Resilience
// Satisfies FR-5.2 and rural accessibility (bilingual voice input/output)

/**
 * Detects whether a query is primarily Hindi (Devanagari or Hinglish) or English.
 */
export function detectQueryLanguage(text: string): 'hi' | 'en' {
  if (!text || !text.trim()) return 'hi';

  // 1. Devanagari script: Unicode \u0900 - \u097F
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }

  const clean = text.toLowerCase().trim();

  // 2. Comprehensive Hindi / Hinglish keywords
  const hindiKeywords = [
    // Question & interrogatives
    'kya', 'kyun', 'kyu', 'kaise', 'kaisa', 'kaisi', 'kab', 'kahan', 'kaha',
    'kitna', 'kitni', 'kitne', 'kaun', 'kaunsa', 'kaunsi', 'kis', 'kisko', 'kisse',
    // Time & calendar
    'kal', 'aaj', 'parso', 'parson', 'tarso', 'subah', 'dopahar', 'shaam', 'sham', 'raat',
    'hafte', 'mahine', 'samay', 'waqt', 'din',
    // Weather & meteorology
    'pani', 'paani', 'barish', 'barsat', 'badal', 'hava', 'hawa', 'aandhi', 'toofan',
    'dhoop', 'thand', 'sardi', 'garmi', 'mausam', 'tapman', 'kohra', 'ole', 'gira', 'girne',
    'hogi', 'hoga', 'honge', 'rahega', 'rahegi', 'rahenge', 'aayegi', 'aayega', 'padega', 'padegi',
    // Agriculture & farming
    'kheti', 'fasal', 'faslo', 'kisan', 'kisano', 'soya', 'soyabean', 'dhan', 'gehu', 'pyaj',
    'lahsun', 'kapas', 'mitti', 'urvarak', 'khad', 'sinchai', 'dawa', 'dawai', 'keeda', 'keede',
    'rog', 'bimari', 'kheto', 'khet', 'mandee', 'mandi', 'chhidkaw', 'chhidkao', 'chhidkav',
    'buwai', 'katai', 'beej', 'rakba', 'bhav', 'daam', 'upaj',
    // Conversational & verbs
    'namaste', 'namaskar', 'pranam', 'ram', 'bhai', 'sahab', 'ji', 'batao', 'bataiye', 'bolie',
    'suno', 'kare', 'karein', 'karo', 'karna', 'sakte', 'sakta', 'sakti', 'chahiye',
    'hai', 'hain', 'hoon', 'tha', 'thi', 'the', 'nahi', 'mat', 'theek', 'achha', 'bahut', 'jyada', 'kam'
  ];

  const words = clean.split(/[\s,?.!;:()"\-]+/);
  for (const w of words) {
    if (hindiKeywords.includes(w)) {
      return 'hi';
    }
  }

  // Also check common multi-word sub-phrases
  for (const kw of hindiKeywords) {
    if (kw.length >= 3 && clean.includes(kw)) {
      return 'hi';
    }
  }

  return 'en';
}

export interface StartListeningOptions {
  onResult: (transcript: string, audioBlob?: Blob) => void;
  onInterim?: (interimTranscript: string) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
  onVolumeChange?: (volume: number) => void;
  lang?: 'hi-IN' | 'en-IN';
  pauseTimeoutMs?: number;
  initialTimeoutMs?: number;
  maxDurationMs?: number;
}

export class SpeechHandler {
  private static recognitionInstance: any = null;
  private static isSpeaking: boolean = false;
  private static isListeningActive: boolean = false;
  private static accumulatedTranscript: string = '';
  private static silenceTimer: any = null;
  private static maxDurationTimer: any = null;
  private static onFinalResultCallback: ((transcript: string, audioBlob?: Blob) => void) | null = null;
  private static onInterimCallback: ((interim: string) => void) | null = null;
  private static onErrorCallback: ((err: any) => void) | null = null;
  private static onEndCallback: (() => void) | null = null;
  private static onVolumeChangeCallback: ((volume: number) => void) | null = null;

  // TTS utterance & audio element management
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static resumeInterval: any = null;
  private static activeAudioElement: HTMLAudioElement | null = null;

  // MediaStream and Audio Recording fallback handles
  private static activeMediaStream: MediaStream | null = null;
  private static mediaRecorder: MediaRecorder | null = null;
  private static recordedChunks: Blob[] = [];
  private static audioContext: AudioContext | null = null;
  private static analyserNode: AnalyserNode | null = null;
  private static volumeCheckRaf: number | null = null;
  private static isCloudSttBlocked: boolean = false;

  static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  static isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  /**
   * Continuous, resilient speech recognition listener
   * 1. Acquires physical microphone stream via getUserMedia.
   * 2. Runs MediaRecorder alongside Web Speech API for 100% fail-safe audio backup.
   * 3. Ignores 'network' and 'no-speech' drops so mic NEVER dies in 1-2 seconds.
   * 4. Exposes real-time volume stream for fluid UI equalizer animation.
   */
  static async startListening(
    onResultOrOptions: ((transcript: string, audioBlob?: Blob) => void) | StartListeningOptions,
    onError?: (err: any) => void,
    lang: 'hi-IN' | 'en-IN' = 'hi-IN',
    onInterim?: (interim: string) => void
  ): Promise<() => void> {
    // Parse arguments
    let opts: StartListeningOptions;
    if (typeof onResultOrOptions === 'function') {
      opts = {
        onResult: onResultOrOptions,
        onError,
        lang: lang || 'hi-IN',
        onInterim,
        pauseTimeoutMs: 3000, // 3 seconds pause after speaking completes the query
        initialTimeoutMs: 15000, // 15 seconds grace period before auto-timeout
        maxDurationMs: 45000, // 45 seconds maximum recording session
      };
    } else {
      opts = {
        pauseTimeoutMs: 3000,
        initialTimeoutMs: 15000,
        maxDurationMs: 45000,
        ...onResultOrOptions,
        lang: onResultOrOptions.lang || 'hi-IN',
      };
    }

    // Stop previous session if still running
    this.stopListening(false);

    // Cancel speech synthesis so microphone doesn't pick up speaker audio
    this.stopSpeaking();

    this.isListeningActive = true;
    this.accumulatedTranscript = '';
    this.recordedChunks = [];
    this.isCloudSttBlocked = false;
    this.onFinalResultCallback = opts.onResult;
    this.onInterimCallback = opts.onInterim || null;
    this.onErrorCallback = opts.onError || null;
    this.onEndCallback = opts.onEnd || null;
    this.onVolumeChangeCallback = opts.onVolumeChange || null;

    // 1. Acquire Physical Microphone Stream
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.activeMediaStream = stream;

        // Initialize AudioContext for volume analyzer
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            this.audioContext = new AudioCtx();
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 256;
            source.connect(this.analyserNode);

            const buffer = new Uint8Array(this.analyserNode.frequencyBinCount);
            const updateVolume = () => {
              if (!this.isListeningActive || !this.analyserNode) return;
              this.analyserNode.getByteFrequencyData(buffer);
              let sum = 0;
              for (let i = 0; i < buffer.length; i++) {
                sum += buffer[i];
              }
              const avg = sum / buffer.length;
              const normalized = Math.min(100, Math.round((avg / 128) * 100));
              if (this.onVolumeChangeCallback) {
                this.onVolumeChangeCallback(normalized);
              }
              this.volumeCheckRaf = requestAnimationFrame(updateVolume);
            };
            this.volumeCheckRaf = requestAnimationFrame(updateVolume);
          }
        } catch (audioErr) {
          console.warn('[SpeechHandler] AudioContext initialization skipped:', audioErr);
        }

        // Initialize MediaRecorder for fail-safe audio backup
        try {
          if (typeof MediaRecorder !== 'undefined') {
            let selectedMime = '';
            const candidates = [
              'audio/webm;codecs=opus',
              'audio/webm',
              'audio/mp4',
              'audio/ogg',
            ];
            for (const mime of candidates) {
              if (MediaRecorder.isTypeSupported(mime)) {
                selectedMime = mime;
                break;
              }
            }

            const recorder = selectedMime
              ? new MediaRecorder(stream, { mimeType: selectedMime })
              : new MediaRecorder(stream);

            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) {
                this.recordedChunks.push(e.data);
              }
            };
            recorder.start(250);
            this.mediaRecorder = recorder;
          }
        } catch (recorderErr) {
          console.warn('[SpeechHandler] MediaRecorder backup unavailable:', recorderErr);
        }
      }
    } catch (permErr: any) {
      console.warn('[SpeechHandler] getUserMedia microphone permission error:', permErr);
      if (permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError') {
        this.isListeningActive = false;
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('Microphone permission denied. Please allow microphone access.'));
        }
        return () => {};
      }
    }

    const clearTimers = () => {
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      if (this.maxDurationTimer) {
        clearTimeout(this.maxDurationTimer);
        this.maxDurationTimer = null;
      }
    };

    // Auto-timeout after max duration (e.g., 45s)
    this.maxDurationTimer = setTimeout(() => {
      if (this.isListeningActive) {
        console.log('[SpeechHandler] Max duration reached, finalizing.');
        this.finalizeAndSubmit();
      }
    }, opts.maxDurationMs || 45000);

    // 2. Initialize Web Speech API
    if (this.isRecognitionSupported()) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRec();
      this.recognitionInstance = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = opts.lang || 'hi-IN';

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res && res[0]) {
            if (res.isFinal) {
              finalChunk += res[0].transcript + ' ';
            } else {
              interimChunk += res[0].transcript;
            }
          }
        }

        const currentText = (finalChunk + interimChunk).trim();
        if (currentText) {
          this.accumulatedTranscript = currentText;

          // Stream live transcript to UI
          if (this.onInterimCallback) {
            this.onInterimCallback(currentText);
          }

          // Natural pause detection: user spoke and then paused for 3s -> auto submit
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            if (this.isListeningActive && this.accumulatedTranscript.trim()) {
              console.log('[SpeechHandler] Natural pause detected, finalizing query:', this.accumulatedTranscript);
              this.finalizeAndSubmit();
            }
          }, opts.pauseTimeoutMs || 3000);
        }
      };

      recognition.onerror = (event: any) => {
        console.log('[SpeechHandler] recognition.onerror:', event.error);

        // 'no-speech' is completely normal when user is thinking before speaking.
        // DO NOT kill the microphone on 'no-speech'!
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        // 'network' error occurs in Chrome when Google speech cloud server is blocked/restricted.
        // DO NOT abort listening! The MediaRecorder is active and recording user voice.
        if (event.error === 'network') {
          console.log('[SpeechHandler] Cloud STT offline or restricted. Continuing in direct audio recorder mode.');
          this.isCloudSttBlocked = true;
          if (this.onInterimCallback && !this.accumulatedTranscript) {
            this.onInterimCallback(
              opts.lang === 'hi-IN'
                ? 'आवाज़ रिकॉर्ड हो रही है... बोलते रहें'
                : 'Recording your voice... keep speaking'
            );
          }
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListeningActive = false;
          clearTimers();
          if (this.onErrorCallback) {
            this.onErrorCallback(new Error('Microphone access blocked. Please allow microphone permission.'));
          }
          return;
        }

        // Any other non-fatal error: let audio recorder continue
        console.warn('[SpeechHandler] Non-fatal recognition event:', event.error);
      };

      recognition.onend = () => {
        console.log('[SpeechHandler] recognition.onend. isListeningActive:', this.isListeningActive, 'cloudBlocked:', this.isCloudSttBlocked);

        if (this.isListeningActive && !this.isCloudSttBlocked) {
          // Seamless restart so user can speak multiple words/sentences without premature cut-off
          setTimeout(() => {
            if (this.isListeningActive && this.recognitionInstance && !this.isCloudSttBlocked) {
              try {
                this.recognitionInstance.start();
              } catch (restartErr) {
                console.log('[SpeechHandler] Seamless restart deferred:', restartErr);
              }
            }
          }, 200);
        }
      };

      try {
        recognition.start();
      } catch (startErr) {
        console.warn('[SpeechHandler] Recognition start notice:', startErr);
      }
    } else {
      console.log('[SpeechHandler] Web Speech API recognition not available in this browser; using MediaRecorder.');
      if (this.onInterimCallback) {
        this.onInterimCallback(
          opts.lang === 'hi-IN'
            ? 'आवाज़ रिकॉर्ड हो रही है... बोलते रहें'
            : 'Recording your voice... keep speaking'
        );
      }
    }

    return () => {
      this.stopListening(true);
    };
  }

  /**
   * Safely flushes buffered audio chunks from MediaRecorder and returns audio Blob.
   */
  private static async flushAndGetAudioBlob(): Promise<Blob | undefined> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      if (this.recordedChunks.length > 0) {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        return new Blob(this.recordedChunks, { type: mimeType });
      }
      return undefined;
    }

    return new Promise<Blob | undefined>((resolve) => {
      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';

      const timeout = setTimeout(() => {
        if (this.recordedChunks.length > 0) {
          resolve(new Blob(this.recordedChunks, { type: mimeType }));
        } else {
          resolve(undefined);
        }
      }, 400);

      this.mediaRecorder!.onstop = () => {
        clearTimeout(timeout);
        if (this.recordedChunks.length > 0) {
          resolve(new Blob(this.recordedChunks, { type: mimeType }));
        } else {
          resolve(undefined);
        }
      };

      try {
        if (this.mediaRecorder!.state === 'recording') {
          this.mediaRecorder!.requestData();
        }
        this.mediaRecorder!.stop();
      } catch {
        clearTimeout(timeout);
        if (this.recordedChunks.length > 0) {
          resolve(new Blob(this.recordedChunks, { type: mimeType }));
        } else {
          resolve(undefined);
        }
      }
    });
  }

  /**
   * Finalize and deliver accumulated transcript and recorded audio blob
   */
  private static async finalizeAndSubmit(): Promise<void> {
    if (!this.isListeningActive) return;
    this.isListeningActive = false;

    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.maxDurationTimer) clearTimeout(this.maxDurationTimer);
    if (this.volumeCheckRaf) cancelAnimationFrame(this.volumeCheckRaf);

    // Stop Web Speech recognition
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (_) {}
      this.recognitionInstance = null;
    }

    const audioBlob = await this.flushAndGetAudioBlob();

    // Release microphone hardware tracks
    this.releaseMediaStream();

    const text = this.accumulatedTranscript.trim();
    const cb = this.onFinalResultCallback;
    this.onFinalResultCallback = null;

    if (cb) {
      cb(text, audioBlob);
    }
  }

  /**
   * Explicitly stop listening.
   * If submitIfText is true, submits whatever has been captured so far.
   */
  static async stopListening(submitIfText: boolean = true): Promise<{ text: string; audioBlob?: Blob }> {
    const wasActive = this.isListeningActive;
    this.isListeningActive = false;

    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.maxDurationTimer) clearTimeout(this.maxDurationTimer);
    if (this.volumeCheckRaf) cancelAnimationFrame(this.volumeCheckRaf);

    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (_) {}
      this.recognitionInstance = null;
    }

    const audioBlob = await this.flushAndGetAudioBlob();
    this.releaseMediaStream();

    const text = this.accumulatedTranscript.trim();

    if (submitIfText && wasActive && this.onFinalResultCallback) {
      const cb = this.onFinalResultCallback;
      this.onFinalResultCallback = null;
      cb(text, audioBlob);
    }

    return { text, audioBlob };
  }

  private static releaseMediaStream(): void {
    if (this.activeMediaStream) {
      try {
        this.activeMediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (_) {}
      this.activeMediaStream = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }
    this.analyserNode = null;
  }

  static isCurrentlyListening(): boolean {
    return this.isListeningActive;
  }

  static hasHindiVoice(): boolean {
    if (typeof window === 'undefined' || !this.isSynthesisSupported()) return false;
    const voices = window.speechSynthesis.getVoices();
    return voices.some(
      (v) =>
        v.lang === 'hi-IN' ||
        v.lang === 'hi' ||
        v.lang.startsWith('hi-') ||
        /hindi|हिन्दी/i.test(v.name)
    );
  }

  static speak(
    text: string,
    lang?: 'hi-IN' | 'en-IN',
    onStart?: () => void,
    onEnd?: () => void,
    rate?: number
  ): void {
    this.stopSpeaking();

    // Clean text of markdown formatting (asterisks, hashtags, backticks, emojis, URLs)
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    // Detect actual language from the text content:
    // If text contains ANY Devanagari characters, it is 100% Hindi and MUST be spoken in Hindi!
    const isDevanagari = /[\u0900-\u097F]/.test(cleanText);
    const targetLang: 'hi-IN' | 'en-IN' = isDevanagari ? 'hi-IN' : (lang || 'en-IN');

    // 1. If Hindi:
    if (targetLang === 'hi-IN') {
      const voices =
        typeof window !== 'undefined' && this.isSynthesisSupported()
          ? window.speechSynthesis.getVoices()
          : [];
      const matchedHindiVoice = voices.find(
        (v) =>
          v.lang === 'hi-IN' ||
          v.lang === 'hi' ||
          v.lang.startsWith('hi-') ||
          /hindi|हिन्दी/i.test(v.name)
      );

      // If browser has a native Hindi voice, use SpeechSynthesisUtterance
      if (matchedHindiVoice && this.isSynthesisSupported()) {
        try {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'hi-IN';
          utterance.rate = rate !== undefined ? rate : 0.95;
          utterance.pitch = 1.0;
          utterance.voice = matchedHindiVoice;

          this.currentUtterance = utterance;

          utterance.onstart = () => {
            this.isSpeaking = true;
            if (onStart) onStart();
          };

          utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            if (this.resumeInterval) {
              clearInterval(this.resumeInterval);
              this.resumeInterval = null;
            }
            if (onEnd) onEnd();
          };

          utterance.onerror = (e) => {
            console.warn('[SpeechHandler] Hindi Web Speech synthesis error, falling back to server TTS:', e);
            this.stopSpeaking();
            this.playViaAudioEndpoint(cleanText, 'hi', onStart, onEnd, rate);
          };

          if (this.resumeInterval) clearInterval(this.resumeInterval);
          this.resumeInterval = setInterval(() => {
            if (
              typeof window !== 'undefined' &&
              window.speechSynthesis?.speaking &&
              !window.speechSynthesis.paused
            ) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            }
          }, 10000);

          window.speechSynthesis.speak(utterance);
          return;
        } catch (synthErr) {
          console.warn('[SpeechHandler] Web Speech error, falling back to server TTS:', synthErr);
        }
      }

      // If no native Hindi voice is present in the browser or OS (very common on Windows),
      // play crystal-clear, high-quality Hindi speech via the server-side /api/tts endpoint:
      this.playViaAudioEndpoint(cleanText, 'hi', onStart, onEnd, rate);
      return;
    }

    // 2. Otherwise English:
    if (this.isSynthesisSupported()) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-IN';
      utterance.rate = rate !== undefined ? rate : 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice =
        voices.find((v) => v.lang === 'en-IN' || (/india/i.test(v.name) && v.lang.startsWith('en'))) ||
        voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en'));

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      this.currentUtterance = utterance;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (this.resumeInterval) {
          clearInterval(this.resumeInterval);
          this.resumeInterval = null;
        }
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('[SpeechHandler] English TTS utterance error, trying audio fallback:', e);
        this.stopSpeaking();
        this.playViaAudioEndpoint(cleanText, 'en', onStart, onEnd, rate);
      };

      if (this.resumeInterval) clearInterval(this.resumeInterval);
      this.resumeInterval = setInterval(() => {
        if (
          typeof window !== 'undefined' &&
          window.speechSynthesis?.speaking &&
          !window.speechSynthesis.paused
        ) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      window.speechSynthesis.speak(utterance);
    } else {
      this.playViaAudioEndpoint(cleanText, 'en', onStart, onEnd, rate);
    }
  }

  private static playViaAudioEndpoint(
    text: string,
    lang: 'hi' | 'en',
    onStart?: () => void,
    onEnd?: () => void,
    rate?: number
  ): void {
    if (typeof window === 'undefined') return;

    try {
      const audioUrl = `/api/tts?lang=${lang}&text=${encodeURIComponent(text)}`;
      const audio = new Audio(audioUrl);
      if (rate !== undefined) {
        audio.playbackRate = rate;
      }
      this.activeAudioElement = audio;
      this.isSpeaking = true;

      audio.onplay = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.activeAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (err) => {
        console.warn('[SpeechHandler] Audio element playback error:', err);
        this.isSpeaking = false;
        this.activeAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.play().catch((playErr) => {
        console.warn('[SpeechHandler] audio.play() auto-play prevented or error:', playErr);
        this.isSpeaking = false;
        this.activeAudioElement = null;
        if (onEnd) onEnd();
      });
    } catch (err) {
      console.warn('[SpeechHandler] Failed to initialize Audio playback:', err);
      this.isSpeaking = false;
      this.activeAudioElement = null;
      if (onEnd) onEnd();
    }
  }

  static stopSpeaking(): void {
    if (this.activeAudioElement) {
      try {
        this.activeAudioElement.pause();
        this.activeAudioElement.currentTime = 0;
      } catch (_) {}
      this.activeAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.resumeInterval) {
        clearInterval(this.resumeInterval);
        this.resumeInterval = null;
      }
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }
}
