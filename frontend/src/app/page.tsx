"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
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
import { getActivities, type ActivityItem } from '@/lib/activities';
import { dealStages, getDeals, type DealItem } from '@/lib/deals';

type PipelineData = { name: string; value: number };
type StageData = { name: string; value: number; color: string };
type TopSalesUser = { name: string; won: number; value: string; rate: string };
type TrendRange = 1 | 3 | 6 | 12 | 'all';

const stageColors: Record<string, string> = {
  slate: '#94A3B8',
  indigo: '#6366F1',
  blue: '#3B82F6',
  orange: '#F59E0B',
  purple: '#8B5CF6',
  emerald: '#10B981',
  rose: '#F43F5E',
};

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;
const monthLabel = (date: Date) => date.toLocaleDateString('tr-TR', { month: 'short' });
const isWonDeal = (deal: DealItem) => deal.stage.startsWith('Kazan');
const isLostDeal = (deal: DealItem) => deal.stage.includes('Kaybed');
const isOpenDeal = (deal: DealItem) => !isWonDeal(deal) && !isLostDeal(deal);

const getActivityTimeLabel = (activity: ActivityItem) => {
  const dateValue = Date.parse(activity.completedAt ?? activity.createdAt);
  if (!Number.isFinite(dateValue)) return activity.date || '-';

  return new Date(dateValue).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
};

