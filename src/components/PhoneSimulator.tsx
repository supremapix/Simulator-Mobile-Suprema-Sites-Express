import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  BenchmarkMetrics, 
  SimulatedTab,
  SimulationTest
} from '../types';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Globe, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  X, 
  Check, 
  Home, 
  Cpu, 
  Clock, 
  Zap, 
  Thermometer, 
  TrendingDown, 
  Activity,
  Maximize2,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen,
  Github,
  Play,
  Heart,
  MessageSquare,
  Flame,
  MousePointer,
  RefreshCw
} from 'lucide-react';
import { PRESET_WEBSITES } from '../data/smartphones';
import { InteractiveTestScreen } from './InteractiveTestScreen';

interface PhoneSimulatorProps {
  smartphone: Smartphone;
  currentUrl: string;
  onUrlChange: (url: string) => void;
  activeTab: SimulatedTab;
  setActiveTab: (tab: SimulatedTab) => void;
  stressActive: boolean;
  stressIntensity: 'low' | 'medium' | 'extreme';
  metrics: BenchmarkMetrics;
  onMetricsUpdate: (deviceId: string, updater: (prev: BenchmarkMetrics) => BenchmarkMetrics) => void;
  urlLoading: boolean;
  urlLoadProgress: number;
  urlTestedCount: number;
  lastTestResult: any;
  activeTest: SimulationTest;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  smartphone,
  currentUrl,
  onUrlChange,
  activeTab,
  setActiveTab,
  stressActive,
  stressIntensity,
  metrics,
  onMetricsUpdate,
  urlLoading,
  urlLoadProgress,
  urlTestedCount,
  lastTestResult,
  activeTest
}) => {
  const [browserHistory, setBrowserHistory] = useState<string[]>([currentUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [localUrlInput, setLocalUrlInput] = useState(currentUrl);
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState(false);
  const [edgePanelOpen, setEdgePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [browserViewMode, setBrowserViewMode] = useState<'iframe' | 'hud'>('iframe');
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const particleArray = useRef<any[]>([]);

  // Update local URL input when currentUrl changes from parent
  useEffect(() => {
    setLocalUrlInput(currentUrl);
    if (browserHistory[historyIndex] !== currentUrl) {
      const newHist = browserHistory.slice(0, historyIndex + 1);
      setBrowserHistory([...newHist, currentUrl]);
      setHistoryIndex(newHist.length);
    }
  }, [currentUrl]);

  // Set default view mode based on whether the URL is a preset
  useEffect(() => {
    const isPreset = PRESET_WEBSITES.some(w => currentUrl.toLowerCase().includes(w.name.toLowerCase()));
    setBrowserViewMode(isPreset ? 'hud' : 'iframe');
  }, [currentUrl]);

  // Handle hardware telemetry simulation loop
  useEffect(() => {
    let intervalId = setInterval(() => {
      onMetricsUpdate(smartphone.id, (prev) => {
        // Calculate target metrics based on whether stress test is active
        let targetCpu = 8 + Math.random() * 7; // ambient
        let targetRam = 3.2 + Math.random() * 0.4;
        let targetTemp = 35 + Math.random() * 2;
        let targetFps = smartphone.refreshRate;

        if (stressActive) {
          const intensityMultiplier = 
            stressIntensity === 'low' ? 1.0 : 
            stressIntensity === 'medium' ? 1.8 : 2.5;

          // Apple A17 Pro (9580) and Snapdragon (9420) handle stress better than Tensor G4 (8250)
          const chipFactor = 10000 / smartphone.basePerformanceScore; // higher for weaker chips

          targetCpu = Math.min(99, (50 + Math.random() * 15) * intensityMultiplier);
          targetRam = Math.min(smartphone.ram - 0.5, (5.5 + Math.random() * 1.5) * intensityMultiplier);
          
          // Temperature increases over time during stress test, throttled by chip efficiency
          const tempRiseRate = 1.2 * intensityMultiplier * chipFactor;
          targetTemp = Math.min(85, prev.temperature + tempRiseRate);
          
          // Thermal Throttling kicks in if temp > 68°C
          const throttling = targetTemp > 68;
          const fpsLoss = throttling ? (targetTemp - 68) * 1.8 : 0;
          
          // Compute simulated FPS drops based on stress load and chip factor
          const baseFpsDrop = (stressIntensity === 'low' ? 5 : stressIntensity === 'medium' ? 25 : 55) * chipFactor;
          targetFps = Math.max(12, Math.round(smartphone.refreshRate - baseFpsDrop - fpsLoss + (Math.random() * 6 - 3)));
        } else {
          // Cooldown phase
          targetTemp = Math.max(35, prev.temperature - 1.5);
          targetFps = Math.round(smartphone.refreshRate - (Math.random() * 2));
        }

        const throttling = targetTemp > 68;

        // Cumulative simulated Score calculation
        let testScoreAddition = 0;
        if (stressActive) {
          const baseIncrement = stressIntensity === 'low' ? 15 : stressIntensity === 'medium' ? 45 : 110;
          const efficiencyBonus = smartphone.basePerformanceScore / 8000;
          testScoreAddition = Math.round(baseIncrement * efficiencyBonus * (throttling ? 0.7 : 1));
        }

        const nextBenchScore = stressActive ? prev.benchScore + testScoreAddition : prev.benchScore;

        // Maintain metrics history
        const newHistoryPoint = {
          time: prev.history.length > 0 ? prev.history[prev.history.length - 1].time + 1 : 0,
          fps: targetFps,
          cpu: Math.round(targetCpu),
          ram: parseFloat(targetRam.toFixed(1)),
          temp: Math.round(targetTemp),
        };

        const newHistory = [...prev.history, newHistoryPoint].slice(-25);

        return {
          currentFps: targetFps,
          cpuUsage: Math.round(targetCpu),
          ramUsage: parseFloat(targetRam.toFixed(1)),
          temperature: Math.round(targetTemp),
          throttlingActive: throttling,
          benchScore: nextBenchScore,
          history: newHistory,
        };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [stressActive, stressIntensity, smartphone.id]);

  // Handle interactive Canvas physics rendering inside Hardware benchmark panel
  useEffect(() => {
    if (activeTab === 'hardware' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Adjust to container sizes
      const resizeCanvas = () => {
        const rect = canvas.parentElement?.getBoundingClientRect();
        canvas.width = rect?.width || 280;
        canvas.height = rect?.height || 220;
      };
      resizeCanvas();

      // Particle class
      class Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;

        constructor(width: number, height: number) {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.vx = (Math.random() - 0.5) * 4;
          this.vy = (Math.random() - 0.5) * 4;
          this.size = Math.random() * 4 + 1.5;
          // Accent colors of different smartphone brands
          const colors = [smartphone.accentColor, '#FF3B30', '#34C759', '#007AFF', '#FFD60A'];
          this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update(width: number, height: number, speedMultiplier: number) {
          this.x += this.vx * speedMultiplier;
          this.y += this.vy * speedMultiplier;

          if (this.x < 0 || this.x > width) this.vx = -this.vx;
          if (this.y < 0 || this.y > height) this.vy = -this.vy;
        }

        draw(cContext: CanvasRenderingContext2D) {
          cContext.beginPath();
          cContext.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          cContext.fillStyle = this.color;
          cContext.fill();
        }
      }

      // Initialize particles based on stress activity
      const initParticles = () => {
        const count = stressActive 
          ? (stressIntensity === 'low' ? 120 : stressIntensity === 'medium' ? 350 : 800)
          : 40;
        
        particleArray.current = [];
        for (let i = 0; i < count; i++) {
          particleArray.current.push(new Particle(canvas.width, canvas.height));
        }
      };
      initParticles();

      // Animation Loop
      const render = () => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // trail effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate visual FPS based on simulation metrics to keep canvas in sync with benchmark values
        const speedMultiplier = stressActive ? (metrics.currentFps / smartphone.refreshRate) * 1.5 : 1.0;

        particleArray.current.forEach(p => {
          p.update(canvas.width, canvas.height, speedMultiplier);
          p.draw(ctx);
        });

        // Draw particle connect lines if in medium/high stress (heavy rendering path)
        if (stressActive && (stressIntensity === 'medium' || stressIntensity === 'extreme')) {
          ctx.strokeStyle = `${smartphone.accentColor}1A`;
          ctx.lineWidth = 0.5;
          for (let i = 0; i < particleArray.current.length; i += 3) {
            for (let j = i + 1; j < Math.min(i + 5, particleArray.current.length); j++) {
              const dx = particleArray.current[i].x - particleArray.current[j].x;
              const dy = particleArray.current[i].y - particleArray.current[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < (stressIntensity === 'extreme' ? 45 : 35)) {
                ctx.beginPath();
                ctx.moveTo(particleArray.current[i].x, particleArray.current[i].y);
                ctx.lineTo(particleArray.current[j].x, particleArray.current[j].y);
                ctx.stroke();
              }
            }
          }
        }

        // Draw active workload lines
        ctx.fillStyle = `${smartphone.accentColor}`;
        ctx.font = '10px monospace';
        ctx.fillText(`RENDERING: ${particleArray.current.length} ACTIVE NODES`, 10, 20);
        ctx.fillText(`FPS: ${metrics.currentFps}`, 10, 34);
        ctx.fillText(`CORE TEMP: ${metrics.temperature}°C`, 10, 48);

        // Simulate micro benchmarks
        if (stressActive) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(10, canvas.height - 15, (canvas.width - 20) * (metrics.cpuUsage / 100), 4);
          ctx.fillText(`WORKLOAD COMPILING: ${metrics.cpuUsage}%`, 10, canvas.height - 22);
        }

        animationFrameId.current = requestAnimationFrame(render);
      };

      render();

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [activeTab, stressActive, stressIntensity, metrics.currentFps]);

  const handleNavigate = (url: string) => {
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }
    setLocalUrlInput(cleanUrl);
    onUrlChange(cleanUrl);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevUrl = browserHistory[prevIndex];
      setLocalUrlInput(prevUrl);
      onUrlChange(prevUrl);
    }
  };

  const handleForward = () => {
    if (historyIndex < browserHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextUrl = browserHistory[nextIndex];
      setLocalUrlInput(nextUrl);
      onUrlChange(nextUrl);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onUrlChange(currentUrl);
    }, 800);
  };

  const detectActivePreset = () => {
    return PRESET_WEBSITES.find(w => currentUrl.toLowerCase().includes(w.name.toLowerCase()));
  };

  const preset = detectActivePreset();

  return (
    <div id={`phone-${smartphone.id}`} className="flex flex-col items-center">
      {/* Phone chassis frame */}
      <div 
        className="relative mx-auto rounded-[48px] border-[10px] border-slate-900 bg-black shadow-2xl transition-all duration-300"
        style={{
          width: '320px',
          height: '660px',
          borderColor: smartphone.accentColor,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px ${smartphone.accentColor}20`
        }}
      >
        {/* Antennas & physical side buttons */}
        <div className="absolute -left-3 top-24 w-1 h-12 bg-slate-800 rounded-l" />
        <div className="absolute -left-3 top-40 w-1 h-16 bg-slate-800 rounded-l" />
        <div className="absolute -left-3 top-60 w-1 h-16 bg-slate-800 rounded-l" />
        <div className="absolute -right-3 top-32 w-1 h-20 bg-slate-800 rounded-r" />

        {/* Dynamic Island or camera notch */}
        {smartphone.brand === 'Apple' ? (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
            <motion.div 
              animate={{ 
                width: dynamicIslandExpanded ? 240 : 85,
                height: dynamicIslandExpanded ? 64 : 24,
                borderRadius: dynamicIslandExpanded ? 24 : 12,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
              className="bg-black border border-slate-800/50 cursor-pointer flex items-center justify-between px-3 text-white overflow-hidden shadow-lg select-none"
            >
              {!dynamicIslandExpanded ? (
                <div className="flex items-center justify-between w-full h-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {stressActive && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    {urlLoading && <Activity className="w-3 h-3 text-emerald-400 animate-spin" />}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full h-full text-[10px] py-1 px-1">
                  <div className="flex flex-col text-left justify-center pl-1">
                    <span className="font-semibold text-[11px] text-slate-100 truncate w-32">
                      {stressActive ? 'BENCHMARK ATIVO' : urlLoading ? 'Carregando URL...' : 'iPhone 15 Pro Max'}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {stressActive ? `${metrics.currentFps} FPS | Temp: ${metrics.temperature}°C` : 'A17 Pro Neural Engine'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-2 py-1 bg-slate-900 rounded-full text-[9px] text-amber-400 border border-slate-800 flex items-center space-x-1 font-mono">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{metrics.benchScore} pts</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Punch hole camera for Android flagships */
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-950" />
            </div>
          </div>
        )}

        {/* Screen layout */}
        <div className="w-full h-full overflow-hidden bg-slate-950 rounded-[38px] flex flex-col relative select-none">
          {/* Status bar */}
          <div className="h-8 pt-2.5 px-6 flex justify-between items-center text-white text-[11px] font-medium z-40 select-none bg-black/10 backdrop-blur-xs">
            <span className="font-sans leading-none">05:50</span>
            <div className="flex items-center space-x-1 text-slate-200">
              <Signal className="w-3 h-3" />
              <span className="text-[9px] leading-none pr-0.5">5G</span>
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Active Screen Content */}
          <div className="flex-1 w-full relative flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Lock screen / Home screen tab */}
              {activeTab === 'home' && (
                <motion.div 
                  key="home-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex flex-col justify-between px-6 pb-8 bg-cover bg-center"
                  style={{
                    backgroundImage: smartphone.brand === 'Apple' 
                      ? 'linear-gradient(to bottom, #111827, #312e81, #1e1b4b)' 
                      : smartphone.brand === 'Samsung'
                      ? 'linear-gradient(to bottom, #020617, #0f172a, #312e81)'
                      : smartphone.brand === 'Google'
                      ? 'linear-gradient(to bottom, #0f172a, #1e1b4b, #581c87)'
                      : 'linear-gradient(to bottom, #0f172a, #111827, #020617)'
                  }}
                >
                  {/* Decorative ambient background lights */}
                  <div className="absolute top-1/4 left-1/4 w-36 h-36 rounded-full bg-indigo-500/10 blur-3xl" />
                  <div className="absolute bottom-1/4 right-1/4 w-36 h-36 rounded-full bg-purple-500/10 blur-3xl" />

                  {/* Top clock widget */}
                  <div className="mt-8 flex flex-col items-center text-white z-10">
                    {smartphone.brand === 'Apple' ? (
                      <>
                        <span className="text-[11px] uppercase tracking-widest text-slate-300 font-medium font-sans">Quarta, 24 de Junho</span>
                        <h1 className="text-5xl font-extrabold tracking-tighter mt-1 font-sans">05:50</h1>
                        {/* Apple style Lock Screen Widgets */}
                        <div className="flex mt-3 space-x-2">
                          <div className="bg-white/10 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-xl flex items-center space-x-1.5 text-[9px]">
                            <Activity className="w-3 h-3 text-red-400" />
                            <span className="font-semibold text-white/90">74 bpm</span>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-xl flex items-center space-x-1.5 text-[9px]">
                            <Battery className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-semibold text-white/90">88%</span>
                          </div>
                        </div>
                      </>
                    ) : smartphone.brand === 'Samsung' ? (
                      <div className="w-full flex flex-col items-start bg-slate-900/40 backdrop-blur-lg border border-white/5 p-4 rounded-3xl mt-4">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-left">
                            <span className="text-[10px] text-slate-300">Porto Alegre</span>
                            <h2 className="text-xl font-semibold font-sans mt-0.5">14°C <span className="text-xs text-indigo-300 font-light">Nublado</span></h2>
                          </div>
                          <Thermometer className="w-6 h-6 text-indigo-300" />
                        </div>
                        <div className="w-full border-t border-white/5 mt-3 pt-2 flex items-center justify-between text-[9px] text-slate-300">
                          <span>Sinal de Hardware: Ótimo</span>
                          <span className="text-emerald-400 flex items-center font-mono"><Zap className="w-2.5 h-2.5 mr-0.5" />One UI 6.1</span>
                        </div>
                      </div>
                    ) : smartphone.brand === 'Google' ? (
                      <div className="w-full flex flex-col items-center mt-2">
                        <h2 className="text-sm font-medium tracking-tight text-slate-200">Quarta-feira, 24 de jun.</h2>
                        <div className="flex items-center space-x-1 mt-1 text-slate-300 text-xs">
                          <span>24°C</span>
                          <span>•</span>
                          <span>Sunny</span>
                        </div>
                        <div className="mt-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 p-3 w-full flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] text-slate-400">Google Gemini AI</p>
                            <p className="text-[10px] text-slate-100 font-medium">Pronto para otimizar</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Xiaomi HyperOS Clock Widget */
                      <div className="flex flex-col items-center mt-4">
                        <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-medium">HyperOS 1.0</span>
                        <h1 className="text-5xl font-mono tracking-tight text-white/90 font-bold mt-2">05:50</h1>
                        <div className="mt-3 flex space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Reset simulated RAM usage in parent
                              onMetricsUpdate(smartphone.id, (prev) => ({
                                ...prev,
                                ramUsage: 3.2 // clean baseline
                              }));
                            }}
                            className="bg-white/10 hover:bg-white/20 border border-white/5 px-3 py-1 rounded-full text-[9px] text-emerald-400 flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <RefreshCw className="w-3 h-3 text-emerald-400" />
                            <span>Limpar RAM</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* App Grid */}
                  <div className="grid grid-cols-4 gap-y-4 gap-x-2 w-full mt-4 z-10">
                    {/* Browser App */}
                    <button 
                      onClick={() => setActiveTab('browser')}
                      className="flex flex-col items-center focus:outline-hidden group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2.5 flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                        <Globe className="w-full h-full text-white" />
                      </div>
                      <span className="text-[9px] text-slate-300 mt-1 truncate max-w-full font-sans">Navegador</span>
                    </button>

                    {/* Benchmark App */}
                    <button 
                      onClick={() => setActiveTab('hardware')}
                      className="flex flex-col items-center focus:outline-hidden group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 p-2.5 flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                        <Cpu className="w-full h-full text-white" />
                      </div>
                      <span className="text-[9px] text-slate-300 mt-1 truncate max-w-full font-sans">Hardware</span>
                    </button>

                    {/* Maps simulation launcher */}
                    <div className="flex flex-col items-center opacity-65">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 p-2.5 flex items-center justify-center shadow-md">
                        <Search className="w-full h-full text-indigo-400" />
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 font-sans">Mapas</span>
                    </div>

                    {/* Settings simulation launcher */}
                    <div className="flex flex-col items-center opacity-65">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 p-2.5 flex items-center justify-center shadow-md">
                        <Activity className="w-full h-full text-purple-400" />
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 font-sans">Ajustes</span>
                    </div>
                  </div>

                  {/* Bottom dock bar */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/5 rounded-[24px] p-2 flex justify-around items-center w-full z-10 shadow-lg mt-auto">
                    <button 
                      onClick={() => setActiveTab('browser')}
                      className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-2.5 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Globe className="w-full h-full text-white" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('hardware')}
                      className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 p-2.5 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Cpu className="w-full h-full text-white" />
                    </button>
                    <div className="w-11 h-11 rounded-xl bg-slate-800/80 p-2.5 flex items-center justify-center opacity-60">
                      <MessageSquare className="w-full h-full text-teal-400" />
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-slate-800/80 p-2.5 flex items-center justify-center opacity-60">
                      <Clock className="w-full h-full text-amber-400" />
                    </div>
                  </div>

                  {/* Samsung style edge panel trigger */}
                  {smartphone.brand === 'Samsung' && (
                    <div 
                      onClick={() => setEdgePanelOpen(!edgePanelOpen)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-white/20 rounded-l cursor-pointer z-50 flex items-center justify-center hover:bg-white/40 transition-colors"
                    >
                      <div className="w-0.5 h-4 bg-white/60 rounded-full" />
                    </div>
                  )}

                  {/* Samsung edge panel content drawer */}
                  <AnimatePresence>
                    {edgePanelOpen && smartphone.brand === 'Samsung' && (
                      <motion.div 
                        initial={{ x: 120 }}
                        animate={{ x: 0 }}
                        exit={{ x: 120 }}
                        className="absolute right-0 top-1/4 h-1/2 w-28 bg-slate-900/90 backdrop-blur-2xl border-l border-y border-white/10 rounded-l-3xl p-3 z-50 flex flex-col items-center space-y-4 shadow-2xl justify-center"
                      >
                        <span className="text-[8px] font-mono text-slate-400 tracking-wider">EDGE APPS</span>
                        <button onClick={() => { setActiveTab('browser'); setEdgePanelOpen(false); }} className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center hover:bg-blue-600/40">
                          <Globe className="w-5 h-5 text-blue-400" />
                        </button>
                        <button onClick={() => { setActiveTab('hardware'); setEdgePanelOpen(false); }} className="w-10 h-10 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center hover:bg-amber-600/40">
                          <Cpu className="w-5 h-5 text-amber-400" />
                        </button>
                        <button onClick={() => setEdgePanelOpen(false)} className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                          <X className="w-3 h-3 text-slate-400" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Home indicator bar at the bottom */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/45 rounded-full z-40" />
                </motion.div>
              )}

              {/* Browser view tab */}
              {activeTab === 'browser' && (
                <motion.div 
                  key="browser-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-slate-950 flex flex-col"
                >
                  {/* Address / Search Bar block */}
                  <div className="p-2 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-col space-y-1.5 z-10">
                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={handleBack}
                        disabled={historyIndex === 0}
                        className="p-1 rounded-md text-slate-400 hover:text-white disabled:opacity-35 disabled:hover:text-slate-400 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={handleForward}
                        disabled={historyIndex === browserHistory.length - 1}
                        className="p-1 rounded-md text-slate-400 hover:text-white disabled:opacity-35 disabled:hover:text-slate-400 transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={handleRefresh}
                        className={`p-1 rounded-md text-slate-400 hover:text-white transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      {/* URL input bar */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleNavigate(localUrlInput);
                        }}
                        className="flex-1 relative"
                      >
                        <input 
                          type="text" 
                          value={localUrlInput}
                          onChange={(e) => setLocalUrlInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-2 py-1 text-[10px] pl-6 focus:outline-hidden focus:border-slate-700 font-mono select-text"
                          placeholder="Digite um site..."
                        />
                        <Globe className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                      </form>
                    </div>

                    {/* View Mode Toggle (Iframe vs HUD) */}
                    <div className="flex bg-slate-950 p-0.5 rounded-md border border-slate-800/60 select-none">
                      <button
                        type="button"
                        onClick={() => setBrowserViewMode('iframe')}
                        className={`flex-1 py-1 text-[9px] font-semibold rounded-sm transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                          browserViewMode === 'iframe'
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <MousePointer className="w-2.5 h-2.5" />
                        <span>Site Interativo (Live)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrowserViewMode('hud')}
                        className={`flex-1 py-1 text-[9px] font-semibold rounded-sm transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                          browserViewMode === 'hud'
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Activity className="w-2.5 h-2.5" />
                        <span>Métricas & Presets</span>
                      </button>
                    </div>

                    {/* Loading progress bar indicator */}
                    {urlLoading && (
                      <div className="w-full h-0.5 bg-slate-850 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${urlLoadProgress}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Browser viewport */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-900 flex flex-col relative select-text">
                    
                    {/* Render active browser simulator views */}
                    {urlLoading ? (
                      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none z-10">
                        <Activity className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                        <h3 className="text-white text-xs font-semibold font-sans">Carregando em {smartphone.brand}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-full font-mono truncate">{currentUrl}</p>
                        
                        {/* Hardware speed translation */}
                        <div className="mt-4 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] text-slate-300 font-mono max-w-[200px]">
                          <span className="text-indigo-400 font-bold">5G SPEED LIMIT</span>
                          <div className="flex justify-between mt-1 text-slate-400">
                            <span>Processador:</span>
                            <span className="text-slate-200 font-semibold">{smartphone.chipset.split(' ')[1]}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Banda:</span>
                            <span className="text-emerald-400 font-semibold">WiFi-7 AX</span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Display standard presets if matched, or rendering engine */}
                    {activeTest && activeTest !== 'none' ? (
                      <InteractiveTestScreen
                        smartphone={smartphone}
                        activeTest={activeTest}
                        metrics={metrics}
                        onMetricsUpdate={onMetricsUpdate}
                      />
                    ) : browserViewMode === 'iframe' ? (
                      <div className="flex-1 w-full h-full relative bg-white flex flex-col">
                        <iframe
                          src={currentUrl}
                          className="w-full flex-1 border-0 bg-white"
                          referrerPolicy="no-referrer"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                          title={`Simulated Browser - ${smartphone.model}`}
                        />
                        {/* Overlay warning/info indicator */}
                        <div className="bg-slate-950 border-t border-slate-800 p-2 text-[8px] text-slate-300 flex items-center justify-between shadow-lg select-none">
                          <span className="truncate pr-1">⚠️ Se o site bloquear iframe (ex: Wikipedia/Google), use o modo Métricas.</span>
                          <button
                            type="button"
                            onClick={() => setBrowserViewMode('hud')}
                            className="text-indigo-400 font-bold shrink-0 hover:underline cursor-pointer"
                          >
                            Ver Métricas
                          </button>
                        </div>
                      </div>
                    ) : preset ? (
                      <div className="flex-1 flex flex-col text-white">
                        {preset.name === 'Apple.com' && (
                          <div className="flex-1 bg-black flex flex-col p-4 text-center">
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Preset Apple.com</span>
                            <h2 className="text-xl font-bold tracking-tight mt-3 text-white">iPhone 15 Pro</h2>
                            <p className="text-[11px] text-slate-400 mt-1">Titânio. Tão forte. Tão leve. Pro.</p>
                            
                            <div className="my-6 relative flex justify-center">
                              <div className="w-24 h-44 rounded-2xl bg-gradient-to-b from-indigo-950 to-slate-900 border-2 border-slate-800 shadow-xl flex items-center justify-center overflow-hidden">
                                <div className="absolute top-1 w-12 h-2.5 bg-black rounded-full" />
                                <div className="w-16 h-16 rounded-full bg-radial from-slate-700/40 to-transparent blur-md" />
                                <div className="text-[8px] font-mono text-slate-500">Renderizado 3D</div>
                              </div>
                            </div>

                            <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 py-1.5 text-[10px] font-semibold self-center shadow-lg cursor-pointer">
                              Saiba mais
                            </button>

                            <div className="border-t border-slate-900 mt-8 pt-4 text-left">
                              <h4 className="text-xs font-semibold text-slate-300">A17 Pro GPU</h4>
                              <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                                Uma classe inteiramente nova de processador gráfico para iPhone. Fornece desempenho incomparável para renderização de traçado de raio em hardware.
                              </p>
                            </div>
                          </div>
                        )}

                        {preset.name === 'Wikipedia.org' && (
                          <div className="flex-1 bg-white text-slate-900 p-4 font-sans text-left">
                            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-serif text-lg font-bold select-none border border-slate-300">W</div>
                              <div>
                                <h2 className="text-sm font-semibold tracking-tight">WIKIPÉDIA</h2>
                                <p className="text-[8px] text-slate-500 uppercase tracking-wider">A Enciclopédia Livre</p>
                              </div>
                            </div>

                            <div className="mt-4 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                              <span className="text-[9px] font-bold text-indigo-700">Artigo em Destaque</span>
                              <h3 className="text-xs font-semibold mt-1">Exploração de Marte</h3>
                              <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                                O envio de sondas espaciais robóticas tem sido uma prioridade crucial do programa de exploração planetária desde o final do século XX.
                              </p>
                            </div>

                            <div className="mt-4">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trending no Brasil</h4>
                              <ul className="mt-2 space-y-1 text-[10px] text-slate-700">
                                <li className="hover:underline cursor-pointer flex items-center"><ChevronRight className="w-3 h-3 text-slate-400 mr-0.5" /> Inteligência Artificial Geral</li>
                                <li className="hover:underline cursor-pointer flex items-center"><ChevronRight className="w-3 h-3 text-slate-400 mr-0.5" /> Olimpíadas de Verão 2024</li>
                                <li className="hover:underline cursor-pointer flex items-center"><ChevronRight className="w-3 h-3 text-slate-400 mr-0.5" /> Computação Quântica</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {preset.name === 'GitHub.com' && (
                          <div className="flex-1 bg-[#0d1117] text-[#c9d1d9] p-4 text-left font-sans">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                              <div className="flex items-center space-x-2">
                                <Github className="w-6 h-6 text-white" />
                                <span className="text-xs font-semibold text-white font-mono">github.com</span>
                              </div>
                              <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 rounded-full">Status: Online</span>
                            </div>

                            <div className="mt-4 bg-[#161b22] border border-[#30363d] rounded-xl p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer">facebook / react</span>
                                <span className="text-[9px] text-[#8b949e] flex items-center">⭐ 224k</span>
                              </div>
                              <p className="text-[10px] text-[#8b949e] mt-1.5">
                                The library for web and native user interfaces.
                              </p>

                              <div className="mt-3 flex space-x-3 text-[9px] text-[#8b949e]">
                                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1" /> TypeScript</span>
                                <span>Updated yesterday</span>
                              </div>
                            </div>

                            <div className="mt-4 border border-[#30363d] rounded-xl overflow-hidden text-[10px] font-mono">
                              <div className="bg-[#161b22] px-3 py-2 border-b border-[#30363d] text-[#8b949e]">README.md</div>
                              <div className="p-3 bg-[#0d1117]">
                                <h3 className="text-xs font-semibold text-white mb-1">React 19 Core Engine</h3>
                                <p className="text-[#8b949e] leading-relaxed text-[9px]">
                                  This repository includes the core algorithm for scheduling fibers and diffing virtual DOM structures.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {preset.name === 'YouTube.com' && (
                          <div className="flex-1 bg-[#0f0f0f] text-white flex flex-col text-left">
                            {/* Mock Video Player */}
                            <div className="relative w-full aspect-video bg-slate-900 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform">
                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                              </div>
                              <span className="absolute bottom-2 right-2 bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono">03:45</span>
                            </div>

                            <div className="p-3">
                              <h3 className="text-xs font-semibold leading-snug">Apple iPhone 15 Pro Max vs S24 Ultra - Speed Test comparativo de Hardware!</h3>
                              <p className="text-[9px] text-slate-400 mt-1">2.4M visualizações • há 4 dias</p>

                              {/* Channel info */}
                              <div className="flex items-center justify-between mt-3 border-y border-slate-900 py-2.5">
                                <div className="flex items-center space-x-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold">T</div>
                                  <div>
                                    <h4 className="text-[10px] font-semibold">TechArena BR</h4>
                                    <p className="text-[8px] text-slate-400">1.2M inscritos</p>
                                  </div>
                                </div>
                                <button className="bg-white text-black font-semibold text-[9px] px-3 py-1 rounded-full cursor-pointer">Inscrever-se</button>
                              </div>

                              {/* Comments block */}
                              <div className="mt-3">
                                <h4 className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Comentários (534)</h4>
                                <div className="bg-white/5 border border-white/5 rounded-lg p-2 mt-1.5 flex items-start space-x-2">
                                  <div className="w-5 h-5 rounded-full bg-slate-700 text-[8px] flex items-center justify-center font-bold">U</div>
                                  <div>
                                    <p className="text-[8px] font-semibold text-slate-300">Marcos_Tech</p>
                                    <p className="text-[9px] text-slate-100 leading-normal mt-0.5">O A17 Pro abriu os apps mais pesados uns 2 segundos mais rápido. Brutal!</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {preset.name === 'OpenAI.com' && (
                          <div className="flex-1 bg-black text-white p-4 text-left font-sans flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                                <span className="font-bold tracking-tight text-xs">OpenAI</span>
                                <span className="text-[8px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full font-mono">GPT-4o</span>
                              </div>

                              <h2 className="text-lg font-bold tracking-tight mt-6 leading-tight">Criando Inteligência Artificial segura e benéfica para toda a humanidade.</h2>
                              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                Nossos sistemas de inteligência artificial de fronteira estão expandindo o limite das possibilidades computacionais, otimizados para velocidade extrema.
                              </p>
                            </div>

                            <div className="mt-8 bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col space-y-2">
                              <span className="text-[8px] text-indigo-400 font-bold tracking-wider">CHASSIS DIAGNOSTIC</span>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400">FPS Render Core:</span>
                                <span className="text-white font-semibold font-mono">{metrics.currentFps} FPS</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400">Latência do Modelo:</span>
                                <span className="text-emerald-400 font-semibold font-mono">
                                  {smartphone.id === 'iphone-15-pro-max' ? '42ms' : smartphone.id === 'galaxy-s24-ultra' ? '45ms' : smartphone.id === 'xiaomi-14-ultra' ? '46ms' : '58ms'}
                                </span>
                              </div>
                            </div>

                            <button className="bg-white text-black font-semibold text-[10px] py-2 rounded-lg mt-6 cursor-pointer">
                              Testar ChatGPT no Aparelho
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Universal Fallback Simulator (Rendered website speed test details) */
                      <div className="flex-1 bg-slate-900 text-white p-4 text-left font-sans flex flex-col">
                        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="text-[11px] font-bold truncate max-w-[190px]">{currentUrl.replace(/^https?:\/\//i, '')}</h3>
                            <p className="text-[8px] text-slate-400">Simulador de Navegação Real-Time</p>
                          </div>
                        </div>

                        {/* Real-time Diagnostics HUD for custom URL */}
                        <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
                          <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider font-mono">Métricas de Conexão</span>
                          
                          {/* Diagnostic bars */}
                          <div className="mt-3 space-y-2.5 text-[9px] font-mono">
                            <div>
                              <div className="flex justify-between text-slate-400 mb-1">
                                <span>1. DNS Lookup:</span>
                                <span className="text-white font-semibold">{lastTestResult ? `${lastTestResult.dnsTime} ms` : 'Calculando...'}</span>
                              </div>
                              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: lastTestResult ? '30%' : '0%' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-slate-400 mb-1">
                                <span>2. TCP Connection:</span>
                                <span className="text-white font-semibold">{lastTestResult ? `${lastTestResult.tcpTime} ms` : 'Calculando...'}</span>
                              </div>
                              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500" style={{ width: lastTestResult ? '25%' : '0%' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-slate-400 mb-1">
                                <span>3. SSL Handshake:</span>
                                <span className="text-white font-semibold">{lastTestResult ? `${lastTestResult.sslTime} ms` : 'Calculando...'}</span>
                              </div>
                              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: lastTestResult ? '20%' : '0%' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-slate-400 mb-1">
                                <span>4. TTFB (Primeiro Byte):</span>
                                <span className="text-white font-semibold">{lastTestResult ? `${lastTestResult.ttfb} ms` : 'Calculando...'}</span>
                              </div>
                              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-pink-500" style={{ width: lastTestResult ? '40%' : '0%' }} />
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-300">
                              <span>Tempo de Carga Total:</span>
                              <span className="text-emerald-400 font-bold text-xs">{lastTestResult ? `${lastTestResult.totalLoadTime} ms` : 'Calculando...'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive UI Sandbox inside the simulation */}
                        <div className="mt-4 bg-[#161b22]/50 border border-slate-800 rounded-xl p-3">
                          <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Painel de Aceleração do Chip</h4>
                          <div className="space-y-1.5 text-[9px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Processamento de JS:</span>
                              <span className="text-white">{smartphone.chipset.split(' ')[0]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Diferença p/ Base:</span>
                              <span className="text-indigo-400 font-semibold font-mono">
                                +{Math.round((smartphone.basePerformanceScore - 8000) / 80)}% eficiente
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Status de Rede:</span>
                              <span className="text-emerald-400 font-semibold">Carga 5G Simulado</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto border border-slate-800 bg-slate-950 p-2.5 rounded-xl text-center">
                          <p className="text-[8px] text-slate-400 leading-normal">
                            Para evitar bloqueios de CORS em frames aninhados, este simulador calcula a latência de rede real para o domínio <strong className="text-slate-300">{currentUrl.replace(/^https?:\/\/(www\.)?/i, '')}</strong> e a acopla com o poder computacional do chip do aparelho.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Browser bottom toolbar */}
                  <div className="h-11 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md flex justify-around items-center z-10 select-none">
                    <button 
                      onClick={() => setActiveTab('home')}
                      className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                    >
                      <Home className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('hardware')}
                      className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                    >
                      <Cpu className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleRefresh}
                      className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Home indicator bar at the bottom */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/45 rounded-full z-40" />
                </motion.div>
              )}

              {/* Hardware diagnostics tab */}
              {activeTab === 'hardware' && (
                <motion.div 
                  key="hardware-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-slate-950 flex flex-col"
                >
                  {/* Top Header */}
                  <div className="p-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10 select-none">
                    <div className="flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold text-white tracking-tight">MONITOR DE HARDWARE</span>
                    </div>
                    {stressActive && (
                      <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/35 px-1.5 py-0.5 rounded-full animate-pulse font-mono">ESTRESSE ATIVO</span>
                    )}
                  </div>

                  {/* Canvas Animation Sandbox */}
                  <div className="h-44 bg-slate-900 relative border-b border-slate-800">
                    <canvas ref={canvasRef} className="w-full h-full block" />
                    {stressActive && (
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      </div>
                    )}
                  </div>

                  {/* Hardware Specs HUD */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans select-none text-left">
                    {/* Telemetry Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
                        <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-bold tracking-wider">
                          <span>FPS Fluidez</span>
                          <Activity className="w-3 h-3 text-emerald-400" />
                        </div>
                        <p className={`text-xl font-mono font-black mt-1 ${metrics.currentFps < 40 ? 'text-red-400' : metrics.currentFps < 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {metrics.currentFps} <span className="text-[9px] font-normal text-slate-400">fps</span>
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
                        <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-bold tracking-wider">
                          <span>Temp. do Chip</span>
                          <Thermometer className="w-3 h-3 text-rose-400" />
                        </div>
                        <p className={`text-xl font-mono font-black mt-1 ${metrics.temperature > 65 ? 'text-red-400' : metrics.temperature > 50 ? 'text-amber-400' : 'text-slate-200'}`}>
                          {metrics.temperature}°C
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
                        <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-bold tracking-wider">
                          <span>CPU Load</span>
                          <Cpu className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <p className="text-xl font-mono font-black mt-1 text-slate-200">{metrics.cpuUsage}%</p>
                        </div>
                        <div className="w-full bg-slate-950 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${metrics.cpuUsage}%` }} />
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
                        <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-bold tracking-wider">
                          <span>RAM Utilizada</span>
                          <Zap className="w-3 h-3 text-yellow-400" />
                        </div>
                        <p className="text-xl font-mono font-black mt-1 text-slate-200">
                          {metrics.ramUsage} <span className="text-[9px] font-normal text-slate-400">/ {smartphone.ram} GB</span>
                        </p>
                        <div className="w-full bg-slate-950 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(metrics.ramUsage / smartphone.ram) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Thermal warning and status indicator */}
                    {metrics.throttlingActive && (
                      <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl flex items-start space-x-2 text-[9px] text-amber-300">
                        <TrendingDown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold uppercase tracking-wider">Throttling Térmico Ativo</h4>
                          <p className="text-slate-400 mt-0.5 leading-relaxed">
                            O chip reduziu a frequência de clock em 35% para resfriar a placa lógica, limitando a taxa de quadros e reduzindo a dissipação térmica.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Benchmark Score Card */}
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1 text-[9px] uppercase font-bold tracking-wider text-slate-400">
                        <span>Score Acumulado do Teste</span>
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </div>
                      <div className="flex justify-between items-baseline">
                        <h2 className="text-2xl font-mono font-black text-amber-400">{metrics.benchScore} <span className="text-[10px] text-slate-500">pts</span></h2>
                        <span className="text-[8px] text-slate-400">Base Chipset: {smartphone.basePerformanceScore}</span>
                      </div>
                    </div>

                    {/* Specs List */}
                    <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-3 text-[9px] text-slate-400 space-y-1.5">
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Informações de Hardware</span>
                      <div className="flex justify-between border-b border-slate-850 pb-1 mt-1">
                        <span>Dispositivo:</span>
                        <strong className="text-white truncate max-w-44">{smartphone.model}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-850 pb-1">
                        <span>Processador:</span>
                        <strong className="text-white truncate max-w-44">{smartphone.chipset}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-850 pb-1">
                        <span>GPU Core:</span>
                        <strong className="text-white truncate max-w-44">{smartphone.gpu}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-850 pb-1">
                        <span>Tela:</span>
                        <strong className="text-white">{smartphone.screenSize} • {smartphone.refreshRate}Hz</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Sist. Operacional:</span>
                        <strong className="text-white">{smartphone.osName} {smartphone.osVersion.split(' ')[0]}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Navigation bar at bottom */}
                  <div className="h-11 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md flex justify-around items-center z-10 select-none">
                    <button 
                      onClick={() => setActiveTab('home')}
                      className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                    >
                      <Home className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('browser')}
                      className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Home indicator bar at the bottom */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/45 rounded-full z-40" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Quick device spec tag */}
      <div className="mt-3 flex items-center space-x-1 text-[10px] bg-slate-900/80 border border-slate-800/80 rounded-full px-3 py-1 text-slate-400 font-mono select-none">
        <span className="font-semibold text-white">{smartphone.brand}</span>
        <span>•</span>
        <span>{smartphone.chipset.split(' (')[0]}</span>
      </div>
    </div>
  );
};
