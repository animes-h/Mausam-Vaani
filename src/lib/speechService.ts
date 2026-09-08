// Web Speech API Voice Layer (STT & TTS)
// Satisfies FR-5.2 and rural accessibility (bilingual voice input/output)

export interface StartListeningOptions {
  onResult: (transcript: string) => void;
  onInterim?: (interimTranscript: string) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
  lang?: 'hi-IN' | 'en-IN';
  pauseTimeoutMs?: number;
  initialTimeoutMs?: number;
}

export class SpeechHandler {
  private static recognitionInstance: any = null;
  private static isSpeaking: boolean = false;
  private static isListeningActive: boolean = false;
  private static accumulatedTranscript: string = '';
  private static silenceTimer: any = null;
  private static initialSilenceTimer: any = null;
  private static onFinalResultCallback: ((transcript: string) => void) | null = null;
  private static onInterimCallback: ((interim: string) => void) | null = null;
  private static onErrorCallback: ((err: any) => void) | null = null;
  private static onEndCallback: (() => void) | null = null;

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
   * Does NOT auto-shutoff after 1-2 seconds of silence.
   * Streams interim transcripts in real time.
   */
  static startListening(
    onResultOrOptions: ((transcript: string) => void) | StartListeningOptions,
    onError?: (err: any) => void,
    lang: 'hi-IN' | 'en-IN' = 'hi-IN',
    onInterim?: (interim: string) => void
  ): () => void {
    if (!this.isRecognitionSupported()) {
      const err = new Error('Speech recognition not supported in this browser.');
      if (typeof onResultOrOptions === 'object' && onResultOrOptions.onError) {
        onResultOrOptions.onError(err);
      } else if (onError) {
        onError(err);
      }
      return () => {};
    }

    // Parse arguments
    let opts: StartListeningOptions;
    if (typeof onResultOrOptions === 'function') {
      opts = {
        onResult: onResultOrOptions,
        onError,
        lang: lang || 'hi-IN',
        onInterim,
        pauseTimeoutMs: 2500, // 2.5 seconds pause after speaking completes the query
        initialTimeoutMs: 12000, // 12 seconds grace period to begin speaking
      };
    } else {
      opts = {
        pauseTimeoutMs: 2500,
        initialTimeoutMs: 12000,
        ...onResultOrOptions,
        lang: onResultOrOptions.lang || 'hi-IN',
      };
    }

    // Stop previous session if still running
    this.stopListening(false);

    // Cancel speech synthesis so microphone doesn't pick up speaker audio
    this.stopSpeaking();

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    this.recognitionInstance = recognition;
    this.isListeningActive = true;
    this.accumulatedTranscript = '';
    this.onFinalResultCallback = opts.onResult;
    this.onInterimCallback = opts.onInterim || null;
    this.onErrorCallback = opts.onError || null;
    this.onEndCallback = opts.onEnd || null;

    // CONTINUOUS listening: prevents browser from cutting off after 1-2 seconds!
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = opts.lang || 'hi-IN';

    const clearTimers = () => {
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      if (this.initialSilenceTimer) {
        clearTimeout(this.initialSilenceTimer);
        this.initialSilenceTimer = null;
      }
    };

    // Initial silence timer: 12 seconds grace period for user to begin speaking
    this.initialSilenceTimer = setTimeout(() => {
      if (this.isListeningActive && !this.accumulatedTranscript.trim()) {
        console.log('[SpeechHandler] Initial silence timeout reached (12s).');
        this.stopListening(true);
      }
    }, opts.initialTimeoutMs || 12000);

    recognition.onresult = (event: any) => {
      clearTimers();

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

        // Stream live interim transcript to the UI
        if (this.onInterimCallback) {
          this.onInterimCallback(currentText);
        }

        // Natural pause detection: user stopped speaking for 2.5s -> finish query!
        this.silenceTimer = setTimeout(() => {
          if (this.isListeningActive && this.accumulatedTranscript.trim()) {
            console.log('[SpeechHandler] Natural pause detected, finalizing query:', this.accumulatedTranscript);
            this.finalizeAndSubmit();
          }
        }, opts.pauseTimeoutMs || 2500);
      }
    };

    recognition.onerror = (event: any) => {
      console.log('[SpeechHandler] recognition.onerror:', event.error);

      // 'no-speech' is a normal transient event in Web Speech API.
      // Do NOT kill the microphone on 'no-speech'!
      if (event.error === 'no-speech') {
        return;
      }

      if (event.error === 'aborted') {
        // Deliberate user abort or internal restart
        return;
      }

      if (event.error === 'not-allowed') {
        this.isListeningActive = false;
        clearTimers();
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('Microphone access blocked. Please allow microphone permission.'));
        }
        return;
      }

      // If we already have spoken text despite a network/audio glitch, finalize with that text
      if (this.accumulatedTranscript.trim()) {
        this.finalizeAndSubmit();
      } else if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    recognition.onend = () => {
      console.log('[SpeechHandler] recognition.onend fired. isListeningActive:', this.isListeningActive);

      // If we are still supposed to be listening:
      if (this.isListeningActive) {
        // If the user spoke something and paused, finalize
        if (this.accumulatedTranscript.trim()) {
          this.finalizeAndSubmit();
        } else {
          // Chrome dropped connection before user spoke; restart seamlessly
          try {
            recognition.start();
          } catch (restartErr) {
            console.warn('[SpeechHandler] Restart onend failed:', restartErr);
            this.isListeningActive = false;
            clearTimers();
            if (this.onEndCallback) this.onEndCallback();
          }
        }
      } else {
        clearTimers();
        if (this.onEndCallback) this.onEndCallback();
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('[SpeechHandler] Recognition start error:', e);
      // If already started or browser state mismatch, stop and retry
      try {
        recognition.stop();
        setTimeout(() => {
          try {
            recognition.start();
          } catch (_) {}
        }, 150);
      } catch (_) {}
    }

    return () => {
      this.stopListening(true);
    };
  }

  /**
   * Finalize and deliver accumulated transcript
   */
  private static finalizeAndSubmit(): void {
    const text = this.accumulatedTranscript.trim();
    const cb = this.onFinalResultCallback;

    this.isListeningActive = false;
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.initialSilenceTimer) clearTimeout(this.initialSilenceTimer);

    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (_) {}
      this.recognitionInstance = null;
    }

    if (text && cb) {
      cb(text);
    }
  }

  /**
   * Explicitly stop listening.
   * If submitIfText is true, submits whatever has been spoken so far.
   */
  static stopListening(submitIfText: boolean = true): string {
    this.isListeningActive = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.initialSilenceTimer) {
      clearTimeout(this.initialSilenceTimer);
      this.initialSilenceTimer = null;
    }

    const text = this.accumulatedTranscript.trim();

    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (_) {}
      this.recognitionInstance = null;
    }

    if (submitIfText && text && this.onFinalResultCallback) {
      const cb = this.onFinalResultCallback;
      this.onFinalResultCallback = null;
      cb(text);
    }

    return text;
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
