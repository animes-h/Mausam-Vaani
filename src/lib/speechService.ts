// Web Speech API Voice Layer (STT & TTS) + MediaRecorder Audio Resilience
// Satisfies FR-5.2 and rural accessibility (bilingual voice input/output)

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

        if (this.isListeningActive) {
          if (this.accumulatedTranscript.trim()) {
            // User finished speaking and recognition completed
            this.finalizeAndSubmit();
          } else if (!this.isCloudSttBlocked) {
            // Restart recognition gracefully after a slight delay to avoid Chrome InvalidStateError
            setTimeout(() => {
              if (this.isListeningActive && this.recognitionInstance && !this.isCloudSttBlocked) {
                try {
                  this.recognitionInstance.start();
                } catch (restartErr) {
                  console.log('[SpeechHandler] Seamless restart deferred:', restartErr);
                }
              }
            }, 350);
          }
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
   * Finalize and deliver accumulated transcript and recorded audio blob
   */
  private static finalizeAndSubmit(): void {
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

    // Stop MediaRecorder and build blob
    let audioBlob: Blob | undefined;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (_) {}
    }

    if (this.recordedChunks.length > 0) {
      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      audioBlob = new Blob(this.recordedChunks, { type: mimeType });
    }

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
  static stopListening(submitIfText: boolean = true): { text: string; audioBlob?: Blob } {
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

    let audioBlob: Blob | undefined;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (_) {}
    }

    if (this.recordedChunks.length > 0) {
      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      audioBlob = new Blob(this.recordedChunks, { type: mimeType });
    }

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

  static speak(
    text: string,
    lang: 'hi-IN' | 'en-IN' = 'hi-IN',
    onStart?: () => void,
    onEnd?: () => void,
    rate?: number
  ): void {
    if (!this.isSynthesisSupported()) return;

    // Cancel active utterance
    window.speechSynthesis.cancel();

    // Clean text of markdown formatting (asterisks, hashtags, backticks, emojis)
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = rate !== undefined ? rate : (lang === 'hi-IN' ? 0.95 : 1.0);
    utterance.pitch = 1.0;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === lang || v.lang.startsWith(lang.substring(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  static stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}
