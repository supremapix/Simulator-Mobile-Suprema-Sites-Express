import React from 'react';
import { Smartphone } from '../types';
import { Cpu, Zap, Thermometer, Check, MousePointer, Activity } from 'lucide-react';

interface DeviceSelectionDeckProps {
  smartphones: Smartphone[];
  selectedFocusDevice: string;
  layout: 1 | 2 | 4;
  metricsMap: Record<string, any>;
  onSelectDevice: (deviceId: string) => void;
  activeTabs: Record<string, string>;
  onSetTab: (deviceId: string, tab: any) => void;
}

export const DeviceSelectionDeck: React.FC<DeviceSelectionDeckProps> = ({
  smartphones,
  selectedFocusDevice,
  layout,
  metricsMap,
  onSelectDevice,
  activeTabs,
  onSetTab,
}) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-3xl p-5 select-none text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm uppercase tracking-wider font-black text-slate-200 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Selecione um Flagship para Focar & Testar</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Clique em qualquer dispositivo para focar a visualização individual e executar simulações de hardware dedicadas.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono font-bold px-2.5 py-1 rounded-full uppercase border border-indigo-500/20">
            {layout === 1 ? 'Modo Foco Único' : layout === 2 ? 'Modo Lado a Lado' : 'Modo Quad View'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {smartphones.map((phone) => {
          const isFocused = layout === 1 && selectedFocusDevice === phone.id;
          const phoneMetrics = metricsMap[phone.id] || { currentFps: 120, cpuUsage: 12, temperature: 35 };
          const currentTab = activeTabs[phone.id] || 'home';

          return (
            <div
              key={phone.id}
              onClick={() => onSelectDevice(phone.id)}
              className={`relative bg-slate-950/80 hover:bg-slate-950 border rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                isFocused
                  ? 'ring-2 ring-indigo-500 border-transparent bg-slate-950 shadow-lg shadow-indigo-950/20'
                  : 'border-slate-850 hover:border-slate-800'
              }`}
            >
              {/* Focus Badge */}
              {isFocused && (
                <div className="absolute top-3 right-3 bg-indigo-500 text-white rounded-full p-0.5 shadow-md">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2">
                  {/* Miniature brand icon or avatar placeholder */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner"
                    style={{
                      backgroundColor: `${phone.accentColor}15`,
                      color: phone.accentColor,
                      border: `1px solid ${phone.accentColor}30`,
                    }}
                  >
                    {phone.brand[0]}
                  </div>
                  <div className="text-left overflow-hidden">
                    <h4 className="text-xs font-black text-slate-100 group-hover:text-indigo-400 transition-colors truncate">
                      {phone.model}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-mono truncate block">
                      {phone.chipset.split(' (')[0]}
                    </span>
                  </div>
                </div>

                {/* Hardware Spec Badges */}
                <div className="grid grid-cols-2 gap-1.5 mt-3 text-[9px] font-mono">
                  <div className="bg-slate-900/80 px-2 py-1 rounded-md text-slate-400 flex items-center space-x-1">
                    <Cpu className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{phone.ram}GB LPDDR5X</span>
                  </div>
                  <div className="bg-slate-900/80 px-2 py-1 rounded-md text-slate-400 flex items-center space-x-1">
                    <Thermometer className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                    <span>{phoneMetrics.temperature}°C</span>
                  </div>
                </div>

                {/* Telemetry HUD line */}
                <div className="mt-3 bg-slate-900/40 p-2 rounded-xl border border-slate-850/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Uso CPU:</span>
                  <div className="flex items-center space-x-1.5 w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${phoneMetrics.cpuUsage}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-bold">{phoneMetrics.cpuUsage}%</span>
                </div>
              </div>

              {/* Quick actions for targeted control */}
              <div className="mt-4 pt-3 border-t border-slate-850/60 flex items-center justify-between gap-1.5">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                  Tela: <span className="text-slate-400">{currentTab}</span>
                </span>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    title="Navegador"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDevice(phone.id);
                      onSetTab(phone.id, 'browser');
                    }}
                    className={`p-1 rounded-md hover:bg-slate-800 transition-colors text-xs ${
                      currentTab === 'browser' ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  >
                    <MousePointer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Monitor de Hardware"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDevice(phone.id);
                      onSetTab(phone.id, 'hardware');
                    }}
                    className={`p-1 rounded-md hover:bg-slate-800 transition-colors text-xs ${
                      currentTab === 'hardware' ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
