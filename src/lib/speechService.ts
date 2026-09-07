// Web Speech API Voice Layer (STT & TTS)
// Satisfies FR-5.2 and rural accessibility (bilingual voice input/output)

export class SpeechHandler {
  private static recognitionInstance: any = null;
  private static isSpeaking: boolean = false;

  static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  static isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  static startListening(
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    lang: 'hi-IN' | 'en-IN' = 'hi-IN'
  ): () => void {
    if (!this.isRecognitionSupported()) {
      onError(new Error('Speech recognition not supported in this browser.'));
      return () => {};
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    this.recognitionInstance = recognition;

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      onError(event.error);
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
    }

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
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

    const utterance = new SpeechSynthesisUtterance(text);
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