const StatCard = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-3xl relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 bg-${color}-500`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [chartsReady, setChartsReady] = useState(false);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [trendRange, setTrendRange] = useState<TrendRange>(6);

  useEffect(() => {
    setDeals(getDeals());
    setActivities(getActivities());
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const openDeals = useMemo(() => deals.filter(isOpenDeal), [deals]);
  const wonDeals = useMemo(() => deals.filter(isWonDeal), [deals]);
  const lostDeals = useMemo(() => deals.filter(isLostDeal), [deals]);

  const totalPipeline = openDeals.reduce((total, deal) => total + deal.valueAmount, 0);
  const wonValue = wonDeals.reduce((total, deal) => total + deal.valueAmount, 0);
  const lostValue = lostDeals.reduce((total, deal) => total + deal.valueAmount, 0);
  const totalCapacity = openDeals.reduce((total, deal) => total + (deal.capacityMw ?? 0), 0);

  const pipelineData = useMemo<PipelineData[]>(() => {
    const now = new Date();
    const range = trendRange === 'all'
      ? Math.max(
          1,
          ...deals.map((deal) => {
            const created = new Date(deal.createdAt);
            if (Number.isNaN(created.getTime())) return 1;

            return (now.getFullYear() - created.getFullYear()) * 12 + now.getMonth() - created.getMonth() + 1;
          })
        )
      : trendRange;

    return Array.from({ length: range }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (range - 1 - index), 1);
      const monthDeals = deals.filter((deal) => {
        const created = new Date(deal.createdAt);
        return created.getFullYear() === month.getFullYear() && created.getMonth() === month.getMonth();
      });

      return {
        name: monthLabel(month),
        value: monthDeals.reduce((total, deal) => total + deal.valueAmount, 0),
      };
    });
  }, [deals, trendRange]);

  const stageData = useMemo<StageData[]>(() => {
    return dealStages
      .map((stage) => ({
        name: stage.name,
        value: deals.filter((deal) => deal.stage === stage.name).length,
        color: stageColors[stage.color] ?? '#94A3B8',
      }))
      .filter((stage) => stage.value > 0);
  }, [deals]);

  const topSalesUsers = useMemo<TopSalesUser[]>(() => {
    const grouped = deals.reduce<Record<string, { name: string; won: number; total: number; value: number }>>((acc, deal) => {
      const owners = deal.owner.split(',').map((owner) => owner.trim()).filter(Boolean);
      const names = owners.length > 0 ? owners : ['Belirtilmedi'];

      names.forEach((name) => {
        acc[name] ??= { name, won: 0, total: 0, value: 0 };
        acc[name].total += 1;
        acc[name].value += deal.valueAmount;
        if (isWonDeal(deal)) acc[name].won += 1;
      });

      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((user) => ({
        name: user.name,
        won: user.won,
        value: formatCurrency(user.value),
        rate: `${user.total > 0 ? Math.round((user.won / user.total) * 100) : 0}%`,
      }));
  }, [deals]);

  const recentActivities = useMemo(() => {
    return activities
      .filter((activity) => activity.status === 'completed')
      .slice(0, 5)
      .map((activity) => ({
        type: activity.type,
        user: activity.user,
        company: activity.company || activity.subject || '-',
        time: getActivityTimeLabel(activity),
      }));
  }, [activities]);

  const hasPipelineData = pipelineData.some((item) => item.value > 0);

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
            <p className="text-sm text-slate-400">Tekrar hos geldiniz, pipeline ozetiniz burada.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-white">Sistem Yoneticisi</span>
              <span className="text-xs text-slate-400">admin@company.com</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold">
              SA
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <StatCard title="Toplam Pipeline" value={formatCurrency(totalPipeline)} subValue={`${openDeals.length} acik deal`} icon={Layers} color="blue" />
            <StatCard title="Kazanilan Deal" value={formatCurrency(wonValue)} subValue={`${wonDeals.length} deal`} icon={Award} color="emerald" />
            <StatCard title="Kaybedilen Deal" value={formatCurrency(lostValue)} subValue={`${lostDeals.length} deal`} icon={TrendingUp} color="rose" />
            <StatCard title="Toplam Kapasite" value={`${Number(totalCapacity.toFixed(2))} MW`} icon={Activity} color="orange" />
            <StatCard title="Acik Deal" value={String(openDeals.length)} icon={BarChart3} color="slate" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[32px] min-w-0">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-white">Pipeline Trendi</h3>
                <select
                  value={trendRange}
                  onChange={(event) => {
                    const value = event.target.value;
                    setTrendRange(value === 'all' ? 'all' : Number(value) as TrendRange);
                  }}
                  className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-border-subtle outline-none"
                >
                  <option value={1}>Son 1 Ay</option>
                  <option value={3}>Son 3 Ay</option>
                  <option value={6}>Son 6 Ay</option>
                  <option value={12}>Son 1 Yil</option>
                  <option value="all">Hepsi</option>
                </select>
              </div>
              <div className="h-[350px] min-w-0">
                {chartsReady && hasPipelineData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pipelineData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `$${Number(v) / 1000}k`} />
                      <Tooltip
                        contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#F8FAFC' }}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Area type="monotone" dataKey="value" name="Pipeline" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full rounded-3xl border border-dashed border-border-subtle bg-slate-900/30 flex items-center justify-center text-sm text-slate-500">
                    Pipeline trendi icin deal verisi bekleniyor.
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-[32px] min-w-0">
              <h3 className="text-lg font-semibold text-white mb-8">Aşama Dağılımı</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-[350px]">
                <div className="h-full min-w-0">
                  {chartsReady && stageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stageData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                          {stageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full rounded-3xl border border-dashed border-border-subtle bg-slate-900/30 flex items-center justify-center text-sm text-slate-500">
                      Aşama dağılımı için deal verisi yok.
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {stageData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-400 text-sm">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 glass p-8 rounded-[32px]">
              <h3 className="text-lg font-semibold text-white mb-6">En Aktif Satış Kullanıcıları</h3>
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Kullanıcı</th>
                    <th>Kazanılan Deal</th>
                    <th>Pipeline Değeri</th>
                    <th>Kazanma Oranı</th>
                  </tr>
                </thead>
                <tbody>
                  {topSalesUsers.map((user) => (
                    <tr key={user.name}>
                      <td className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        {user.name}
                      </td>
                      <td className="text-white font-medium">{user.won}</td>
                      <td className="text-blue-400 font-medium">{user.value}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden w-24">
                            <div className="h-full bg-blue-500" style={{ width: user.rate }} />
                          </div>
                          <span className="text-xs text-slate-400">{user.rate}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {topSalesUsers.length === 0 && (
                <div className="border-t border-border-subtle p-8 text-center text-sm text-slate-500">
                  Satış kullanıcısı tablosu için deal verisi bekleniyor.
                </div>
              )}
            </div>

            <div className="glass p-8 rounded-[32px]">
              <h3 className="text-lg font-semibold text-white mb-6">Son Aktiviteler</h3>
              <div className="space-y-6">
                {recentActivities.map((act, i) => (
                  <div key={`${act.user}-${act.time}-${i}`} className="flex gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                    <div>
                      <p className="text-sm text-slate-200">
                        <span className="font-semibold text-blue-400">{act.user}</span>, <span className="text-white font-medium">{act.company}</span> ile <span className="text-white font-medium">{act.type}</span> aktivitesini tamamladi
                      </p>
                      <span className="text-xs text-slate-500">{act.time}</span>
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border-subtle bg-slate-900/30 p-4 text-sm text-slate-500">
                    Henüz tamamlanan aktivite yok.
                  </p>
                )}
              </div>
              <button className="w-full mt-8 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors border border-border-subtle rounded-xl hover:bg-slate-800">
                Tüm Aktiviteleri Gör
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
