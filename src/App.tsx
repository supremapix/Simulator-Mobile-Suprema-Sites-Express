import React, { useState, useEffect } from 'react';
import { SMARTPHONES, PRESET_WEBSITES, PresetWebsite } from './data/smartphones';
import { PhoneSimulator } from './components/PhoneSimulator';
import { UrlTester } from './components/UrlTester';
import { SimulatedTab, BenchmarkMetrics, SimulationTest } from './types';
import { 
  Smartphone as PhoneIcon, 
  Terminal, 
  Activity, 
  Clock, 
  CheckCircle, 
  Globe, 
  Cpu, 
  Sparkles,
  RefreshCw,
  Info,
  Heart
} from 'lucide-react';

const INITIAL_METRICS_MAP = SMARTPHONES.reduce((acc, phone) => {
  acc[phone.id] = {
    currentFps: phone.refreshRate,
    cpuUsage: 8,
    ramUsage: 3.1,
    temperature: 34,
    throttlingActive: false,
    benchScore: 0,
    history: []
  };
  return acc;
}, {} as Record<string, BenchmarkMetrics>);

const INITIAL_TABS_MAP = SMARTPHONES.reduce((acc, phone) => {
  acc[phone.id] = 'browser'; // Default directly to browser tab for direct URL testing
  return acc;
}, {} as Record<string, SimulatedTab>);

