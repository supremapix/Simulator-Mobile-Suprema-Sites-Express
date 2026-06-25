export interface Smartphone {
  id: string;
  brand: 'Apple' | 'Samsung' | 'Google' | 'Xiaomi';
  model: string;
  chipset: string;
  gpu: string;
  cpuDetails: string;
  ram: number; // in GB
  storage: string;
  screenSize: string;
  resolution: string;
  refreshRate: number; // in Hz
  osName: string;
  osVersion: string;
  battery: string;
  colors: string[];
  selectedColor: string;
  basePerformanceScore: number; // For relative hardware simulation calculations
  cameraSpecs: string;
  accentColor: string; // Tailwind color class or hex
}

export interface BenchmarkMetrics {
  currentFps: number;
  cpuUsage: number;
  ramUsage: number;
  temperature: number;
  throttlingActive: boolean;
  benchScore: number;
  history: {
    time: number;
    fps: number;
    cpu: number;
    ram: number;
    temp: number;
  }[];
}

export interface UrlTestResult {
  url: string;
  dnsTime: number; // ms
  tcpTime: number; // ms
  sslTime: number; // ms
  ttfb: number; // ms
  domLoadTime: number; // ms
  totalLoadTime: number; // ms
  pageSizeKb: number;
}

export type SimulatedTab = 'browser' | 'home' | 'hardware' | 'test-panel';

export type SimulationTest = 'none' | 'ai' | 'gpu' | '5g' | 'ram' | 'thermal';

