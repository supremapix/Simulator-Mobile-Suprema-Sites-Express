import React from 'react';
import { Smartphone, BenchmarkMetrics } from '../types';
import { Cpu, Zap, Thermometer, Activity, Gauge, Sparkles, Sliders, Hourglass } from 'lucide-react';

interface ComparisonMetricsProps {
  smartphones: Smartphone[];
  metricsMap: Record<string, BenchmarkMetrics>;
  urlTestedCount: number;
  urlLoading: boolean;
  loadTimesMap: Record<string, number>;
  testedUrl: string;
}

export const ComparisonMetrics: React.FC<ComparisonMetricsProps> = ({
  smartphones,
  metricsMap,
  urlTestedCount,
  urlLoading,
  loadTimesMap,
  testedUrl
}) => {
  // Sort phones by score for benchmarking ranks
  const sortedByScore = [...smartphones].sort((a, b) => {
    const scoreA = metricsMap[a.id]?.benchScore || 0;
    const scoreB = metricsMap[b.id]?.benchScore || 0;
    return scoreB - scoreA;
  });

  const maxScore = Math.max(...smartphones.map(s => metricsMap[s.id]?.benchScore || 1), 1);
  const maxLoadTime = Math.max(...smartphones.map(s => loadTimesMap[s.id] || 1), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none text-left">
      
      {/* Real-time Benchmark Rankings Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400">
            <Gauge className="w-5 h-5" />
            <h2 className="text-sm uppercase tracking-widest font-black text-slate-200">Resultados e Scores de Estresse</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Pontuação total gerada pela compilação de shaders e testes de estresse em tempo real. Quanto maior, mais estável é o chipset.
          </p>
        </div>

        {/* Dynamic bar rank list */}
        <div className="space-y-4 pt-1 flex-1 flex flex-col justify-center">
          {sortedByScore.map((phone, idx) => {
            const metrics = metricsMap[phone.id] || { benchScore: 0, currentFps: 120, temperature: 35, cpuUsage: 0 };
            const score = metrics.benchScore;
            const pct = Math.max(10, (score / maxScore) * 100);

            return (
              <div key={phone.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400 flex items-center justify-center font-bold font-mono">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{phone.model}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-400">{metrics.currentFps} FPS</span>
                    <span className="text-amber-400 font-bold font-mono text-xs">{score.toLocaleString()} pts</span>
                  </div>
                </div>

                {/* Progress bar chassis */}
                <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${pct}%`,
                      background: `linear-gradient(to right, ${phone.accentColor}dd, ${phone.accentColor}ff)`,
                      boxShadow: `0 0 10px ${phone.accentColor}50`
                    }}
                  />
                </div>

                {/* Micro chip stat labels */}
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>{phone.chipset.split(' (')[0]}</span>
                  <span className={`${metrics.temperature > 65 ? 'text-rose-400 animate-pulse font-bold' : ''}`}>
                    Temp: {metrics.temperature}°C
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Website Loading Speed Comparison */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <Hourglass className="w-5 h-5" />
            <h2 className="text-sm uppercase tracking-widest font-black text-slate-200">Carregamento de Sites (Real-Time)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Tempo total medido para resolver DNS, conectar e baixar a página <strong className="text-indigo-300 font-mono text-[10px]">{testedUrl.replace(/^https?:\/\/(www\.)?/i, '')}</strong>.
          </p>
        </div>

        {/* Load times bar chart */}
        <div className="space-y-4 pt-1 flex-1 flex flex-col justify-center">
          {urlTestedCount === 0 && !urlLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 border border-slate-850 rounded-2xl">
              <Activity className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">Nenhuma URL testada ainda.</p>
              <p className="text-[10px] text-slate-500 mt-1">Utilize o painel superior para inserir uma URL e analisar.</p>
            </div>
          ) : (
            smartphones.map((phone) => {
              const loadTime = loadTimesMap[phone.id] || 0;
              const pct = loadTime > 0 ? Math.max(12, (loadTime / maxLoadTime) * 100) : 0;

              return (
                <div key={phone.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{phone.model}</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {loadTime > 0 ? `${loadTime} ms` : urlLoading ? 'Carregando...' : 'Inativo'}
                    </span>
                  </div>

                  {/* Horizontal Bar Chart */}
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900 flex">
                    {loadTime > 0 ? (
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${pct}%`,
                          background: `linear-gradient(to right, ${phone.accentColor}99, ${phone.accentColor})`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900/40 border border-dashed border-slate-800 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-slate-600 font-mono uppercase">Aguardando gatilho</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>WiFi-7 + Processamento {phone.osName}</span>
                    <span>{loadTime > 0 ? `Eficiência: ${(1000 / loadTime * 10).toFixed(1)}x` : ''}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Full Hardware Comparison Sheet (Market-style Table Grid) */}
      <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sliders className="w-5 h-5" />
            <h2 className="text-sm uppercase tracking-widest font-black text-slate-200">Matriz de Especificações Técnicas</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Comparação lado a lado detalhada das especificações físicas, barramentos de memória e tecnologia de tela dos modelos mais topo de linha atuais.
          </p>
        </div>

        {/* Responsive horizontal matrix */}
        <div className="overflow-x-auto border border-slate-850 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-850 text-slate-400 font-mono text-[10px] uppercase">
                <th className="p-3.5 pl-4 font-bold">Especificação</th>
                {smartphones.map(p => (
                  <th key={p.id} className="p-3.5 font-bold" style={{ color: p.accentColor }}>{p.model}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-slate-300">
              <tr>
                <td className="p-3.5 pl-4 font-semibold text-slate-400 font-mono text-[10px] uppercase">Fabricante</td>
                {smartphones.map(p => (
                  <td key={p.id} className="p-3.5 font-semibold text-white">{p.brand}</td>
                ))}
              </tr>
              <tr className="bg-slate-950/20">
                <td className="p-3.5 pl-4 font-semibold text-slate-400 font-mono text-[10px] uppercase">Chipset / SoC</td>
                {smartphones.map(p => (
                  <td key={p.id} className="p-3.5 text-slate-100">{p.chipset}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 pl-4 font-semibold text-slate-400 font-mono text-[10px] uppercase">Processador (CPU)</td>
                {smartphones.map(p => (
                  <td key={p.id} className="p-3.5 text-slate-300 truncate max-w-48 text-[11px]">{p.cpuDetails}</td>
                ))}
              </tr>
              <tr className="bg-slate-950/20">
                <td className="p-3.5 pl-4 font-semibold text-slate-400 font-mono text-[10px] uppercase">Placa Gráfica (GPU)</td>
                {smartphones.map(p => (
                  <td key={p.id} className="p-3.5 text-slate-300 font-mono text-[11px]">{p.gpu}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 pl-4 font-semibold text-slate-400 font-mono text-[10px] uppercase">Memória RAM</td>
                {smartphones.map(p => (
                  <td key={p.id} className="p-3.5 text-slate-100 font-semibold">{p.ram} GB LPDDR5X</td>
                ))}
              </tr>
              <tr className="bg-slate-950/20">
                <td className="p-3.5 pl-4 font-semibold text-slate-400 font-mono text-[10px] uppercase">Tela & Resolução</td>
                {smartphones.map(p => (
                  <td key={p.id} className="p-3.5 text-slate-300 text-[11px]">
                    {p.screenSize} AMOLED ({p.resolution}) @ {p.refreshRate}Hz
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 pl-4 font-semibold text-slate-400 font-mono text-[10px] uppercase">Interface OS</td>
                {smartphones.map(p => (
                  <td key={p.id} className="p-3.5 text-slate-100 flex items-center space-x-1.5 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{p.osName} ({p.osVersion.split(' (')[0]})</span>
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-950/20">
                <td className="p-3.5 pl-4 font-semibold text-slate-400 font-mono text-[10px] uppercase">Bateria & Carga</td>
                {smartphones.map(p => (
                  <td key={p.id} className="p-3.5 text-slate-300 text-[11px]">{p.battery}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 pl-4 font-semibold text-slate-400 font-mono text-[10px] uppercase">Câmeras</td>
                {smartphones.map(p => (
                  <td key={p.id} className="p-3.5 text-slate-400 text-[10px] leading-snug truncate max-w-56">{p.cameraSpecs}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
