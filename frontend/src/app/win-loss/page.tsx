"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Frown,
  Search,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { getDeals, type DealItem } from '@/lib/deals';

type ResultFilter = 'all' | 'won' | 'lost';

const lossReasonColors = ['#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;

const getClosedDate = (deal: DealItem) => deal.deliveryDate ?? deal.lastContactDate ?? deal.createdAt;

const isWonDeal = (deal: DealItem) => deal.stage.startsWith('Kazan');

const isLostDeal = (deal: DealItem) => deal.stage.includes('Kaybed');

const getCycleDays = (deal: DealItem) => {
  const start = Date.parse(deal.createdAt);
  const end = Date.parse(getClosedDate(deal));

  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;

  const diff = Math.max(end - start, 0);
  return Math.max(1, Math.ceil(diff / 86_400_000));
};

export default function WinLossPage() {
  const [chartsReady, setChartsReady] = useState(false);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ResultFilter>('all');

  useEffect(() => {
    setDeals(getDeals());
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const closedDeals = useMemo(() => {
    return deals
      .filter((deal) => isWonDeal(deal) || isLostDeal(deal))
      .sort((a, b) => Date.parse(getClosedDate(b)) - Date.parse(getClosedDate(a)));
  }, [deals]);

  const wonDeals = closedDeals.filter(isWonDeal);
  const lostDeals = closedDeals.filter(isLostDeal);
  const wonValue = wonDeals.reduce((total, deal) => total + deal.valueAmount, 0);
  const lostValue = lostDeals.reduce((total, deal) => total + deal.valueAmount, 0);
  const winRate = closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
  const averageCycle = closedDeals.length > 0
    ? Math.round(closedDeals.reduce((total, deal) => total + getCycleDays(deal), 0) / closedDeals.length)
    : 0;

  const competitorData = useMemo(() => {
    const grouped = lostDeals.reduce<Record<string, { name: string; lost: number; value: number }>>((acc, deal) => {
      const name = deal.competitorName?.trim() || 'Belirtilmedi';
      acc[name] ??= { name, lost: 0, value: 0 };
      acc[name].lost += 1;
      acc[name].value += deal.valueAmount;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => b.lost - a.lost || b.value - a.value)
      .slice(0, 6);
  }, [lostDeals]);

  const lossReasonData = useMemo(() => {
    const grouped = lostDeals.reduce<Record<string, number>>((acc, deal) => {
      const reason = deal.lossReason?.trim() || 'Belirtilmedi';
      acc[reason] = (acc[reason] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        value: lostDeals.length > 0 ? Math.round((count / lostDeals.length) * 100) : 0,
        color: lossReasonColors[index % lossReasonColors.length],
      }));
  }, [lostDeals]);

  const filteredDeals = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');

    return closedDeals.filter((deal) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'won' && isWonDeal(deal)) ||
        (filter === 'lost' && isLostDeal(deal));

      const matchesSearch = !query || [
        deal.id,
        deal.project,
        deal.company,
        deal.owner,
        deal.city,
        deal.competitorName ?? '',
        deal.notes ?? '',
      ].some((value) => value.toLocaleLowerCase('tr-TR').includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [closedDeals, filter, search]);

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">Win / Loss Analizi</h1>
            <p className="text-sm text-slate-400">Kapanan deal performansını, rakip etkisini ve kayıp nedenlerini takip edin.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-border-subtle bg-slate-800/40 px-4 py-3">
            <Building2 className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500">Kapanan Deal</p>
              <p className="text-sm font-bold text-white">{closedDeals.length}</p>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-3xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" /> {wonDeals.length} deal
                </span>
              </div>
              <span className="text-slate-500 text-xs block mb-1">Toplam Kazanılan Değer</span>
              <span className="text-2xl font-bold text-white">{formatCurrency(wonValue)}</span>
            </div>

            <div className="glass p-6 rounded-3xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Frown className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-xs text-rose-500 font-medium bg-rose-500/10 px-2 py-1 rounded-full">
                  <ArrowDownRight className="w-3 h-3" /> {lostDeals.length} deal
                </span>
              </div>
              <span className="text-slate-500 text-xs block mb-1">Toplam Kaybedilen Değer</span>
              <span className="text-2xl font-bold text-white">{formatCurrency(lostValue)}</span>
            </div>

            <div className="glass p-6 rounded-3xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <span className="text-slate-500 text-xs block mb-1">Genel Kazanma Oranı</span>
              <span className="text-2xl font-bold text-white">{winRate}%</span>
            </div>

            <div className="glass p-6 rounded-3xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <span className="text-slate-500 text-xs block mb-1">Ort. Döngü Süresi</span>
              <span className="text-2xl font-bold text-white">{averageCycle} Gün</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[32px] border border-border-subtle min-w-0">
              <h3 className="text-lg font-semibold text-white mb-8">Rakip Analizi</h3>
              <div className="h-[300px] min-w-0">
                {competitorData.length > 0 && chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={competitorData} layout="vertical" margin={{ left: 12, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" stroke="#F8FAFC" fontSize={12} axisLine={false} tickLine={false} width={100} />
                      <Tooltip
                        cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }}
                        contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', color: '#F8FAFC' }}
                        formatter={(value, name, props) => name === 'lost' ? [`${value} deal`, props.payload.name] : value}
                      />
                      <Bar dataKey="lost" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full rounded-3xl border border-dashed border-border-subtle bg-slate-900/30 flex items-center justify-center text-sm text-slate-500">
                    Kaybedilen deal rakip verisi bekleniyor.
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-[32px] border border-border-subtle min-w-0">
              <h3 className="text-lg font-semibold text-white mb-8">Başlıca Kaybetme Nedenleri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center h-[300px]">
                <div className="h-full min-w-0">
                  {lossReasonData.length > 0 && chartsReady ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={lossReasonData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {lossReasonData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', color: '#F8FAFC' }}
                          formatter={(value) => [`${value} deal`, 'Kayıp']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full rounded-3xl border border-dashed border-border-subtle bg-slate-900/30 flex items-center justify-center text-sm text-slate-500">
                      Kayıp nedeni verisi yok.
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {lossReasonData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-sm text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-[32px] overflow-hidden border border-border-subtle">
            <div className="p-8 border-b border-border-subtle flex flex-col gap-4 bg-slate-800/30 xl:flex-row xl:items-center xl:justify-between">
              <h3 className="text-lg font-semibold text-white">Son Kazanılan / Kaybedilen Deal'ler</h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex rounded-xl border border-border-subtle bg-slate-900 p-1">
                  {[
                    { value: 'all', label: 'Tümü' },
                    { value: 'won', label: 'Kazanılan' },
                    { value: 'lost', label: 'Kaybedilen' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value as ResultFilter)}
                      className={cn(
                        'rounded-lg px-3 py-2 text-xs font-bold transition-all',
                        filter === item.value ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Proje, şirket veya rakip ara..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full bg-slate-900 border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 sm:w-72"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Deal ID</th>
                    <th>Proje</th>
                    <th>Şirket</th>
                    <th>Sonuç</th>
                    <th>Değer</th>
                    <th>Neden / Rakip</th>
                    <th>Kapanış Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal) => {
                    const isWon = isWonDeal(deal);
                    const detail = isWon
                      ? '-'
                      : [deal.lossReason, deal.competitorName].filter(Boolean).join(' / ') || 'Belirtilmedi';

                    return (
                      <tr key={deal.id}>
                        <td className="font-mono text-xs text-blue-400">
                          <Link href={`/pipeline/${deal.id}/edit`} className="hover:text-blue-300">
                            {deal.id}
                          </Link>
                        </td>
                        <td className="text-white font-medium">{deal.project}</td>
                        <td className="text-slate-400">{deal.company}</td>
                        <td>
                          <div className={cn(
                            'px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit border',
                            isWon
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          )}>
                            {isWon ? 'Kazanıldı' : 'Kaybedildi'}
                          </div>
                        </td>
                        <td className="text-white font-bold">{deal.value}</td>
                        <td className="text-sm text-slate-500">{detail}</td>
                        <td className="text-sm text-slate-400">{new Date(getClosedDate(deal)).toLocaleDateString('tr-TR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredDeals.length === 0 && (
              <div className="p-10 text-center border-t border-border-subtle">
                <p className="text-white font-semibold">Henüz kapanan deal yok</p>
                <p className="text-sm text-slate-400 mt-2">Pipeline'da bir deal'i Kazanıldı veya Kaybedildi aşamasına taşıdığınızda burada görünür.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
