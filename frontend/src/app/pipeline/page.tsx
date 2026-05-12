"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { addDealNote, dealStages, getDeals, getLossReasonOptions, markDealAsLost, markDealAsWon, updateDealStage, type DealItem, type DealStageName, lossReasonList } from '@/lib/deals';


const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;

const stageBorderColor = (color: string) => {
  if (color === 'emerald') return '#10B981';
  if (color === 'rose') return '#F43F5E';
  if (color === 'orange') return '#F59E0B';
  if (color === 'blue') return '#3B82F6';
  if (color === 'purple') return '#8B5CF6';
  if (color === 'indigo') return '#6366F1';
  return '#94A3B8';
};

const ownerInitials = (owner: string) => {
  return owner
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.includes(' ') ? name.split(' ').map((part) => part[0]).join('').slice(0, 2) : name.slice(0, 4))
    .join('+');
};

export default function PipelinePage() {
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<DealItem | null>(null);
  const [search, setSearch] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isWonFormOpen, setIsWonFormOpen] = useState(false);
  const [wonReason, setWonReason] = useState('');
  const [wonFinalPrice, setWonFinalPrice] = useState('');
  const [wonDeliveryDate, setWonDeliveryDate] = useState('');
  const [wonEpcPartner, setWonEpcPartner] = useState('');
  const [wonClosedDate, setWonClosedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLossFormOpen, setIsLossFormOpen] = useState(false);
  const [lossReason, setLossReason] = useState('');
  const [lostCompetitorName, setLostCompetitorName] = useState('');
  const [lossLesson, setLossLesson] = useState('');
  const [lossClosedDate, setLossClosedDate] = useState(new Date().toISOString().slice(0, 10));
  const [lossReasonOptions, setLossReasonOptions] = useState<string[]>([]);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStageName | null>(null);
  const [recentlyDragged, setRecentlyDragged] = useState(false);

  useEffect(() => {
    setDeals(getDeals());
    setLossReasonOptions(getLossReasonOptions());
  }, []);

  const filteredDeals = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');
    if (!query) return deals;

    return deals.filter((deal) => [
      deal.id,
      deal.project,
      deal.company,
      deal.owner,
      deal.city,
      deal.stage,
    ].some((value) => value.toLocaleLowerCase('tr-TR').includes(query)));
  }, [deals, search]);

  const totalPipeline = filteredDeals.reduce((total, deal) => total + deal.valueAmount, 0);

  const closeLossForm = () => {
    setIsLossFormOpen(false);
    setLossReason('');
    setLostCompetitorName('');
    setLossLesson('');
    setLossClosedDate(new Date().toISOString().slice(0, 10));
  };

  const closeWonForm = () => {
    setIsWonFormOpen(false);
    setWonReason('');
    setWonFinalPrice('');
    setWonDeliveryDate('');
    setWonEpcPartner('');
    setWonClosedDate(new Date().toISOString().slice(0, 10));
  };

  const handleAddNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDeal) return;

    const updatedDeal = addDealNote(selectedDeal.id, noteText);
    if (!updatedDeal) {
      toast.error('Not kaydedilemedi.');
      return;
    }

    setDeals(getDeals());
    setSelectedDeal(updatedDeal);
    setNoteText('');
    toast.success('Not eklendi.');
  };

  const handleMarkAsWon = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDeal) return;

    if (!wonReason.trim()) {
      toast.error('Kazanma nedeni girin.');
      return;
    }

    const finalPrice = Number(wonFinalPrice || selectedDeal.valueAmount);
    const updatedDeal = markDealAsWon(selectedDeal.id, {
      wonReason: wonReason.trim(),
      finalPrice: Number.isFinite(finalPrice) ? finalPrice : selectedDeal.valueAmount,
      deliveryDate: wonDeliveryDate,
      epcPartner: wonEpcPartner,
      closedDate: wonClosedDate,
    });
    if (!updatedDeal) {
      toast.error('Deal güncellenemedi.');
      return;
    }

    setDeals(getDeals());
    setSelectedDeal(updatedDeal);
    closeWonForm();
    toast.success(`${updatedDeal.id} kazanıldı olarak işaretlendi.`);
  };

  const handleMarkAsLost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDeal) return;

    const normalizedReason = lossReason.trim().replace(/\s+/g, ' ');
    if (!normalizedReason) {
      toast.error('Kaybetme nedeni girin.');
      return;
    }
    if (normalizedReason.split(' ').filter(Boolean).length > 3) {
      toast.error('Kaybetme nedeni en fazla 3 kelime olmali.');
      return;
    }

    const updatedDeal = markDealAsLost(selectedDeal.id, normalizedReason, lostCompetitorName, {
      lossLesson,
      closedDate: lossClosedDate,
    });
    if (!updatedDeal) {
      toast.error('Deal guncellenemedi.');
      return;
    }

    setDeals(getDeals());
    setLossReasonOptions(getLossReasonOptions());
    setSelectedDeal(updatedDeal);
    closeLossForm();
    toast.success(`${updatedDeal.id} kaybedildi olarak isaretlendi.`);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, dealId: string) => {
    setDraggedDealId(dealId);
    setRecentlyDragged(true);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
    setDragOverStage(null);
    window.setTimeout(() => setRecentlyDragged(false), 120);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, stageName: DealStageName) => {
    event.preventDefault();

    const dealId = event.dataTransfer.getData('text/plain') || draggedDealId;
    const currentDeal = deals.find((deal) => deal.id === dealId);
    if (!dealId || !currentDeal) return;

    setDragOverStage(null);
    if (currentDeal.stage === stageName) return;

    if (stageName === 'Kazanıldı') {
      setSelectedDeal(currentDeal);
      setWonReason(currentDeal.wonReason ?? '');
      setWonFinalPrice(String(currentDeal.finalPrice ?? currentDeal.valueAmount));
      setWonDeliveryDate(currentDeal.deliveryDate ?? '');
      setWonEpcPartner(currentDeal.epcPartner ?? '');
      setWonClosedDate(currentDeal.closedDate ?? new Date().toISOString().slice(0, 10));
      setIsWonFormOpen(true);
      return;
    }

    if (stageName === 'Kaybedildi') {
      setSelectedDeal(currentDeal);
      setLostCompetitorName(currentDeal.competitorName ?? '');
      setLossReason(currentDeal.lossReason ?? '');
      setLossLesson(currentDeal.lossLesson ?? '');
      setLossClosedDate(currentDeal.closedDate ?? new Date().toISOString().slice(0, 10));
      setIsLossFormOpen(true);
      return;
    }

    const updatedDeal = updateDealStage(dealId, stageName);
    if (!updatedDeal) {
      toast.error('Deal asamasi guncellenemedi.');
      return;
    }

    setDeals(getDeals());
    if (selectedDeal?.id === updatedDeal.id) setSelectedDeal(updatedDeal);
    toast.success(`${updatedDeal.id} ${stageName} asamasina tasindi.`);
  };

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Pipeline</h1>
              <button 
                onClick={() => {
                  if (confirm('Tüm yerel veriler temizlenecek. Emin misiniz?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="text-[10px] text-rose-500 hover:text-rose-400 transition-colors uppercase font-bold tracking-wider"
              >
                [Yerel Verileri Sıfırla]
              </button>
            </div>
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
            <Link href="/pipeline/new">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                <Plus className="w-5 h-5" />
                Yeni Deal
              </button>
            </Link>
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
                <span className="text-white font-bold">{formatCurrency(totalPipeline)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={cn("flex-1 p-8", view === 'table' ? "overflow-auto" : "overflow-hidden flex flex-col")}>
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
                      <th>Son Aksiyon</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeals.map((deal) => (
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
                          <div className="flex items-center gap-2" title={deal.owner}>
                            <span className="text-sm font-bold text-blue-400">{ownerInitials(deal.owner)}</span>
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
                        <td>
                          <div className="flex flex-col">
                            <span className="text-xs text-white">{deal.nextActionDate ? new Date(deal.nextActionDate).toLocaleDateString('tr-TR') : (deal.lastActivityDate ? new Date(deal.lastActivityDate).toLocaleDateString('tr-TR') : '-')}</span>
                            <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{deal.nextActionSubject || 'Aksiyon planlanmadı'}</span>
                          </div>
                        </td>
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
              {filteredDeals.length === 0 && (
                <div className="p-10 text-center border-t border-border-subtle">
                  <p className="text-white font-semibold">Henüz deal yok</p>
                  <p className="text-sm text-slate-400 mt-2">Yeni Deal butonuyla ilk fırsat kaydını oluşturabilirsiniz.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar min-h-0">
              {dealStages.map((stage) => {
                const stageDeals = filteredDeals.filter(d => d.stage === stage.name);
                const isDropTarget = dragOverStage === stage.name;

                return (
                <div
                  key={stage.name}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    setDragOverStage(stage.name);
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setDragOverStage(null);
                    }
                  }}
                  onDrop={(event) => handleDrop(event, stage.name)}
                  className={cn(
                    "flex-1 min-w-[300px] max-h-full flex flex-col gap-4 rounded-3xl border border-transparent p-2 transition-all overflow-hidden",
                    isDropTarget && "border-blue-500/50 bg-blue-500/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">{stage.name}</h3>
                      <span className="bg-slate-800 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-border-subtle">
                        {stageDeals.length}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs font-mono">
                      {formatCurrency(stageDeals.reduce((acc, curr) => acc + curr.valueAmount, 0))}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar min-h-0 pb-4">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(event) => handleDragStart(event, deal.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => {
                          if (!recentlyDragged && !draggedDealId) setSelectedDeal(deal);
                        }}
                      >
                      <motion.div
                        layoutId={deal.id}
                        className={cn(
                          "glass p-4 rounded-2xl border-l-4 transition-all cursor-grab active:cursor-grabbing group",
                          draggedDealId === deal.id ? "opacity-50 scale-[0.98]" : "hover:border-blue-500"
                        )}
                        style={{ borderLeftColor: stageBorderColor(stage.color) }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-slate-500">{deal.id}</span>
                          <span className="text-[10px] font-medium text-slate-500 group-hover:text-blue-400 transition-colors">{deal.capacity}</span>
                        </div>
                        <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">{deal.project}</h4>
                        <p className="text-xs text-slate-400 mb-3">{deal.company}</p>
                        
                        {(deal.lastActivityDate || deal.nextActionDate) && (
                          <div className="flex flex-col gap-2 mb-4 p-2 rounded-xl bg-slate-900/50 border border-border-subtle/50">
                            {deal.lastActivityDate && (
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                                <span>Son: {new Date(deal.lastActivityDate).toLocaleDateString('tr-TR')}</span>
                              </div>
                            )}
                            {deal.nextActionDate && (
                              <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-medium">
                                <Calendar className="w-3 h-3" />
                                <span>Gelecek: {new Date(deal.nextActionDate).toLocaleDateString('tr-TR')}</span>
                                {deal.nextActionSubject && <span className="truncate opacity-70">- {deal.nextActionSubject}</span>}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-400" title={deal.owner}>{ownerInitials(deal.owner)}</span>
                          </div>
                          <span className="text-sm font-bold text-white">{deal.value}</span>
                        </div>
                      </motion.div>
                      </div>
                    ))}
                    <Link href="/pipeline/new">
                      <button className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border-subtle rounded-2xl text-slate-500 hover:text-white hover:border-slate-400 transition-all text-sm group">
                        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Deal Ekle
                      </button>
                    </Link>
                  </div>
                </div>
              )})}
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
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-slate-400">{selectedDeal.company}</p>
                      <span className="text-slate-600">•</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-blue-400 font-bold">{ownerInitials(selectedDeal.owner)}</span>
                        <span className="text-xs text-slate-400 font-medium">{selectedDeal.owner}</span>
                      </div>
                    </div>
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
                          <p className="text-white font-medium">{selectedDeal.jinkoPrice ? `$${selectedDeal.jinkoPrice} /Wp` : '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-500">HSA Fiyatı</span>
                          <p className="text-white font-medium">{selectedDeal.hsaPrice ? `$${selectedDeal.hsaPrice} /Wp` : '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-500">Hedef Fiyat</span>
                          <p className="text-white font-medium">{selectedDeal.targetPrice ? `$${selectedDeal.targetPrice} /Wp` : '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-500">EPC Partneri</span>
                          <p className="text-white font-medium">{selectedDeal.epcPartner ?? '-'}</p>
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
                          <span className="text-sm text-white">{new Date(selectedDeal.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-border-subtle">
                          <span className="text-sm text-slate-400">Tahmini Teslimat</span>
                          <span className="text-sm text-white">{selectedDeal.deliveryDate ? new Date(selectedDeal.deliveryDate).toLocaleDateString('tr-TR') : '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        Notlar
                      </h4>

                      <form onSubmit={handleAddNote} className="mb-5 space-y-3">
                        <textarea
                          value={noteText}
                          onChange={(event) => setNoteText(event.target.value)}
                          className="w-full min-h-28 resize-none rounded-2xl border border-border-subtle bg-slate-900/50 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Yeni not ekle..."
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={!noteText.trim()}
                          >
                            Not Ekle
                          </button>
                        </div>
                      </form>

                      <div className="space-y-3">
                        {selectedDeal.noteHistory.map((note) => (
                          <div key={note.id} className="rounded-2xl border border-border-subtle bg-slate-900/30 p-4">
                            <div className="mb-2 text-xs text-slate-500">
                              {new Date(note.createdAt).toLocaleString('tr-TR')}
                            </div>
                            <p className="whitespace-pre-wrap text-sm text-slate-200">{note.text}</p>
                          </div>
                        ))}
                        {selectedDeal.noteHistory.length === 0 && (
                          <p className="rounded-2xl border border-border-subtle bg-slate-900/30 p-4 text-sm text-slate-500">
                            Henüz not eklenmemiş.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isWonFormOpen && (
                  <form onSubmit={handleMarkAsWon} className="border-t border-border-subtle bg-slate-900/30 p-8 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Kazanma Nedeni</label>
                        <input
                          value={wonReason}
                          onChange={(event) => setWonReason(event.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Fiyat / stok / iliski"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Final Fiyat ($)</label>
                        <input
                          value={wonFinalPrice}
                          onChange={(event) => setWonFinalPrice(event.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          type="number"
                          min="0"
                          step="1"
                          placeholder={String(selectedDeal.valueAmount)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Teslim Tarihi</label>
                        <input
                          value={wonDeliveryDate}
                          onChange={(event) => setWonDeliveryDate(event.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          type="date"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Kapanis Tarihi</label>
                        <input
                          value={wonClosedDate}
                          onChange={(event) => setWonClosedDate(event.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          type="date"
                          required
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-300">EPC Partner</label>
                        <input
                          value={wonEpcPartner}
                          onChange={(event) => setWonEpcPartner(event.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Partner firma"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={closeWonForm} className="rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-slate-800 hover:text-white">
                        Vazgec
                      </button>
                      <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-500">
                        Kazanildi Kaydet
                      </button>
                    </div>
                  </form>
                )}

                {isLossFormOpen && (
                  <form onSubmit={handleMarkAsLost} className="border-t border-border-subtle bg-slate-900/30 p-8 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Kaybetme Nedeni</label>
                        <input
                          value={lossReason}
                          onChange={(event) => setLossReason(event.target.value)}
                          list="pipeline-loss-reason-options"
                          className="w-full rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Fiyat farki"
                          maxLength={40}
                          required
                        />
                        <datalist id="pipeline-loss-reason-options">
                          {lossReasonList.map((reason) => (
                            <option key={reason} value={reason} />
                          ))}
                        </datalist>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Rakip</label>
                        <input
                          value={lostCompetitorName}
                          onChange={(event) => setLostCompetitorName(event.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Rakip firma"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Kapanis Tarihi</label>
                        <input
                          value={lossClosedDate}
                          onChange={(event) => setLossClosedDate(event.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          type="date"
                          required
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium text-slate-300">Ogrenilen Ders / Aksiyon</label>
                        <textarea
                          value={lossLesson}
                          onChange={(event) => setLossLesson(event.target.value)}
                          className="w-full min-h-24 resize-none rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Sonraki benzer firsat icin alinacak aksiyon"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Kaybetme nedeni grafik etiketi icin en fazla 3 kelime olmali.</p>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeLossForm}
                        className="rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                      >
                        Vazgec
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-rose-500"
                      >
                        Kaybedildi Kaydet
                      </button>
                    </div>
                  </form>
                )}

                <div className="p-8 border-t border-border-subtle flex gap-4 bg-slate-900/20 backdrop-blur-md">
                  <Link href={`/pipeline/${selectedDeal.id}/edit`} className="flex-1">
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
                      Deal'i Düzenle
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setWonReason(selectedDeal.wonReason ?? '');
                      setWonFinalPrice(String(selectedDeal.finalPrice ?? selectedDeal.valueAmount));
                      setWonDeliveryDate(selectedDeal.deliveryDate ?? '');
                      setWonEpcPartner(selectedDeal.epcPartner ?? '');
                      setWonClosedDate(selectedDeal.closedDate ?? new Date().toISOString().slice(0, 10));
                      setIsWonFormOpen(true);
                    }}
                    disabled={selectedDeal.stage === 'Kazanıldı'}
                    className="flex-1 border border-border-subtle text-white hover:bg-slate-800 py-3 rounded-xl font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedDeal.stage === 'Kazanıldı' ? 'Zaten Kazanıldı' : 'Kazanıldı Olarak İşaretle'}
                  </button>
                  <button
                    onClick={() => {
                      setLostCompetitorName(selectedDeal.competitorName ?? '');
                      setLossReason(selectedDeal.lossReason ?? '');
                      setLossLesson(selectedDeal.lossLesson ?? '');
                      setLossClosedDate(selectedDeal.closedDate ?? new Date().toISOString().slice(0, 10));
                      setIsLossFormOpen(true);
                    }}
                    disabled={selectedDeal.stage === 'Kaybedildi'}
                    className="flex-1 border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 py-3 rounded-xl font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedDeal.stage === 'Kaybedildi' ? 'Zaten Kaybedildi' : 'Kaybedildi Olarak Isaretle'}
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
