import React, { useEffect, useRef, useState } from 'react';
import { Smartphone, BenchmarkMetrics, SimulationTest } from '../types';
import { Sparkles, Gamepad2, Wifi, Layers, Thermometer, Play, RefreshCw, Cpu, Brain, Flame, Trash2, Fan } from 'lucide-react';

interface InteractiveTestScreenProps {
  smartphone: Smartphone;
  activeTest: SimulationTest;
  metrics: BenchmarkMetrics;
  onMetricsUpdate: (deviceId: string, updater: (prev: BenchmarkMetrics) => BenchmarkMetrics) => void;
}

export const InteractiveTestScreen: React.FC<InteractiveTestScreenProps> = ({
  smartphone,
  activeTest,
  metrics,
  onMetricsUpdate,
}) => {
  // Common states
  const [testStage, setTestStage] = useState<'init' | 'running' | 'completed'>('running');

  // AI Test states
  const [aiTokens, setAiTokens] = useState<string[]>([]);
  const [aiSpeed, setAiSpeed] = useState(0);
  const aiTextPreset = [
    "Iniciando Llama-3-8B local...",
    "Carregando pesos na SRAM do chip...",
    "Aceleração por NPU Ativa.",
    "Prompt: 'Otimizar código React'",
    "Processando Contexto...",
    "Tokens gerados:",
    "-> useMemo() para cachear arrays",
    "-> useCallback() para referências",
    "-> useTransition() para renderizações lentas",
    "-> CSS transform ao invés de top/left",
    "-> Ative compressão GZIP na nuvem",
    "-> Otimização de Imagens para WebP",
    "Inferência concluída com sucesso."
  ];

  // GPU Canvas reference and loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gpuFps, setGpuFps] = useState(120);

  // 5G Speedtest states
  const [speedVal, setSpeedVal] = useState(0);
  const [speedPhase, setSpeedPhase] = useState<'ping' | 'download' | 'done'>('ping');

  // RAM load states
  const [apps, setApps] = useState([
    { id: 1, name: 'Render Física WebGL', size: '2.8 GB', active: true },
    { id: 2, name: 'Local Llama LLM', size: '3.4 GB', active: true },
    { id: 3, name: 'Câmera 4K RAW', size: '1.9 GB', active: true },
    { id: 4, name: 'Navegador (12 Abas)', size: '1.2 GB', active: true },
  ]);

  // Thermal test states
  const [cpuTemp, setCpuTemp] = useState(38);
  const [isCooling, setIsCooling] = useState(false);

  // --- AI TEST EFFECT ---
  useEffect(() => {
    if (activeTest !== 'ai') return;
    setTestStage('running');
    setAiTokens([]);
    
    // Set speed based on chip basePerformanceScore
    const baseSpeed = Math.round(smartphone.basePerformanceScore / 300);
    setAiSpeed(baseSpeed);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < aiTextPreset.length) {
        setAiTokens(prev => [...prev, aiTextPreset[idx]]);
        idx++;
        // Update CPU/NPU usage metrics
        onMetricsUpdate(smartphone.id, prev => ({
          ...prev,
          cpuUsage: Math.min(95, 45 + Math.floor(Math.random() * 20)),
          ramUsage: Math.min(smartphone.ram - 0.5, 4.2 + (idx * 0.15)),
        }));
      } else {
        clearInterval(interval);
        setTestStage('completed');
      }
    }, 700);

    return () => clearInterval(interval);
  }, [activeTest]);

  // --- GPU CANVAS EFFECT (PHYSICS SIMULATION) ---
  useEffect(() => {
    if (activeTest !== 'gpu') return;
    setTestStage('running');

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; color: string }> = [];

    // Particle color theme based on brand
    const getParticleColor = () => {
      if (smartphone.brand === 'Apple') return '#E3E3E3'; // Silver
      if (smartphone.brand === 'Samsung') return '#4E8AFF'; // Royal Blue
      if (smartphone.brand === 'Google') return Math.random() > 0.5 ? '#EA4335' : '#4285F4'; // Google Multi
      return '#FF5500'; // Xiaomi Orange
    };

    // Initialize particles based on hardware score
    const particleCount = Math.round(smartphone.basePerformanceScore / 110);
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        r: 2 + Math.random() * 3,
        color: getParticleColor(),
      });
    }

    let lastTime = performance.now();
    let frameCount = 0;

    const loop = (time: number) => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw active benchmark logo backdrop
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.font = 'bold 36px font-sans';
      ctx.textAlign = 'center';
      ctx.fillText(smartphone.brand.toUpperCase(), canvas.width / 2, canvas.height / 2);

      // Draw and update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowColor = 'transparent';
      });

      // FPS Calculation
      frameCount++;
      if (time > lastTime + 1000) {
        const calculatedFps = Math.round((frameCount * 1000) / (time - lastTime));
        // Clamp to screen refreshRate
        const finalFps = Math.min(smartphone.refreshRate, calculatedFps);
        setGpuFps(finalFps);
        
        onMetricsUpdate(smartphone.id, prev => ({
          ...prev,
          currentFps: finalFps,
          cpuUsage: Math.min(98, 75 + Math.floor(Math.random() * 10)),
        }));

        frameCount = 0;
        lastTime = time;
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  }, [activeTest]);

  // --- 5G SPEEDTEST EFFECT ---
  useEffect(() => {
    if (activeTest !== '5g') return;
    setTestStage('running');
    setSpeedPhase('ping');
    setSpeedVal(0);

    // Speed target based on chip/modem tier (S25 and 16 Pro support Wi-Fi 7 / modern mmWave modems)
    const targetSpeed = smartphone.brand === 'Apple' || smartphone.brand === 'Samsung' 
      ? 910 + Math.floor(Math.random() * 80) 
      : 760 + Math.floor(Math.random() * 60);

    // Step 1: Ping phase (1.5s)
    const timeoutPing = setTimeout(() => {
      setSpeedPhase('download');
      
      // Step 2: Download progress acceleration
      let curr = 0;
      const speedInterval = setInterval(() => {
        if (curr < targetSpeed) {
          curr += Math.floor(targetSpeed / 15) + Math.floor(Math.random() * 20);
          if (curr > targetSpeed) curr = targetSpeed;
          setSpeedVal(curr);
          
          onMetricsUpdate(smartphone.id, prev => ({
            ...prev,
            cpuUsage: 35 + Math.floor(Math.random() * 15),
            ramUsage: Math.min(smartphone.ram, 3.4),
          }));
        } else {
          clearInterval(speedInterval);
          setSpeedPhase('done');
          setTestStage('completed');
        }
      }, 100);

      return () => clearInterval(speedInterval);
    }, 1500);

    return () => clearTimeout(timeoutPing);
  }, [activeTest]);

  // --- RAM / MULTITASKING EFFECT ---
  useEffect(() => {
    if (activeTest !== 'ram') return;
    setTestStage('running');

    // Fill up RAM usage close to maximum
    const targetRam = smartphone.ram * 0.85; // 85% full
    onMetricsUpdate(smartphone.id, prev => ({
      ...prev,
      cpuUsage: 60,
      ramUsage: parseFloat(targetRam.toFixed(1)),
    }));
  }, [activeTest, apps]);

  const handleKillApp = (appId: number, appSize: string) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, active: false } : a));
    const sizeGb = parseFloat(appSize.split(' ')[0]);
    onMetricsUpdate(smartphone.id, prev => ({
      ...prev,
      ramUsage: Math.max(1.8, parseFloat((prev.ramUsage - sizeGb).toFixed(1))),
    }));
  };

  const handleResetApps = () => {
    setApps(prev => prev.map(a => ({ ...a, active: true })));
    const targetRam = smartphone.ram * 0.85;
    onMetricsUpdate(smartphone.id, prev => ({
      ...prev,
      ramUsage: parseFloat(targetRam.toFixed(1)),
    }));
  };

  // --- THERMAL TEST EFFECT ---
  useEffect(() => {
    if (activeTest !== 'thermal') return;
    setTestStage('running');
    
    // CPU usage shoots to 100%
    onMetricsUpdate(smartphone.id, prev => ({
      ...prev,
      cpuUsage: 100,
    }));

    const interval = setInterval(() => {
      if (!isCooling) {
        setCpuTemp(prev => {
          const next = prev + 1.5;
          const maxTemp = smartphone.brand === 'Apple' ? 62 : smartphone.brand === 'Samsung' ? 59 : 68;
          
          onMetricsUpdate(smartphone.id, m => {
            const throttling = next > 55;
            return {
              ...m,
              temperature: Math.round(next),
              throttlingActive: throttling,
              // Drop FPS under throttling
              currentFps: throttling ? Math.round(smartphone.refreshRate * 0.5) : smartphone.refreshRate,
            };
          });

          if (next >= maxTemp) {
            return maxTemp;
          }
          return next;
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [activeTest, isCooling]);

  const handleCoolDown = () => {
    setIsCooling(true);
    let curr = cpuTemp;
    const interval = setInterval(() => {
      if (curr > 36) {
        curr -= 3;
        if (curr < 36) curr = 36;
        setCpuTemp(curr);
        onMetricsUpdate(smartphone.id, m => ({
          ...m,
          temperature: Math.round(curr),
          throttlingActive: curr > 55,
          currentFps: curr > 55 ? Math.round(smartphone.refreshRate * 0.5) : smartphone.refreshRate,
        }));
      } else {
        clearInterval(interval);
        setIsCooling(false);
      }
    }, 150);
  };


  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white p-4 text-left select-none overflow-y-auto">
      
      {/* Test Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center space-x-2">
          {activeTest === 'ai' && <Brain className="w-4 h-4 text-emerald-400" />}
          {activeTest === 'gpu' && <Gamepad2 className="w-4 h-4 text-amber-400" />}
          {activeTest === '5g' && <Wifi className="w-4 h-4 text-cyan-400" />}
          {activeTest === 'ram' && <Layers className="w-4 h-4 text-purple-400" />}
          {activeTest === 'thermal' && <Thermometer className="w-4 h-4 text-red-400 animate-pulse" />}
          
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-100">
            {activeTest === 'ai' ? 'NPU Local LLM' :
             activeTest === 'gpu' ? 'WebGL GPU' :
             activeTest === '5g' ? 'Modem 5G Speed' :
             activeTest === 'ram' ? 'RAM Multitask' : 'Dissipação CPU'}
          </span>
        </div>
        
        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
          testStage === 'running' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse border border-indigo-500/25' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
        }`}>
          {testStage === 'running' ? 'Simulando...' : 'Concluído'}
        </span>
      </div>

      {/* --- AI / NPU INFERENCE TEST INTERFACE --- */}
      {activeTest === 'ai' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 font-mono text-[9px] space-y-1.5 flex-1 overflow-y-auto">
            {aiTokens.map((t, idx) => (
              <p 
                key={idx} 
                className={`${
                  t.startsWith('Prompt') ? 'text-indigo-400 font-bold' :
                  t.startsWith('->') ? 'text-slate-300 pl-2' :
                  t.includes('concluída') ? 'text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                {t}
              </p>
            ))}
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-center">
            <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest block">Velocidade da NPU</span>
            <div className="flex items-baseline justify-center space-x-1 mt-1">
              <span className="text-3xl font-black font-mono text-emerald-400">{aiSpeed}</span>
              <span className="text-[10px] text-slate-400 font-mono">tokens / s</span>
            </div>
            <p className="text-[8px] text-slate-500 mt-1">
              Acelerado pelo {smartphone.brand === 'Apple' ? 'Apple Neural Engine' : smartphone.brand === 'Samsung' ? 'NPU Snapdragon' : smartphone.brand === 'Google' ? 'Tensor TPU' : 'HyperOS AI Core'}.
            </p>
          </div>
        </div>
      )}

      {/* --- GPU WEBGL CANVAS INTERFACE --- */}
      {activeTest === 'gpu' && (
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-slate-850 h-44 bg-slate-900">
            <canvas ref={canvasRef} width={260} height={176} className="w-full h-full block" />
            <div className="absolute top-2 left-2 bg-slate-950/80 border border-slate-850 px-2 py-0.5 rounded text-[8px] font-mono text-white select-none">
              Partículas: {Math.round(smartphone.basePerformanceScore / 110)}
            </div>
            <div className="absolute bottom-2 right-2 bg-slate-950/80 border border-slate-850 px-2 py-0.5 rounded text-[8px] font-mono text-amber-400 select-none font-bold">
              {gpuFps} FPS
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-center text-[9px] text-slate-400 leading-normal">
            <p><strong>Toque interativo:</strong> O canvas calcula as colisões vetoriais por ponto baseados na aceleração da GPU <strong>{smartphone.gpu}</strong>.</p>
          </div>
        </div>
      )}

      {/* --- 5G SPEEDTEST INTERFACE --- */}
      {activeTest === '5g' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col items-center justify-center space-y-3">
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-800">
              {/* Semi-circular speedometer gauge line */}
              <div 
                className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent border-l-transparent transition-transform duration-300"
                style={{ transform: `rotate(${(speedVal / 1100) * 180 - 45}deg)` }}
              />
              <div className="text-center">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">
                  {speedPhase === 'ping' ? 'Medindo Ping...' : speedPhase === 'download' ? 'Download' : 'Concluído'}
                </span>
                <span className="text-2xl font-black font-mono text-white block mt-0.5">
                  {speedPhase === 'ping' ? '...' : speedVal}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">Mbps</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full text-center font-mono text-[9px] bg-slate-950/50 p-2 rounded-lg">
              <div>
                <span className="text-slate-500 block text-[8px]">PING (LATÊNCIA)</span>
                <strong className="text-emerald-400">{smartphone.brand === 'Apple' || smartphone.brand === 'Samsung' ? '11 ms' : '15 ms'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px]">JITTER DE REDE</span>
                <strong className="text-cyan-400">0.8 ms</strong>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[8px] text-slate-500 font-bold uppercase block">Modem Móvel</span>
            <p className="text-[9px] text-slate-300 font-semibold">{smartphone.brand === 'Samsung' || smartphone.brand === 'Xiaomi' ? 'X80 5G Dual-SA' : smartphone.brand === 'Apple' ? 'Qualcomm X75 5G' : 'Tensor 5G modem'}</p>
          </div>
        </div>
      )}

      {/* --- RAM MULTITASKING INTERFACE --- */}
      {activeTest === 'ram' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2 flex-1 overflow-y-auto">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Processos de Fundo Alocados</span>
            
            {apps.map(app => (
              <div key={app.id} className="bg-slate-900 border border-slate-850 rounded-lg p-2 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${app.active ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  <span className={`font-semibold ${app.active ? 'text-slate-200' : 'text-slate-500 line-through'}`}>{app.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-slate-400">{app.size}</span>
                  {app.active ? (
                    <button 
                      onClick={() => handleKillApp(app.id, app.size)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors cursor-pointer"
                      title="Matar Processo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[8px] text-slate-500 font-mono">SUSPENSO</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[8px] text-slate-500 font-bold block">Compactador</span>
              <p className="text-[9px] text-indigo-400 font-semibold">{smartphone.brand === 'Apple' ? 'Dynamic RAM Compactor' : 'ZRAM Virtual SWAP'}</p>
            </div>
            <button 
              onClick={handleResetApps}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg text-[9px] font-semibold text-white cursor-pointer flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Resetar</span>
            </button>
          </div>
        </div>
      )}

      {/* --- THERMAL CPU OVERLOAD INTERFACE --- */}
      {activeTest === 'thermal' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 flex flex-col items-center">
            {/* Visual chassis infrared glowing mockup */}
            <div className="relative w-28 h-36 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Radial gradient glowing from blue to deep red */}
              <div 
                className="absolute inset-0 opacity-80 blur-xl transition-all duration-500"
                style={{
                  background: `radial-gradient(circle, ${cpuTemp > 55 ? 'rgba(239, 68, 68, 0.9)' : cpuTemp > 45 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(59, 130, 246, 0.4)'} 0%, transparent 80%)`
                }}
              />
              <div className="text-center z-10">
                <Flame className={`w-7 h-7 mx-auto ${cpuTemp > 55 ? 'text-red-500 animate-bounce' : 'text-indigo-400'}`} />
                <span className="text-lg font-mono font-black block mt-1 text-white">{cpuTemp}°C</span>
                <span className="text-[8px] text-slate-400 font-mono">CHASSIS TEMP</span>
              </div>
            </div>

            <div className="w-full mt-3 space-y-1.5 text-[9px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">CPU Load:</span>
                <strong className="text-red-400">100% (FULL CORES)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Throttling:</span>
                <strong className={cpuTemp > 55 ? 'text-red-400' : 'text-emerald-400'}>
                  {cpuTemp > 55 ? 'ATIVADO (-35% CLOCK)' : 'DESATIVADO'}
                </strong>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCoolDown}
            disabled={isCooling}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer transition-colors"
          >
            <Fan className={`w-3.5 h-3.5 ${isCooling ? 'animate-spin' : ''}`} />
            <span>{isCooling ? 'Resfriando Placa...' : 'Ativar Ventoinha Externa'}</span>
          </button>
        </div>
      )}

    </div>
  );
};