export default function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('https://www.apple.com');
  const [activeTabs, setActiveTabs] = useState<Record<string, SimulatedTab>>(INITIAL_TABS_MAP);
  
  // Layout states: 1 = single focus, selected device is rendered on stage
  const [layout, setLayout] = useState<1 | 2 | 4>(1);
  const [selectedFocusDevice, setSelectedFocusDevice] = useState<string>(SMARTPHONES[0].id);

  // Benchmarking states
  const [metricsMap, setMetricsMap] = useState<Record<string, BenchmarkMetrics>>(INITIAL_METRICS_MAP);

  // Website loading test states
  const [urlLoading, setUrlLoading] = useState<boolean>(false);
  const [urlLoadProgress, setUrlLoadProgress] = useState<number>(0);
  const [urlTestedCount, setUrlTestedCount] = useState<number>(0);
  const [loadTimesMap, setLoadTimesMap] = useState<Record<string, number>>({});
  const [networkLatency, setNetworkLatency] = useState<number>(28); // Baseline ambient latency in ms
  const [lastTestResult, setLastTestResult] = useState<any>(null);

  // Interactive custom simulation test state
  const [activeTest, setActiveTest] = useState<SimulationTest>('none');

  // Filter phones to display
  const getVisiblePhones = () => {
    return SMARTPHONES.filter(p => p.id === selectedFocusDevice);
  };

  const handleMetricsUpdate = (
    deviceId: string, 
    updater: (prev: BenchmarkMetrics) => BenchmarkMetrics
  ) => {
    setMetricsMap(prev => ({
      ...prev,
      [deviceId]: updater(prev[deviceId] || {
        currentFps: 60,
        cpuUsage: 10,
        ramUsage: 3.0,
        temperature: 35,
        throttlingActive: false,
        benchScore: 0,
        history: []
      })
    }));
  };

  // Perform website URL loading speed test simulation
  const handleUrlSubmit = async (url: string) => {
    if (urlLoading) return;
    
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl) && !/^\//.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setUrlLoading(true);
    setUrlLoadProgress(5);
    
    // Switch phone to browser tab
    setActiveTabs(prev => ({
      ...prev,
      [selectedFocusDevice]: 'browser'
    }));

    const cleanUrl = formattedUrl.replace(/^https?:\/\//i, '');
    let realLatency = 25;
    
    // Simulate connection ping
    const startTime = performance.now();
    try {
      await fetch(`https://cors-anywhere-or-direct-check-fallback-if-error-or-blocked.com`, {
        mode: 'no-cors',
        signal: AbortSignal.timeout(1000)
      });
      const endTime = performance.now();
      realLatency = Math.min(180, Math.max(8, Math.round(endTime - startTime - 100)));
    } catch (e) {
      const hash = cleanUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      realLatency = 12 + (hash % 35);
    }

    setNetworkLatency(realLatency);
    setCurrentUrl(formattedUrl);

    // Animate browser loading progress
    let progress = 10;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 8;
      if (progress >= 95) {
        progress = 95;
        clearInterval(progressInterval);
      }
      setUrlLoadProgress(progress);
    }, 120);

    // Compute detailed loading profiles for chosen model
    setTimeout(() => {
      clearInterval(progressInterval);
      setUrlLoadProgress(100);
      
      const isPreset = PRESET_WEBSITES.find(w => url.toLowerCase().includes(w.name.toLowerCase()));
      const pageSizeKb = isPreset ? isPreset.sizeKb : 1200 + (Math.floor(Math.random() * 600));
      const isJsHeavy = isPreset ? isPreset.jsHeavy : true;

      const activePhone = SMARTPHONES.find(p => p.id === selectedFocusDevice) || SMARTPHONES[0];
      const phoneMetrics = metricsMap[activePhone.id];
      
      const dnsTime = Math.round(realLatency * 0.25);
      const tcpTime = Math.round(realLatency * 0.35);
      const sslTime = Math.round(realLatency * 0.4);
      const ttfb = dnsTime + tcpTime + sslTime;

      const bandwidthMultiplier = 0.8;
      const downloadTime = (pageSizeKb / 2200) * 100 * bandwidthMultiplier;
      
      const chipCoefficient = 10000 / activePhone.basePerformanceScore;
      const renderTime = (isJsHeavy ? 300 : 70) * chipCoefficient;

      const totalLoadTime = Math.round(ttfb + downloadTime + renderTime);
      
      const newLoadTimes: Record<string, number> = {
        [activePhone.id]: totalLoadTime
      };

      setLastTestResult({
        url: formattedUrl,
        dnsTime,
        tcpTime,
        sslTime,
        ttfb,
        domLoadTime: Math.round(renderTime),
        totalLoadTime,
        pageSizeKb
      });

      setLoadTimesMap(prev => ({ ...prev, ...newLoadTimes }));
      setUrlTestedCount(prev => prev + 1);
      setUrlLoading(false);
    }, 1000);
  };

  const handleSelectPreset = (preset: PresetWebsite) => {
    handleUrlSubmit(preset.url);
  };

  const activeSmartphone = SMARTPHONES.find(p => p.id === selectedFocusDevice) || SMARTPHONES[0];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-800 flex flex-col font-sans relative antialiased selection:bg-stone-900/10 selection:text-stone-900">
      
      {/* Premium Minimalist Header */}
      <header className="border-b border-stone-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center shadow-sm">
              <PhoneIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-md font-extrabold tracking-tight text-stone-900 uppercase">Teste de Navegação</h1>
                <span className="bg-stone-100 border border-stone-200 text-stone-600 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Simulador Ativo</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Teste de sites em tempo real selecionando o modelo de celular abaixo.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[10px] font-mono text-stone-500">
            <div className="bg-stone-50 border border-stone-200/80 px-3 py-1 rounded-full flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Simulação Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Field and Smartphone selection list */}
          <div className="lg:col-span-5 space-y-6">
            <UrlTester 
              currentUrl={currentUrl}
              onUrlSubmit={handleUrlSubmit}
              isLoading={urlLoading}
              onSelectPreset={handleSelectPreset}
              networkLatency={networkLatency}
              smartphones={SMARTPHONES}
              selectedFocusDevice={selectedFocusDevice}
              onSelectDevice={(id) => {
                setSelectedFocusDevice(id);
                // Trigger reload for the new device
                setTimeout(() => {
                  handleUrlSubmit(currentUrl);
                }, 50);
              }}
            />

            {/* Simulated Latency Diagnostics */}
            {lastTestResult && (
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-md shadow-stone-100/30 text-left space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-stone-500" />
                    <span>Tempo de Resposta em {activeSmartphone.model}</span>
                  </h3>
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {lastTestResult.totalLoadTime}ms
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-500">Tempo de Resposta (TTFB):</span>
                    <span className="text-stone-800 font-semibold">{lastTestResult.ttfb} ms</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-stone-700 h-full rounded-full" style={{ width: `${Math.min(100, (lastTestResult.ttfb / lastTestResult.totalLoadTime) * 100)}%` }} />
                  </div>

                  <div className="flex justify-between font-mono">
                    <span className="text-stone-500">Tempo de Processamento DOM:</span>
                    <span className="text-stone-800 font-semibold">{lastTestResult.domLoadTime} ms</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-stone-500 h-full rounded-full" style={{ width: `${Math.min(100, (lastTestResult.domLoadTime / lastTestResult.totalLoadTime) * 100)}%` }} />
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex justify-between text-[11px] text-stone-400">
                    <span>Tamanho do site estimado:</span>
                    <span className="font-mono text-stone-600 font-semibold">{(lastTestResult.pageSizeKb / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Central Smartphone Simulator Canvas */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            <div className="w-full bg-white border border-stone-200/80 rounded-[32px] p-6 md:p-8 flex flex-col items-center justify-center shadow-lg shadow-stone-100/50 relative overflow-hidden">
              {/* Subtle Grid dots background to make the mockup pop */}
              <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
              
              {/* Device Frame */}
              <div className="relative w-full max-w-[320px] z-10">
                {getVisiblePhones().map((phone) => (
                  <PhoneSimulator 
                    key={phone.id}
                    smartphone={phone}
                    currentUrl={currentUrl}
                    onUrlChange={setCurrentUrl}
                    activeTab={activeTabs[phone.id] || 'browser'}
                    setActiveTab={(tab) => {
                      setActiveTabs(prev => ({ ...prev, [phone.id]: tab }));
                    }}
                    stressActive={false}
                    stressIntensity="medium"
                    metrics={metricsMap[phone.id] || {
                      currentFps: phone.refreshRate,
                      cpuUsage: 8,
                      ramUsage: 3.1,
                      temperature: 34,
                      throttlingActive: false,
                      benchScore: 0,
                      history: []
                    }}
                    onMetricsUpdate={handleMetricsUpdate}
                    urlLoading={urlLoading}
                    urlLoadProgress={urlLoadProgress}
                    urlTestedCount={urlTestedCount}
                    lastTestResult={lastTestResult}
                    activeTest={activeTest}
                  />
                ))}
              </div>

              {/* Minimalist instruction caption underneath */}
              <div className="mt-6 flex items-center space-x-2 text-[11px] text-stone-400">
                <Info className="w-3.5 h-3.5" />
                <span>O celular renderiza o iframe do site ou um mockup se a origem for bloqueada.</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Elegant, minimalist footer */}
      <footer className="border-t border-stone-200/60 bg-white py-8 px-6 text-center text-xs text-stone-400 font-mono mt-auto space-y-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Simulador de Navegação Mobile. Todos os direitos reservados para teste.supremasite.com.br</p>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1">
              <Terminal className="w-3.5 h-3.5 text-stone-400" /> 
              <span>Vite + React 19</span>
            </span>
            <span>•</span>
            <span className="text-stone-500 font-semibold">90% Light Design</span>
          </div>
        </div>
        
        {/* Render SupremaCredit inside footer */}
        <SupremaCredit />
      </footer>

    </div>
  );
}

export function SupremaCredit() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-4 border-t border-slate-200/50 flex justify-center items-center">
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-full px-6 py-2.5 shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
        <p className="text-slate-200 hover:text-white transition-colors duration-200 text-sm sm:text-base font-bold flex flex-wrap items-center justify-center gap-2">
          <span className="opacity-90">Desenvolvido com</span> 
          
          {/* Coração pulsante com efeito de sombra */}
          <Heart 
            size={14} 
            className="text-red-500 animate-[pulse_1.5s_infinite] shrink-0 filter drop-shadow-[0_0_3px_rgba(239,68,68,0.7)]" 
          /> 
          
          <span className="opacity-90">por</span>
          
          {/* Link para o site da Suprema */}
          <a 
            id="developer-suprema-link"
            href="https://supremasite.com.br" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-yellow-400 hover:text-yellow-300 transition-all font-black inline-flex items-center gap-2 cursor-pointer border-b border-dashed border-yellow-400/50 hover:border-yellow-300"
          >
            Suprema Sites Express
            
            {/* Logotipo oficial com efeito de iluminação */}
            <img 
              src="https://img.supremamidia.com/suprema-img.png" 
              alt="Suprema" 
              className="h-[18px] w-auto inline select-none shrink-0 filter drop-shadow-[0_0_2px_rgba(250,204,21,0.5)] transition-transform duration-300 hover:scale-110" 
              referrerPolicy="no-referrer"
            />
          </a>
        </p>
      </div>
    </div>
  );
}
