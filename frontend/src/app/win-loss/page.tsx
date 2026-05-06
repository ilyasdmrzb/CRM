"use client";

import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Frown, 
  TrendingUp, 
  BarChart3, 
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

const competitorData = [
  { name: 'PowerSun', lost: 12, value: 450000 },
  { name: 'SolarEdge', lost: 8, value: 320000 },
  { name: 'EnergyCo', lost: 5, value: 150000 },
  { name: 'GreenCell', lost: 3, value: 90000 },
];

const lossReasonData = [
  { name: 'Fiyat', value: 45, color: '#EF4444' },
  { name: 'Ürün Özellikleri', value: 25, color: '#F59E0B' },
  { name: 'Teslim Süresi', value: 20, color: '#3B82F6' },
  { name: 'İlişki', value: 10, color: '#94A3B8' },
];

export default function WinLossPage() {
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">Win / Loss Analysis</h1>
            <p className="text-sm text-slate-400">Satış performansınızı ve dönüşüm oranlarınızı detaylı inceleyin.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-white">Sistem Yöneticisi</span>
              <span className="text-xs text-slate-400">admin@company.com</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold">
              SA
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-3xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" /> +15%
                </span>
              </div>
              <span className="text-slate-500 text-xs block mb-1">Toplam Kazanılan Değer</span>
              <span className="text-2xl font-bold text-white">$4.2M</span>
            </div>

            <div className="glass p-6 rounded-3xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Frown className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-xs text-rose-500 font-medium bg-rose-500/10 px-2 py-1 rounded-full">
                  <ArrowDownRight className="w-3 h-3" /> -8%
                </span>
              </div>
              <span className="text-slate-500 text-xs block mb-1">Toplam Kaybedilen Değer</span>
              <span className="text-2xl font-bold text-white">$1.8M</span>
            </div>

            <div className="glass p-6 rounded-3xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <span className="text-slate-500 text-xs block mb-1">Genel Kazanma Oranı</span>
              <span className="text-2xl font-bold text-white">68.4%</span>
            </div>

            <div className="glass p-6 rounded-3xl border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <span className="text-slate-500 text-xs block mb-1">Ort. Döngü Süresi</span>
              <span className="text-2xl font-bold text-white">42 Gün</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[32px] border border-border-subtle min-w-0">
              <h3 className="text-lg font-semibold text-white mb-8">Rakip Analizi (Kaybedilen Deal'ler)</h3>
              <div className="h-[300px] min-w-0">
                {chartsReady && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={competitorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#F8FAFC" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }}
                      contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                    />
                    <Bar dataKey="lost" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-[32px] border border-border-subtle min-w-0">
              <h3 className="text-lg font-semibold text-white mb-8">Başlıca Kaybetme Nedenleri</h3>
              <div className="grid grid-cols-2 gap-8 items-center h-[300px]">
                <div className="h-full min-w-0">
                  {chartsReady && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                        data={lossReasonData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {lossReasonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                      />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="space-y-4">
                  {lossReasonData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-400 text-sm">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="glass rounded-[32px] overflow-hidden border border-border-subtle">
            <div className="p-8 border-b border-border-subtle flex justify-between items-center bg-slate-800/30">
              <h3 className="text-lg font-semibold text-white">Son Kazanılan / Kaybedilen Deal'ler</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Ara..." className="bg-slate-900 border border-border-subtle rounded-xl py-2 pl-10 pr-4 text-sm text-white w-64 outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
            </div>
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
                {[
                  { id: 'DEAL-0005', project: 'Depolama Sistemi', company: 'İstanbul Tech', result: 'kazanıldı', value: '$150,000', detail: '-', date: '12 Mayıs 2024' },
                  { id: 'DEAL-0008', project: 'Mega Farm X', company: 'Ankara Sanayi', result: 'kaybedildi', value: '$850,000', detail: 'Fiyat / PowerSun', date: '10 Mayıs 2024' },
                  { id: 'DEAL-0012', project: 'Solar Village', company: 'İzmir Enerji', result: 'kazanıldı', value: '$420,000', detail: '-', date: '08 Mayıs 2024' },
                  { id: 'DEAL-0015', project: 'Rooftop Faz 3', company: 'Bursa Fabrika', result: 'kaybedildi', value: '$210,000', detail: 'Teslimat / SolarEdge', date: '05 Mayıs 2024' },
                ].map((deal) => (
                  <tr key={deal.id}>
                    <td className="font-mono text-xs text-blue-400">{deal.id}</td>
                    <td className="text-white font-medium">{deal.project}</td>
                    <td className="text-slate-400">{deal.company}</td>
                    <td>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit",
                        deal.result === 'kazanıldı' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      )}>
                        {deal.result}
                      </div>
                    </td>
                    <td className="text-white font-bold">{deal.value}</td>
                    <td className="text-sm text-slate-500">{deal.detail}</td>
                    <td className="text-sm text-slate-400">{deal.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
