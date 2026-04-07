declare global {
  interface Window {
    viNotesDesktop?: {
      platform: string;
      appMode: "desktop";
    };
  }
}

export {};
