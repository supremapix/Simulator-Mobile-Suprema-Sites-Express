import { Smartphone } from '../types';

export const SMARTPHONES: Smartphone[] = [
  {
    id: 'iphone-16-pro-max',
    brand: 'Apple',
    model: 'iPhone 16 Pro Max',
    chipset: 'Apple A18 Pro (3nm)',
    gpu: 'Apple GPU (6-core graphics)',
    cpuDetails: 'Hexa-core (2x4.04 GHz + 4x2.20 GHz)',
    ram: 8,
    storage: '256GB / 512GB / 1TB',
    screenSize: '6.9"',
    resolution: '1320 x 2868 px',
    refreshRate: 120,
    osName: 'iOS',
    osVersion: '18.1 / iOS 18.2',
    battery: '4685 mAh (30W)',
    colors: ['Natural Titanium', 'Desert Titanium', 'White Titanium', 'Black Titanium'],
    selectedColor: 'Natural Titanium',
    basePerformanceScore: 11200,
    cameraSpecs: '48MP (Main) + 48MP (Ultrawide) + 12MP (Telephoto 5x)',
    accentColor: '#9F8E7D', // Natural Titanium
  },
  {
    id: 'galaxy-s25-ultra',
    brand: 'Samsung',
    model: 'Galaxy S25 Ultra',
    chipset: 'Snapdragon 8 Elite (3nm)',
    gpu: 'Adreno 830 (1.1 GHz)',
    cpuDetails: 'Octa-core (2x4.32 GHz + 6x3.53 GHz)',
    ram: 12,
    storage: '256GB / 512GB / 1TB',
    screenSize: '6.8"',
    resolution: '1440 x 3120 px',
    refreshRate: 120,
    osName: 'One UI',
    osVersion: 'One UI 7.0 (Android 15)',
    battery: '5000 mAh (45W)',
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Silver', 'Titanium Blue'],
    selectedColor: 'Titanium Gray',
    basePerformanceScore: 11400,
    cameraSpecs: '200MP (Main) + 50MP (Periscope 5x) + 50MP (Telephoto 3x) + 50MP (Ultrawide)',
    accentColor: '#4E545F', // Titanium Gray
  },
  {
    id: 'pixel-9-pro-xl',
    brand: 'Google',
    model: 'Pixel 9 Pro XL',
    chipset: 'Google Tensor G4 (4nm)',
    gpu: 'Mali-G715 MC10',
    cpuDetails: 'Octa-core (1x3.1 GHz + 3x2.6 GHz + 4x1.92 GHz)',
    ram: 16,
    storage: '128GB / 256GB / 512GB / 1TB',
    screenSize: '6.8"',
    resolution: '1344 x 2992 px',
    refreshRate: 120,
    osName: 'Pixel UI',
    osVersion: 'Android 15 / Pixel UI 9',
    battery: '5060 mAh (37W)',
    colors: ['Porcelain', 'Rose Quartz', 'Hazel', 'Obsidian'],
    selectedColor: 'Porcelain',
    basePerformanceScore: 8400,
    cameraSpecs: '50MP (Main) + 48MP (Telephoto 5x) + 48MP (Ultrawide)',
    accentColor: '#D1CBC4', // Porcelain
  },
  {
    id: 'xiaomi-15-pro',
    brand: 'Xiaomi',
    model: 'Xiaomi 15 Pro',
    chipset: 'Snapdragon 8 Elite (3nm)',
    gpu: 'Adreno 830',
    cpuDetails: 'Octa-core (2x4.32 GHz + 6x3.53 GHz)',
    ram: 16,
    storage: '256GB / 512GB / 1TB',
    screenSize: '6.73"',
    resolution: '1440 x 3200 px',
    refreshRate: 120,
    osName: 'HyperOS',
    osVersion: 'Xiaomi HyperOS 2.0 (Android 15)',
    battery: '6100 mAh (90W)',
    colors: ['Spruce Green', 'Rock Gray', 'White', 'Liquid Silver'],
    selectedColor: 'Spruce Green',
    basePerformanceScore: 11150,
    cameraSpecs: '50MP (Main Leica) + 50MP (Periscope 5x) + 50MP (Ultrawide)',
    accentColor: '#2D3E35', // Spruce Green
  }
];

export interface PresetWebsite {
  name: string;
  url: string;
  category: 'Tech' | 'Reference' | 'Developer' | 'Media' | 'AI';
  sizeKb: number;
  jsHeavy: boolean;
  color: string;
  title: string;
}

export const PRESET_WEBSITES: PresetWebsite[] = [
  {
    name: 'Apple.com',
    url: 'https://www.apple.com',
    category: 'Tech',
    sizeKb: 1850,
    jsHeavy: true,
    color: '#000000',
    title: 'Apple - Shop, Support & Vision'
  },
  {
    name: 'Wikipedia.org',
    url: 'https://en.wikipedia.org',
    category: 'Reference',
    sizeKb: 320,
    jsHeavy: false,
    color: '#555555',
    title: 'Wikipedia, the free encyclopedia'
  },
  {
    name: 'GitHub.com',
    url: 'https://github.com',
    category: 'Developer',
    sizeKb: 1240,
    jsHeavy: true,
    color: '#24292e',
    title: 'GitHub: Let’s build from here'
  },
  {
    name: 'YouTube.com',
    url: 'https://www.youtube.com',
    category: 'Media',
    sizeKb: 2500,
    jsHeavy: true,
    color: '#FF0000',
    title: 'YouTube - Watch & Share Videos'
  },
  {
    name: 'OpenAI.com',
    url: 'https://openai.com',
    category: 'AI',
    sizeKb: 980,
    jsHeavy: true,
    color: '#0f0f11',
    title: 'OpenAI - Shaping the Future of AI'
  }
];
