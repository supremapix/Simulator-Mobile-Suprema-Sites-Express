import React from 'react';
import { SimulationTest } from '../types';
import { Sparkles, Gamepad2, Wifi, Layers, Thermometer, Globe, Cpu, AlertTriangle } from 'lucide-react';

interface SimulationControlsPanelProps {
  activeTest: SimulationTest;
  onChangeTest: (test: SimulationTest) => void;
  stressActive: boolean;
}

export const SimulationControlsPanel: React.FC<SimulationControlsPanelProps> = ({
  activeTest,
  onChangeTest,
  stressActive,
}) => {
  const tests = [
    {
      id: 'none' as SimulationTest,
      name: 'Navegação Padrão',
      icon: Globe,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/15',
      borderColor: 'border-indigo-500/20',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/30',
      description: 'Navegue por qualquer site ou preset. Mede tempos de latência e renderização HTTP padrão.',
    },
    {
      id: 'ai' as SimulationTest,
      name: 'Teste de IA / NPU',
      icon: Sparkles,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/15',
      borderColor: 'border-emerald-500/20',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30',
      description: 'Simula inferência local de um LLM de 7B de parâmetros. Mede a velocidade da NPU local em Tokens/s.',
    },
    {
      id: 'gpu' as SimulationTest,
      name: 'Teste de GPU (WebGL)',
      icon: Gamepad2,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 hover:bg-amber-500/15',
      borderColor: 'border-amber-500/20',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/30',
      description: 'Renderiza uma colisão física de partículas em 3D. Avalia estabilidade de taxa de quadros (FPS) e a GPU.',
    },
    {
      id: '5g' as SimulationTest,
      name: 'Teste de Rede 5G',
      icon: Wifi,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/15',
      borderColor: 'border-cyan-500/20',
      activeBorder: 'border-cyan-500 ring-2 ring-cyan-500/30',
      description: 'Executa um teste de velocidade de download em tempo real (Speedtest). Simula throughput e jitter móvel.',
    },
    {
      id: 'ram' as SimulationTest,
      name: 'Multitarefa / RAM',
      icon: Layers,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/15',
      borderColor: 'border-purple-500/20',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/30',
      description: 'Abre múltiplas instâncias de renderização e mede a compactação da memória RAM sob stress elevado.',
    },
    {
      id: 'thermal' as SimulationTest,
      name: 'Estresse Térmico',
      icon: Thermometer,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 hover:bg-red-500/15',
      borderColor: 'border-red-500/20',
      activeBorder: 'border-red-500 ring-2 ring-red-500/30',
      description: 'Satura a CPU a 100% para verificar a capacidade de dissipação de calor e o throttling térmico automático.',
    },
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl flex flex-col space-y-4 text-left">
      <div>
        <div className="flex items-center space-x-2 text-indigo-400">
          <Cpu className="w-5 h-5 animate-pulse" />
          <h2 className="text-sm uppercase tracking-widest font-black text-slate-200">Escolher Função / Teste de Hardware</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-normal">
          Clique nos botões abaixo para simular testes interativos avançados nas telas de todos os smartphones simultaneamente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tests.map((test) => {
          const Icon = test.icon;
          const isActive = activeTest === test.id;

          return (
            <button
              key={test.id}
              onClick={() => onChangeTest(test.id)}
              className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isActive ? test.activeBorder : `${test.bgColor} ${test.borderColor}`
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${test.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-100">{test.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                {test.description}
              </p>
            </button>
          );
        })}
      </div>

      {activeTest !== 'none' && (
        <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl flex items-center space-x-2 text-[10px] font-mono text-indigo-300">
          <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
          <span>
            Simulação ativa: <strong className="uppercase text-white">{activeTest}</strong>. Vá para o <strong className="text-white">Navegador</strong> dos celulares para interagir com o teste!
          </span>
        </div>
      )}
    </div>
  );
};
