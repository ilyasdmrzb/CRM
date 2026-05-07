"use client";

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Award, 
  Activity, 
  Layers 
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
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Sidebar from '@/components/layout/Sidebar';

const mockPipelineData: { name: string; value: number; weighted: number }[] = [];

const mockStageData: { name: string; value: number; color: string }[] = [];

const topSalesUsers: { name: string; won: number; value: string; rate: string }[] = [];
const recentActivities: { type: string; user: string; company: string; time: string }[] = [];

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
            <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
            <p className="text-sm text-slate-400">Tekrar hoş geldiniz, pipeline özetiniz burada.</p>
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
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard title="Toplam Pipeline" value="$0" icon={Layers} color="blue" />
            <StatCard title="Ağırlıklı" value="$0" icon={Target} color="purple" />
            <StatCard title="Kazanılan Deal" value="$0" icon={Award} color="emerald" />
            <StatCard title="Kaybedilen Deal" value="$0" icon={TrendingUp} color="rose" />
            <StatCard title="Toplam Kapasite" value="0 MW" icon={Activity} color="orange" />
            <StatCard title="Açık Deal" value="0" icon={BarChart3} color="slate" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[32px] min-w-0">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-white">Pipeline Trendi</h3>
                <select className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-border-subtle outline-none">
                  <option>Son 6 Ay</option>
                  <option>Geçen Yıl</option>
                </select>
              </div>
              <div className="h-[350px] min-w-0">
                {chartsReady && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockPipelineData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#F8FAFC' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-[32px] min-w-0">
              <h3 className="text-lg font-semibold text-white mb-8">Aşama Dağılımı</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-[350px]">
                <div className="h-full min-w-0">
                  {chartsReady && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                        data={mockStageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockStageData.map((entry, index) => (
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
                  {mockStageData.map((item) => (
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

          {/* Top Sales Users & Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 glass p-8 rounded-[32px]">
              <h3 className="text-lg font-semibold text-white mb-6">En İyi Satış Kullanıcıları</h3>
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
                          {user.name.split(' ').map(n => n[0]).join('')}
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
            </div>

            <div className="glass p-8 rounded-[32px]">
              <h3 className="text-lg font-semibold text-white mb-6">Son Aktiviteler</h3>
              <div className="space-y-6">
                {recentActivities.map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                    <div>
                      <p className="text-sm text-slate-200">
                        <span className="font-semibold text-blue-400">{act.user}</span>, <span className="text-white font-medium">{act.company}</span> ile <span className="text-white font-medium">{act.type}</span> aktivitesini tamamladı
                      </p>
                      <span className="text-xs text-slate-500">{act.time}</span>
                    </div>
                  </div>
                ))}
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
