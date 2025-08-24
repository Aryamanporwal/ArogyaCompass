
interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    Pose: any;
    POSE_CONNECTIONS: any;
    Camera: new (
      videoElement: HTMLVideoElement,
      options: {
        onFrame: () => Promise<void> | void;
        width?: number;
        height?: number;
      }
    ) => { start: () => void; stop: () => void };

    drawConnectors: (
      ctx: CanvasRenderingContext2D,
      landmarks: any,
      connections: any,
      style?: { color?: string; lineWidth?: number }
    ) => void;

    drawLandmarks: (
      ctx: CanvasRenderingContext2D,
      landmarks: any,
      style?: { color?: string; lineWidth?: number }
    ) => void;
  }

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;

  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;

  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
