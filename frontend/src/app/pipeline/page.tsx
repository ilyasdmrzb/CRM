"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  ExternalLink,
  ChevronDown,
  Calendar,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

const mockDeals = [
  { id: 'DEAL-0001', project: 'Çatı GES Faz 1', company: 'Ankara Sanayi', owner: 'Gamze K.', capacity: '1.2 MW', stage: 'Müzakere', probability: 65, value: '$120,000', weighted: '$78,000', color: 'orange', city: 'Ankara' },
  { id: 'DEAL-0002', project: 'Solar Farm Alpha', company: 'İzmir Enerji', owner: 'John Doe', capacity: '5.0 MW', stage: 'Teklif', probability: 40, value: '$500,000', weighted: '$200,000', color: 'blue', city: 'İzmir' },
  { id: 'DEAL-0003', project: 'Otel GES Yenileme', company: 'Antalya Resort', owner: 'Sarah C.', capacity: '0.8 MW', stage: 'Yeterlilik', probability: 25, value: '$85,000', weighted: '$21,250', color: 'indigo', city: 'Antalya' },
  { id: 'DEAL-0004', project: 'Endüstriyel Kompleks', company: 'Bursa Fabrika', owner: 'Gamze K.', capacity: '2.5 MW', stage: 'Taahhüt', probability: 85, value: '$320,000', weighted: '$272,000', color: 'purple', city: 'Bursa' },
  { id: 'DEAL-0005', project: 'Depolama Sistemi', company: 'İstanbul Tech', owner: 'Michael S.', capacity: '1.0 MW', stage: 'Kazanıldı', probability: 100, value: '$150,000', weighted: '$150,000', color: 'emerald', city: 'İstanbul' },
];

const stages = [
  { name: 'Potansiyel', color: 'slate' },
  { name: 'Yeterlilik', color: 'indigo' },
  { name: 'Teklif', color: 'blue' },
  { name: 'Müzakere', color: 'orange' },
  { name: 'Taahhüt', color: 'purple' },
  { name: 'Kazanıldı', color: 'emerald' },
  { name: 'Kaybedildi', color: 'rose' },
];

