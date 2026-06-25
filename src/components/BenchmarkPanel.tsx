import React from 'react';
import { Cpu, Zap, Eye, LayoutGrid, AlertOctagon, Flame, LayoutList, Columns } from 'lucide-react';
import { SimulatedTab } from '../types';

interface BenchmarkPanelProps {
  stressActive: boolean;
  onToggleStress: () => void;
  stressIntensity: 'low' | 'medium' | 'extreme';
  onChangeIntensity: (intensity: 'low' | 'medium' | 'extreme') => void;
  layout: 1 | 2 | 4;
  onChangeLayout: (layout: 1 | 2 | 4) => void;
  onSetAllTabs: (tab: SimulatedTab) => void;
  onResetAllScores: () => void;
  totalBenchmarkScores: number;
}

export const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({
  stressActive,
  onToggleStress,
  stressIntensity,
  onChangeIntensity,
  layout,
  onChangeLayout,
  onSetAllTabs,
  onResetAllScores,
  totalBenchmarkScores
}) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl flex flex-col space-y-4 text-left">
      <div>
        <div className="flex items-center space-x-2 text-rose-500">
          <Cpu className="w-5 h-5 animate-pulse" />
          <h2 className="text-sm uppercase tracking-widest font-black text-slate-200">Painel de Benchmark & Estresse</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-normal">
          Inicie testes pesados de renderização de física 2D e cálculo matricial para medir a estabilidade térmica e o throttling dos chips.
        </p>
      </div>

      {/* Stress Intensity Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Intensidade do Estresse</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] border ${
            stressIntensity === 'low' 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
              : stressIntensity === 'medium' 
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' 
              : 'bg-red-500/10 border-red-500/25 text-red-400 font-bold animate-pulse'
          }`}>
            {stressIntensity === 'low' ? 'Leve (40 partículas)' : stressIntensity === 'medium' ? 'Médio (350 partículas)' : 'Extremo (800 partículas + Colisão)'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'extreme'] as const).map((intensity) => (
            <button
              key={intensity}
              onClick={() => onChangeIntensity(intensity)}
              disabled={stressActive}
              className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                stressIntensity === intensity
                  ? intensity === 'low'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                    : intensity === 'medium'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                    : 'bg-red-500/15 border-red-500/50 text-red-400'
                  : 'bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-300 hover:border-slate-800'
              } disabled:opacity-40 disabled:pointer-events-none`}
            >
              {intensity === 'low' ? 'Leve' : intensity === 'medium' ? 'Médio' : 'Extremo'}
            </button>
          ))}
        </div>
      </div>

      {/* Big Run/Stop Button */}
      <button
        onClick={onToggleStress}
        className={`w-full py-3 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
          stressActive
            ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
            : 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-rose-950/20'
        }`}
      >
        {stressActive ? (
          <>
            <Flame className="w-4 h-4 animate-bounce text-yellow-300" />
            <span>Parar Teste de Estresse</span>
          </>
        ) : (
          <>
            <Cpu className="w-4 h-4" />
            <span>Iniciar Teste Simultâneo</span>
          </>
        )}
      </button>

      {/* Synchronized Action triggers */}
      <div className="space-y-2 pt-2 border-t border-slate-850/60">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Controle Sincronizado</span>
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold">
          <button
            onClick={() => onSetAllTabs('home')}
            className="py-1.5 px-1 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Telas Iniciais
          </button>
          <button
            onClick={() => onSetAllTabs('browser')}
            className="py-1.5 px-1 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Navegadores
          </button>
          <button
            onClick={() => onSetAllTabs('hardware')}
            className="py-1.5 px-1 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Monitores HW
          </button>
        </div>
      </div>

      {/* Grid Layout Selection */}
      <div className="space-y-2 pt-2 border-t border-slate-850/60">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Visualização do Simulador</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onChangeLayout(1)}
            className={`py-2 px-1 border rounded-xl flex flex-col items-center space-y-1 justify-center transition-all cursor-pointer ${
              layout === 1
                ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 font-bold'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span className="text-[9px]">Foco Único</span>
          </button>
          <button
            onClick={() => onChangeLayout(2)}
            className={`py-2 px-1 border rounded-xl flex flex-col items-center space-y-1 justify-center transition-all cursor-pointer ${
              layout === 2
                ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 font-bold'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span className="text-[9px]">Lado a Lado</span>
          </button>
          <button
            onClick={() => onChangeLayout(4)}
            className={`py-2 px-1 border rounded-xl flex flex-col items-center space-y-1 justify-center transition-all cursor-pointer ${
              layout === 4
                ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 font-bold'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[9px]">Grade (4 Cel)</span>
          </button>
        </div>
      </div>

      {/* Score resets */}
      {totalBenchmarkScores > 0 && (
        <div className="pt-2">
          <button
            onClick={onResetAllScores}
            className="w-full text-center py-1 rounded text-[10px] text-slate-500 hover:text-slate-400 transition-colors font-mono cursor-pointer"
          >
            Limpar Resultados / Resetar Benchmarks
          </button>
        </div>
      )}
    </div>
  );
};
