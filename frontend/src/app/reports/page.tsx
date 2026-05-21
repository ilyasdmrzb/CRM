"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  BarChart as BarChartIcon, 
  Download, 
  FileSpreadsheet, 
  Users, 
  Trophy, 
  TrendingUp, 
  Target,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import { getDealsFromDb, type DealItem, dealStages } from '@/lib/deals';
import { getCustomersFromDb } from '@/lib/customers';
import { getAdminUsers } from '@/lib/admin-users';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E', '#6366F1', '#94A3B8'];

const exportToExcel = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  
  // Create HTML table for Excel with styling
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"></head>
    <body>
      <table border="1">
        <tr style="background-color: #1e3a8a; color: #ffffff; font-weight: bold;">
          ${headers.map(h => `<th style="padding: 8px;">${h}</th>`).join('')}
        </tr>
        ${data.map(row => `
          <tr>
            ${headers.map(h => {
              const val = row[h] ?? '';
              const isNumeric = typeof val === 'number' && !isNaN(val);
              // mso-number-format:"@" forces text
              // mso-number-format:"Fixed" or standard masks for numbers
              const style = isNumeric ? 'mso-number-format:"\\#\\,\\#\\#0\\.00"' : 'mso-number-format:"\\@"';
              const typeAttr = isNumeric ? 'x:num' : 'x:str';
              return `<td ${typeAttr} style="padding: 4px; ${style}">${String(val).replace(/[\n\r]+/g, '<br>')}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ReportsPage() {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sales' | 'pipeline' | 'winloss' | 'customers'>('sales');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      setDeals(await getDealsFromDb());
      setCustomers(await getCustomersFromDb());
      try {
        const adminUsers = await getAdminUsers();
        setUsers(adminUsers);
      } catch (error) {
        console.error("Failed to fetch admin users:", error);
        setUsers([]);
      }
    };
    loadData();
  }, []);

  // Performance Data
  const salesPerformance = useMemo(() => {
    const userStats = users.map(user => {
      const userDeals = deals.filter(d => d.owner.includes(user.initials) || d.owner.includes(user.fullName));
      const wonDeals = userDeals.filter(d => d.stage.includes('Kazanıldı'));
      const totalValue = wonDeals.reduce((sum, d) => sum + d.valueAmount, 0);
      const winRate = userDeals.length > 0 ? Math.round((wonDeals.length / userDeals.length) * 100) : 0;

      return {
        name: user.fullName,
        initials: user.initials,
        totalDeals: userDeals.length,
        wonDeals: wonDeals.length,
        totalValue,
        winRate
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
    return userStats;
  }, [deals, users]);

  // Pipeline Data
  const pipelineDistribution = useMemo(() => {
    return dealStages.map(stage => ({
      name: stage.name,
      value: deals.filter(d => d.stage === stage.name).length,
      amount: deals.filter(d => d.stage === stage.name).reduce((sum, d) => sum + d.valueAmount, 0)
    }));
  }, [deals]);

  const handleExportPerformance = () => {
    const data = salesPerformance.map(s => ({
      'Satış Sorumlusu': s.name,
      'Toplam Deal': s.totalDeals,
      'Kazanılan': s.wonDeals,
      'Toplam Ciro ($)': s.totalValue,
      'Başarı Oranı (%)': s.winRate
    }));
    exportToExcel(data, 'satis_performans_raporu');
  };

  const handleExportPipeline = () => {
    const data = deals.map(d => {
      const customer = customers.find(c => c.name === d.company);
      
      return {
        'DEAL ID': d.id,
        'PROJE / HESAP ADI': d.project,
        'SATIŞ SORUMLUSU': d.owner,
        'FİRMA YETKİLİSİ': customer?.contactName || '-',
        'UNVAN': customer?.contactTitle || '-',
        'TELEFON': customer?.phone || '-',
        'ŞEHİR': d.city,
        'KAPASİTE (MW)': d.capacityMw || 0,
        'STAGE': d.stage,
        'OLASILIK (%)': d.probability,
        'JİNKO TEKLİF ($/W)': d.jinkoPrice || 0,
        'HSA TEKLİF ($/W)': d.hsaPrice || 0,
        'DEAL VALUE ($K)': Math.round(d.valueAmount / 1000),
        'W.VALUE ($K)': Math.round((d.valueAmount * d.probability) / 100000),
        'TERMİN': d.deliveryDate || '-',
        'RAKİP': d.competitorName || '-',
        'HEDEF FİYAT ($/W)': d.targetPrice || 0,
        'EPC ORTAĞI': d.epcPartner || '-',
        'GÜNCELLEME': d.currentUpdate || '-',
        'SON TEMAS': d.lastContactDate || '-',
        'GÜNCEL DURUM / NOTLAR': d.noteHistory?.map(n => n.text).join(' | ') || d.notes || '-'
      };
    });
    exportToExcel(data, 'pipeline_raporu');
  };

  const handleExportCustomers = () => {
    const data = customers.map(c => ({
      'Şirket Adı': c.name,
      'Sektör': c.industry || '-',
      'Şehir': c.city || '-',
      'Telefon': c.phone || '-',
      'E-posta': c.email || '-',
      'İlgili Kişi': c.contactName || '-',
      'Sorumlu': c.owner || '-'
    }));
    exportToExcel(data, 'musteri_listesi');
  };

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 min-h-screen ml-0 md:ml-[80px] lg:ml-[260px] sidebar-transition w-full max-w-full overflow-x-hidden relative">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-4 md:px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="ml-12 md:ml-0 overflow-hidden">
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              <span className="truncate">Raporlar & Analiz</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 hidden sm:block">Verilerinizi analiz edin ve dışa aktarın.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-800 p-1 rounded-xl border border-border-subtle">
               {(['sales', 'pipeline', 'customers'] as const).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                     activeTab === tab 
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                       : 'text-slate-400 hover:text-white'
                   }`}
                 >
                   {tab === 'sales' ? 'Satış Performans' : tab === 'pipeline' ? 'Pipeline' : 'Müşteriler'}
                 </button>
               ))}
             </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Export Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: 'Pipeline Export', icon: FileSpreadsheet, action: handleExportPipeline, color: 'blue' },
              { title: 'Müşteri Listesi', icon: Users, action: handleExportCustomers, color: 'emerald' },
              { title: 'Performans Raporu', icon: TrendingUp, action: handleExportPerformance, color: 'orange' },
              { title: 'Kazanılan/Kaybedilen', icon: Trophy, action: handleExportPipeline, color: 'purple' },
            ].map((card, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -4 }}
                onClick={card.action}
                className="glass p-6 rounded-3xl flex flex-col items-center justify-center gap-4 group transition-all hover:border-blue-500/30"
              >
                <div className={`p-4 rounded-2xl bg-${card.color}-500/10 border border-${card.color}-500/20 group-hover:bg-${card.color}-500/20 transition-all`}>
                  <card.icon className={`w-8 h-8 text-${card.color}-500`} />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold">{card.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                  Excel İndir <Download className="w-3 h-3" />
                </p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Visual Reports */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Sales Performance Chart */}
            <div className="glass rounded-[24px] md:rounded-[32px] border border-border-subtle overflow-hidden">
              <div className="p-4 md:p-6 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-white">Satışçı Performansı</h2>
                </div>
                <button onClick={handleExportPerformance} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 md:p-6 h-[300px] md:h-[400px]">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                      <YAxis dataKey="initials" type="category" stroke="#64748b" fontSize={12} width={40} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(val) => `$${Number(val ?? 0).toLocaleString()}`}
                      />
                      <Bar dataKey="totalValue" radius={[0, 4, 4, 0]} name="Toplam Kazanılan Değer">
                        {salesPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pipeline Distribution Chart */}
            <div className="glass rounded-[32px] border border-border-subtle overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-white">Pipeline Dağılımı (Adet)</h2>
                </div>
                <button onClick={handleExportPipeline} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 h-[400px]">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pipelineDistribution.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {pipelineDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Performance Table */}
          <div className="glass rounded-[32px] border border-border-subtle overflow-hidden">
            <div className="p-6 border-b border-border-subtle">
              <h2 className="text-lg font-bold text-white">Performans Detayları</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Satış Sorumlusu</th>
                    <th className="px-6 py-4 font-bold">Toplam Fırsat</th>
                    <th className="px-6 py-4 font-bold">Kazanılan</th>
                    <th className="px-6 py-4 font-bold">Kazanma Oranı</th>
                    <th className="px-6 py-4 font-bold text-right">Toplam Ciro ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {salesPerformance.map((user, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs border border-blue-500/20">
                            {user.initials}
                          </div>
                          <span className="text-sm font-medium text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{user.totalDeals}</td>
                      <td className="px-6 py-4 text-sm text-emerald-500 font-medium">{user.wonDeals}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-20">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${user.winRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">%{user.winRate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-bold text-right">
                        ${user.totalValue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}