export default function PipelinePage() {
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [search, setSearch] = useState('');

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">Pipeline</h1>
            <p className="text-sm text-slate-400">Deal'lerinizi yönetin ve ilerlemeyi takip edin.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800 p-1 rounded-xl border border-border-subtle">
              <button 
                onClick={() => setView('table')}
                className={cn("p-2 rounded-lg transition-all", view === 'table' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
              >
                <List className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setView('kanban')}
                className={cn("p-2 rounded-lg transition-all", view === 'kanban' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              <Plus className="w-5 h-5" />
              Yeni Deal
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="p-8 pb-0">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-border-subtle backdrop-blur-sm">
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Proje, şirket veya ID ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-subtle text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <Filter className="w-4 h-4" />
                Filtreler
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs">Toplam Pipeline</span>
                <span className="text-white font-bold">$12,450,000</span>
              </div>
              <div className="h-8 w-px bg-border-subtle" />
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs">Ağırlıklı</span>
                <span className="text-blue-400 font-bold">$4,820,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {view === 'table' ? (
            <div className="glass rounded-[32px] overflow-hidden border border-border-subtle">
              <div className="overflow-x-auto">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Deal ID</th>
                      <th>Proje Adı</th>
                      <th>Şirket</th>
                      <th>Satış Sorumlusu</th>
                      <th>Kapasite</th>
                      <th>Aşama</th>
                      <th>Değer</th>
                      <th>Ağırlıklı</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDeals.map((deal) => (
                      <tr 
                        key={deal.id} 
                        className="cursor-pointer group"
                        onClick={() => setSelectedDeal(deal)}
                      >
                        <td className="font-mono text-xs text-blue-400">{deal.id}</td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">{deal.project}</span>
                            <span className="text-xs text-slate-500">{deal.city}</span>
                          </div>
                        </td>
                        <td className="text-slate-300">{deal.company}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {deal.owner.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm">{deal.owner}</span>
                          </div>
                        </td>
                        <td className="text-slate-400">{deal.capacity}</td>
                        <td>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium w-fit border",
                            deal.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            deal.color === 'orange' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                            deal.color === 'blue' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                            deal.color === 'purple' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                            "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          )}>
                            {deal.stage}
                          </div>
                        </td>
                        <td className="text-white font-semibold">{deal.value}</td>
                        <td className="text-blue-400 font-medium">{deal.weighted}</td>
                        <td>
                          <button className="p-2 text-slate-500 hover:text-white transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-8 min-h-[700px]">
              {stages.slice(0, 5).map((stage) => (
                <div key={stage.name} className="flex-1 min-w-[300px] flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">{stage.name}</h3>
                      <span className="bg-slate-800 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-border-subtle">
                        {mockDeals.filter(d => d.stage === stage.name).length}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs font-mono">
                      ${mockDeals.filter(d => d.stage === stage.name).reduce((acc, curr) => acc + parseInt(curr.value.replace('$', '').replace(',', '')), 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {mockDeals.filter(d => d.stage === stage.name).map((deal) => (
                      <motion.div
                        layoutId={deal.id}
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className="glass p-4 rounded-2xl border-l-4 hover:border-blue-500 transition-all cursor-pointer group"
                        style={{ borderLeftColor: stage.color === 'orange' ? '#F59E0B' : stage.color === 'blue' ? '#3B82F6' : '#94A3B8' }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-slate-500">{deal.id}</span>
                          <span className="text-[10px] font-medium text-slate-500 group-hover:text-blue-400 transition-colors">{deal.capacity}</span>
                        </div>
                        <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">{deal.project}</h4>
                        <p className="text-xs text-slate-400 mb-4">{deal.company}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">GK</div>
                          </div>
                          <span className="text-sm font-bold text-white">{deal.value}</span>
                        </div>
                      </motion.div>
                    ))}
                    <button className="flex items-center justify-center gap-2 py-3 border border-dashed border-border-subtle rounded-2xl text-slate-500 hover:text-white hover:border-slate-400 transition-all text-sm group">
                      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Deal Ekle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        <AnimatePresence>
          {selectedDeal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDeal(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-2xl bg-sidebar border-l border-border-subtle z-[70] shadow-2xl p-0 flex flex-col"
              >
                <div className="p-8 border-b border-border-subtle flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-blue-500">{selectedDeal.id}</span>
                      <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", `bg-${selectedDeal.color}-500/10 text-${selectedDeal.color}-500 border border-${selectedDeal.color}-500/20`)}>
                        {selectedDeal.stage}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedDeal.project}</h2>
                    <p className="text-slate-400">{selectedDeal.company}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedDeal(null)}
                    className="p-2 hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-border-subtle">
                      <span className="text-xs text-slate-500 block mb-1">Deal Değeri</span>
                      <span className="text-lg font-bold text-white">{selectedDeal.value}</span>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-border-subtle">
                      <span className="text-xs text-slate-500 block mb-1">Olasılık</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-400">{selectedDeal.probability}%</span>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-border-subtle">
                      <span className="text-xs text-slate-500 block mb-1">Kapasite</span>
                      <span className="text-lg font-bold text-orange-400">{selectedDeal.capacity}</span>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        Fiyat Detayları
                      </h4>
                      <div className="grid grid-cols-2 gap-6 bg-slate-900/30 p-6 rounded-3xl border border-border-subtle">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-500">Jinko Fiyatı</span>
                          <p className="text-white font-medium">$0.125 /Wp</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-500">HSA Fiyatı</span>
                          <p className="text-white font-medium">$0.132 /Wp</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-500">Hedef Fiyat</span>
                          <p className="text-white font-medium">$0.128 /Wp</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-500">EPC Partneri</span>
                          <p className="text-white font-medium">SolarMasters Ltd.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Önemli Tarihler
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-border-subtle">
                          <span className="text-sm text-slate-400">Oluşturma Tarihi</span>
                          <span className="text-sm text-white">12 Mayıs 2024</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-border-subtle">
                          <span className="text-sm text-slate-400">Tahmini Teslimat</span>
                          <span className="text-sm text-white">20 Eylül 2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-border-subtle flex gap-4 bg-slate-900/20 backdrop-blur-md">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
                    Deal'i Düzenle
                  </button>
                  <button className="flex-1 border border-border-subtle text-white hover:bg-slate-800 py-3 rounded-xl font-bold transition-all">
                    Kazanıldı Olarak İşaretle
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
