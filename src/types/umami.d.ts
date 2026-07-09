export interface UmamiPayload {
  hostname: string;
  language: string;
  referrer: string;
  screen: string;
  title: string;
  url: string;
  website: string;
  [key: string]: unknown;
}

export interface UmamiTracker {
  track: {
    (payload?: Partial<UmamiPayload>): Promise<void>;
    (fn: (props: UmamiPayload) => Partial<UmamiPayload>): Promise<void>;
    (eventName: string, data?: Record<string, unknown>): Promise<void>;
  };
  identify?: (data: Record<string, unknown>) => Promise<void>;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

export {};
