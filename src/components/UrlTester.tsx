import React, { useState } from 'react';
import { PRESET_WEBSITES, PresetWebsite } from '../data/smartphones';
import { Smartphone } from '../types';
import { Globe, Send, RefreshCw, Plus, Trash2, Smartphone as PhoneIcon, Check, Laptop, Sparkles, Activity } from 'lucide-react';

interface UrlTesterProps {
  currentUrl: string;
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
  onSelectPreset: (preset: PresetWebsite) => void;
  networkLatency: number;
  smartphones: Smartphone[];
  selectedFocusDevice: string;
  onSelectDevice: (deviceId: string) => void;
}

export const UrlTester: React.FC<UrlTesterProps> = ({
  currentUrl,
  onUrlSubmit,
  isLoading,
  onSelectPreset,
  networkLatency,
  smartphones,
  selectedFocusDevice,
  onSelectDevice,
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);

  // Load custom sites from localStorage or defaults
  const [customSites, setCustomSites] = useState<Array<{ name: string, url: string }>>(() => {
    try {
      const stored = localStorage.getItem('benchmark_custom_sites');
      return stored ? JSON.parse(stored) : [
        { name: 'Meu Portfólio', url: 'https://meu-portfolio-teste.vercel.app' },
        { name: 'Loja Virtual Exemplo', url: 'https://minha-loja-exemplo.com' }
      ];
    } catch (e) {
      return [];
    }
  });

  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onUrlSubmit(inputValue);
    }
  };

  const handleAddCustomSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteUrl.trim()) return;

    let urlToSave = newSiteUrl.trim();
    if (!/^https?:\/\//i.test(urlToSave) && !/^\//.test(urlToSave)) {
      urlToSave = 'https://' + urlToSave;
    }

    const updated = [...customSites, { name: newSiteName.trim(), url: urlToSave }];
    setCustomSites(updated);
    localStorage.setItem('benchmark_custom_sites', JSON.stringify(updated));
    setNewSiteName('');
    setNewSiteUrl('');
    setShowAddForm(false);
  };

  const handleDeleteCustomSite = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updated = customSites.filter((_, idx) => idx !== index);
    setCustomSites(updated);
    localStorage.setItem('benchmark_custom_sites', JSON.stringify(updated));
  };

  return (
    <div className="bg-white border border-stone-200/80 p-6 md:p-8 rounded-3xl shadow-xl shadow-stone-100/50 flex flex-col space-y-6 text-left">
      
      {/* Title & Header */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 font-mono block mb-1">
          Simulador Móvel Ativo
        </span>
        <h2 className="text-xl font-bold text-stone-900 tracking-tight">Digite a URL para Testar</h2>
        <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
          Insira qualquer site criado ou de sua escolha abaixo. O simulador recarregará o conteúdo imediatamente no celular selecionado.
        </p>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200/90 focus:border-stone-400 focus:bg-white rounded-2xl px-4 py-3.5 text-xs text-stone-800 pl-11 focus:outline-hidden font-mono tracking-wide transition-all"
            placeholder="Ex: google.com, localhost:3000, seusite.com..."
            disabled={isLoading}
          />
          <Globe className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-100 text-white disabled:text-stone-400 font-bold rounded-2xl px-6 py-3.5 text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95 disabled:pointer-events-none"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Carregar Site</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Custom Sites / Quick Favorites */}
      <div className="space-y-2 border-t border-stone-100 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>Acesso Rápido / Meus Projetos</span>
          </span>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[10px] text-stone-600 hover:text-stone-900 font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancelar' : 'Novo'}</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddCustomSite} className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nome do Site (Ex: Portfólio)"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                className="bg-white border border-stone-200 text-stone-800 rounded-xl px-3 py-2 text-[11px] focus:outline-hidden focus:border-stone-400 font-medium"
                required
              />
              <input
                type="text"
                placeholder="URL (Ex: localhost:3000)"
                value={newSiteUrl}
                onChange={(e) => setNewSiteUrl(e.target.value)}
                className="bg-white border border-stone-200 text-stone-800 rounded-xl px-3 py-2 text-[11px] focus:outline-hidden focus:border-stone-400 font-mono"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-850 text-white text-[10px] font-bold py-2 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
            >
              Salvar na Lista
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-1.5">
          {customSites.map((site, index) => {
            const isActive = currentUrl.toLowerCase() === site.url.toLowerCase();
            return (
              <div
                key={index}
                onClick={() => {
                  setInputValue(site.url);
                  onUrlSubmit(site.url);
                }}
                className={`group px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-stone-50 border-stone-200/80 text-stone-600 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                <span>{site.name}</span>
                <span className="text-[10px] opacity-40 select-none">|</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustomSite(e, index)}
                  className="text-stone-400 hover:text-red-600 p-0.5 rounded transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
          {customSites.length === 0 && (
            <span className="text-[10px] text-stone-400 italic">Nenhum site salvo. Adicione acima para acesso rápido!</span>
          )}
        </div>
      </div>

      {/* SMARTPHONE LIST SELECTION - EXACTLY BELOW URL AS REQUESTED */}
      <div className="space-y-3 border-t border-stone-100 pt-4">
        <div>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Selecione o Celular para Teste de Navegação
          </span>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Clique no modelo para renderizar o site imediatamente na tela correspondente do dispositivo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {smartphones.map((phone) => {
            const isSelected = selectedFocusDevice === phone.id;
            return (
              <div
                key={phone.id}
                onClick={() => onSelectDevice(phone.id)}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                    : 'bg-stone-50/50 hover:bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  {/* Brand miniature avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                      isSelected
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-white border-stone-200 text-stone-800 shadow-xs'
                    }`}
                  >
                    {phone.brand[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans">
                      {phone.model}
                    </h4>
                    <p className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      {phone.screenSize} • {phone.resolution}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Smartphone color chip */}
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10"
                    style={{ backgroundColor: phone.accentColor }}
                  />
                  {/* Simple elegant Radio selection dot */}
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-white bg-white' : 'border-stone-300 bg-white'
                  }`}>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-stone-900" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preset Websites backup (Compact dropdown) */}
      <div className="space-y-2 border-t border-stone-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
          Ou use um preset padrão:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_WEBSITES.map((site) => {
            const isMatched = currentUrl.toLowerCase().includes(site.name.toLowerCase());
            return (
              <button
                key={site.name}
                type="button"
                onClick={() => {
                  setInputValue(site.url);
                  onSelectPreset(site);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                  isMatched
                    ? 'bg-stone-100 border-stone-300 text-stone-800'
                    : 'bg-white border-stone-200/80 text-stone-500 hover:bg-stone-50'
                }`}
              >
                {site.name}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
