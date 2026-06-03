"use client";

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BarChart as BarChartIcon,
  Layers,
  TrendingUp,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import { getActivitiesFromDb, type ActivityItem } from '@/lib/activities';
import { dealStages, getDealsFromDb, type DealItem } from '@/lib/deals';
import { getCurrentUser, refreshCurrentUser, type AuthUser } from '@/lib/auth';
import { getAdminUsers, type AdminUser } from '@/lib/admin-users';

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
    className="glass p-3 md:p-6 rounded-xl md:rounded-3xl relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 -mr-6 md:-mr-8 -mt-6 md:-mt-8 rounded-full opacity-10 bg-${color}-500`} />
    <div className="flex justify-between items-start mb-3 md:mb-4">
      <div className={`p-1.5 md:p-3 rounded-lg md:rounded-2xl bg-${color}-500/10 border border-${color}-500/20`}>
        <Icon className={`w-4 h-4 md:w-6 md:h-6 text-${color}-500`} />
      </div>
      {trend && (
        <span className={`text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="space-y-0.5 md:space-y-1">
      <h3 className="text-slate-400 text-[10px] md:text-sm font-medium">{title}</h3>
      <p className="text-sm md:text-2xl font-bold text-white truncate">{value}</p>
      {subValue && <p className="text-[9px] md:text-xs text-slate-500">{subValue}</p>}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [chartsReady, setChartsReady] = useState(false);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trendRange, setTrendRange] = useState<TrendRange>(6);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    user: 'all',
    city: 'all',
    sector: 'all',
    customer: 'all'
  });

  useEffect(() => {
    getDealsFromDb().then(setDeals).catch(() => setDeals([]));
    getActivitiesFromDb().then(setActivities).catch(() => setActivities([]));
    getAdminUsers().then(setUsers).catch(() => setUsers([]));
    setUser(getCurrentUser());
    refreshCurrentUser().then(setUser).catch(() => setUser(getCurrentUser()));
  }, []);

  const displayName = user?.fullName?.trim() || 'Kullanıcı';
  const displayEmail = user?.email?.trim() || 'Profil e-postası yok';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'K';

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      if (filters.startDate && deal.createdAt < filters.startDate) return false;
      if (filters.endDate && deal.createdAt > filters.endDate) return false;
      if (filters.user !== 'all' && !deal.owner.includes(filters.user)) return false;
      if (filters.city !== 'all' && deal.city !== filters.city) return false;
      if (filters.customer !== 'all' && deal.company !== filters.customer) return false;
      // Note: sector is not in deal currently, would need to join with customer data
      return true;
    });
  }, [deals, filters]);

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      if (filters.user !== 'all' && act.user !== filters.user) return false;
      if (filters.customer !== 'all' && act.company !== filters.customer) return false;
      return true;
    });
  }, [activities, filters]);

  const openDeals = useMemo(() => filteredDeals.filter(isOpenDeal), [filteredDeals]);
  const wonDeals = useMemo(() => filteredDeals.filter(isWonDeal), [filteredDeals]);
  const lostDeals = useMemo(() => filteredDeals.filter(isLostDeal), [filteredDeals]);

  const totalPipeline = openDeals.reduce((total, deal) => total + deal.valueAmount, 0);
  const wonValue = wonDeals.reduce((total, deal) => total + deal.valueAmount, 0);
  const lostValue = lostDeals.reduce((total, deal) => total + deal.valueAmount, 0);
  const totalCapacity = openDeals.reduce((total, deal) => total + (deal.capacityMw ?? 0), 0);

  const winRate = useMemo(() => {
    const closedCount = wonDeals.length + lostDeals.length;
    return closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;
  }, [wonDeals, lostDeals]);

  const averageDealValue = useMemo(() => {
    return wonDeals.length > 0 ? Math.round(wonValue / wonDeals.length) : 0;
  }, [wonDeals, wonValue]);

  const averageClosingTime = useMemo(() => {
    const closedDeals = [...wonDeals, ...lostDeals];
    if (closedDeals.length === 0) return 0;
    
    const totalDays = closedDeals.reduce((acc, deal) => {
      const created = new Date(deal.createdAt).getTime();
      const closed = deal.closedDate ? new Date(deal.closedDate).getTime() : new Date().getTime();
      return acc + (closed - created) / (1000 * 60 * 60 * 24);
    }, 0);
    
    return Math.round(totalDays / closedDeals.length);
  }, [wonDeals, lostDeals]);

  const pipelineData = useMemo<PipelineData[]>(() => {
    const now = new Date();
    const range = trendRange === 'all'
      ? Math.max(
          1,
          ...filteredDeals.map((deal) => {
            const created = new Date(deal.createdAt);
            if (Number.isNaN(created.getTime())) return 1;

            return (now.getFullYear() - created.getFullYear()) * 12 + now.getMonth() - created.getMonth() + 1;
          })
        )
      : trendRange;

    return Array.from({ length: range }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (range - 1 - index), 1);
      const monthDeals = filteredDeals.filter((deal) => {
        const created = new Date(deal.createdAt);
        return created.getFullYear() === month.getFullYear() && created.getMonth() === month.getMonth();
      });

      return {
        name: monthLabel(month),
        value: monthDeals.reduce((total, deal) => total + deal.valueAmount, 0),
      };
    });
  }, [filteredDeals, trendRange]);

  const wonLostData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const mWon = filteredDeals.filter(d => isWonDeal(d) && d.closedDate && new Date(d.closedDate).getMonth() === month.getMonth() && new Date(d.closedDate).getFullYear() === month.getFullYear());
      const mLost = filteredDeals.filter(d => isLostDeal(d) && d.closedDate && new Date(d.closedDate).getMonth() === month.getMonth() && new Date(d.closedDate).getFullYear() === month.getFullYear());
      
      return {
        name: monthLabel(month),
        won: mWon.length,
        lost: mLost.length,
      };
    });
  }, [filteredDeals]);

  const stageData = useMemo<StageData[]>(() => {
    return dealStages
      .map((stage) => ({
        name: stage.name,
        value: filteredDeals.filter((deal) => deal.stage === stage.name).length,
        color: stageColors[stage.color] ?? '#94A3B8',
      }))
      .filter((stage) => stage.value > 0);
  }, [filteredDeals]);

  const topSalesUsers = useMemo<TopSalesUser[]>(() => {
    const grouped = filteredDeals.reduce<Record<string, { name: string; won: number; total: number; value: number }>>((acc, deal) => {
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
  }, [filteredDeals]);

  const recentActivities = useMemo(() => {
    return filteredActivities
      .filter((activity) => activity.status === 'completed')
      .slice(0, 5)
      .map((activity) => ({
        type: activity.type,
        user: activity.user,
        company: activity.company || activity.subject || '-',
        time: getActivityTimeLabel(activity),
      }));
  }, [filteredActivities]);

  const isWithinCurrentWeek = (dateStr: string | null | undefined) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return false;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate start of current week (Monday)
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    return date >= startOfWeek && date < endOfWeek;
  };

  const weeklyActivities = useMemo(() => {
    const thisWeekActs = activities.filter(act => {
      if (filters.customer !== 'all' && act.company !== filters.customer) return false;
      return isWithinCurrentWeek(act.completedAt || act.createdAt || act.date);
    });

    return users.map(u => {
      const uActs = thisWeekActs.filter(act => act.user.toLowerCase() === u.fullName.toLowerCase());
      
      const breakdown = uActs.reduce<Record<string, number>>((acc, act) => {
        const type = act.type || 'Diğer';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        userId: u.id,
        userName: u.fullName,
        initials: u.initials,
        total: uActs.length,
        breakdown,
      };
    }).sort((a, b) => b.total - a.total);
  }, [activities, users, filters.customer]);

  const hasPipelineData = pipelineData.some((item) => item.value > 0);

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 min-h-screen ml-0 md:ml-[80px] lg:ml-[260px] sidebar-transition w-full max-w-full overflow-x-hidden">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-4 md:px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="ml-12 md:ml-0">
            <h1 className="text-xl md:text-2xl font-bold text-white">Sales Dashboard</h1>
            <p className="text-xs md:text-sm text-slate-400 hidden sm:block">Tekrar hoş geldiniz, pipeline özetiniz burada.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/reports">
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-border-subtle text-slate-300 hover:text-white transition-all text-[10px] md:text-xs font-bold">
                <BarChartIcon className="w-4 h-4 text-orange-500" />
                <span className="hidden sm:inline">Detaylı Raporlar</span>
              </button>
            </Link>
            <div className="hidden md:flex bg-slate-800 p-1 px-3 rounded-xl border border-border-subtle flex-col">
              <span className="text-sm font-medium text-white leading-tight">{displayName}</span>
              <span className="text-[10px] text-slate-400">{displayEmail}</span>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-sm">
              {initials}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Filters Bar */}
          <div className="glass p-6 rounded-[32px] flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Tarih Aralığı</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-slate-900 border border-border-subtle rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <span className="text-slate-600">-</span>
                <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-slate-900 border border-border-subtle rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Satış Sorumlusu</label>
              <select 
                value={filters.user}
                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                className="bg-slate-900 border border-border-subtle rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[150px]"
              >
                <option value="all">Tüm Ekip</option>
                {Array.from(new Set(deals.map(d => d.owner))).map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Şehir</label>
              <select 
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                className="bg-slate-900 border border-border-subtle rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">Tüm Şehirler</option>
                {Array.from(new Set(deals.map(d => d.city))).filter(Boolean).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Müşteri</label>
              <select 
                value={filters.customer}
                onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                className="bg-slate-900 border border-border-subtle rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[150px]"
              >
                <option value="all">Tüm Müşteriler</option>
                {Array.from(new Set(deals.map(d => d.company))).map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => {
                if (confirm('Tüm yerel veriler temizlenecek. Emin misiniz?')) {
                  alert('Veriler artık localStorage yerine database üzerinde tutuluyor.');
                  window.location.reload();
                }
              }}
              className="ml-2 text-xs text-rose-500 hover:text-rose-400 transition-colors mb-2 mr-2"
            >
              Yerel Verileri Sıfırla
            </button>

            <button 
              onClick={() => setFilters({ startDate: '', endDate: '', user: 'all', city: 'all', sector: 'all', customer: 'all' })}
              className="ml-auto text-xs text-slate-500 hover:text-white transition-colors mb-2 mr-2"
            >
              Filtreleri Temizle
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <StatCard title="Pipeline" value={formatCurrency(totalPipeline)} subValue={`${openDeals.length} açık`} icon={Layers} color="blue" />
            <StatCard title="Kazanılan" value={formatCurrency(wonValue)} subValue={`${wonDeals.length} deal`} icon={Award} color="emerald" />
            <StatCard title="Kaybedilen" value={formatCurrency(lostValue)} subValue={`${lostDeals.length} deal`} icon={XCircle} color="rose" />
            <StatCard title="Kapasite" value={`${Number(totalCapacity.toFixed(1))} MW`} icon={Activity} color="orange" />
            <StatCard title="Açık Deal" value={String(openDeals.length)} icon={BarChartIcon} color="slate" />
            <StatCard title="Kazanma Oranı" value={`%${winRate}`} icon={TrendingUp} color="indigo" />
            <StatCard title="Ort. Deal Değeri" value={formatCurrency(averageDealValue)} icon={DollarSign} color="purple" />
            <StatCard title="Kapanma Süresi" value={`${averageClosingTime} Gün`} icon={Clock} color="rose" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-4 md:p-8 rounded-[24px] md:rounded-[32px] min-w-0">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-white">Satış Performansı (Kazanılan/Kaybedilen)</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Kazanılan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Kaybedilen</span>
                  </div>
                </div>
              </div>
              <div className="h-[280px] md:h-[350px] min-w-0">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wonLostData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#F8FAFC' }}
                      />
                      <Bar dataKey="won" name="Kazanılan" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="lost" name="Kaybedilen" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full rounded-3xl border border-dashed border-border-subtle bg-slate-900/30 flex items-center justify-center text-sm text-slate-500">
                    Grafik yükleniyor...
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-4 md:p-8 rounded-[24px] md:rounded-[32px] min-w-0">
              <h3 className="text-lg font-semibold text-white mb-8">Aşama Dağılımı</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center h-auto md:h-[350px]">
                <div className="h-[280px] min-w-0 md:h-full">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-4 md:p-8 rounded-[24px] md:rounded-[32px]">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Bugün Yapılacaklar</h3>
                <span className="ml-auto bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-full border border-indigo-500/20">
                  {activities.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'planned').length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities
                  .filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'planned')
                  .slice(0, 4)
                  .map((act, i) => (
                  <div key={i} className="group p-4 rounded-2xl bg-slate-900/30 border border-border-subtle hover:border-indigo-500/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{act.type}</span>
                      <span className="text-[10px] text-slate-500">{act.time}</span>
                    </div>
                    <p className="text-sm font-medium text-white mb-1 truncate">{act.subject}</p>
                    <p className="text-xs text-slate-400 truncate">{act.company}</p>
                  </div>
                ))}
                {activities.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'planned').length === 0 && (
                  <div className="col-span-full py-8 text-center border border-dashed border-border-subtle rounded-2xl">
                    <p className="text-sm text-slate-500">Bugün için planlanmış aksiyon yok.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-4 md:p-8 rounded-[24px] md:rounded-[32px]">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-semibold text-white">Geciken Aktiviteler</h3>
                <span className="ml-auto bg-rose-500/10 text-rose-400 text-xs px-2 py-1 rounded-full border border-rose-500/20">
                  {activities.filter(a => a.date < new Date().toISOString().split('T')[0] && a.status === 'planned').length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities
                  .filter(a => a.date < new Date().toISOString().split('T')[0] && a.status === 'planned')
                  .slice(0, 4)
                  .map((act, i) => (
                  <div key={i} className="group p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">{act.type}</span>
                      <span className="text-[10px] text-rose-400/60">{act.date}</span>
                    </div>
                    <p className="text-sm font-medium text-white mb-1 truncate">{act.subject}</p>
                    <p className="text-xs text-slate-400 truncate">{act.company}</p>
                  </div>
                ))}
                {activities.filter(a => a.date < new Date().toISOString().split('T')[0] && a.status === 'planned').length === 0 && (
                  <div className="col-span-full py-8 text-center border border-dashed border-border-subtle rounded-2xl">
                    <p className="text-sm text-slate-500">Geciken aktivite bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 glass p-4 md:p-8 rounded-[24px] md:rounded-[32px]">
              <h3 className="text-lg font-semibold text-white mb-6">Haftalık Satış Sorumlusu Aktifliği</h3>
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Satış Sorumlusu</th>
                    <th>Toplam Güncelleme</th>
                    <th>Haftalık Aktivite Detayı</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyActivities.map((wUser) => (
                    <tr key={wUser.userId}>
                      <td className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-500">
                          {wUser.initials}
                        </div>
                        <span className="text-sm font-medium text-white">{wUser.userName}</span>
                      </td>
                      <td>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          {wUser.total} güncelleme
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(wUser.breakdown).map(([type, count]) => (
                            <span 
                              key={type}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                type === 'Toplantı' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' :
                                type === 'Ziyaret' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                                type === 'Fiyat Güncellemesi' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                                type === 'Yeni Müşteri Ekleme' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                type === 'Arama' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                                type === 'Not Ekleme' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' :
                                'bg-slate-500/10 border border-slate-500/20 text-slate-400'
                              }`}
                            >
                              {count} {type}
                            </span>
                          ))}
                          {wUser.total === 0 && (
                            <span className="text-xs text-slate-500 italic">Bu hafta güncelleme yok</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {weeklyActivities.length === 0 && (
                <div className="border-t border-border-subtle p-8 text-center text-sm text-slate-500">
                  Satış kullanıcısı tablosu için aktivite verisi bekleniyor.
                </div>
              )}
            </div>

            <div className="glass p-4 md:p-8 rounded-[24px] md:rounded-[32px]">
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 glass p-4 md:p-8 rounded-[24px] md:rounded-[32px]">
              <h3 className="text-lg font-semibold text-white mb-6">Satış Performansı (Kazanılan/Ciro)</h3>
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
          </div>
        </div>
      </main>
    </div>
  );
}





