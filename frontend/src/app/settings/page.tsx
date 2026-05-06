"use client";

import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit2,
  Lock,
  GitBranch,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'stages'>('users');

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-slate-400">Çalışma alanınızı yapılandırın ve kullanıcı yetkilerini yönetin.</p>
          </div>
        </header>

        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar for Settings Sections */}
            <div className="w-full lg:w-64 flex flex-col gap-2">
              {[
                { id: 'users', label: 'Kullanıcı Yönetimi', icon: Users },
                { id: 'roles', label: 'Roller ve Yetkiler', icon: ShieldCheck },
                { id: 'stages', label: 'Pipeline Aşamaları', icon: GitBranch },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                    activeTab === tab.id 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 space-y-8">
              {activeTab === 'users' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Platform Kullanıcıları</h3>
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium border border-border-subtle flex items-center gap-2 transition-all">
                      <Plus className="w-4 h-4" /> Yeni Kullanıcı Ekle
                    </button>
                  </div>

                  <div className="glass rounded-3xl border border-border-subtle overflow-hidden">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Ad Soyad</th>
                          <th>E-posta Adresi</th>
                          <th>Rol</th>
                          <th>Durum</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Sistem Yöneticisi', email: 'admin@company.com', role: 'Admin', status: 'Aktif' },
                          { name: 'Gamze Kılınç', email: 'gamze@company.com', role: 'Sales', status: 'Aktif' },
                          { name: 'John Doe', email: 'john@company.com', role: 'Manager', status: 'Aktif' },
                          { name: 'Sarah Connor', email: 'sarah@company.com', role: 'Sales', status: 'Pasif' },
                        ].map((user, i) => (
                          <tr key={i}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-white font-medium">{user.name}</span>
                              </div>
                            </td>
                            <td className="text-slate-400 text-sm">{user.email}</td>
                            <td>
                              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Aktif' ? "bg-emerald-500" : "bg-slate-500")} />
                                <span className="text-xs text-slate-300">{user.status}</span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-500 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button className="p-2 text-slate-500 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'stages' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Satış Pipeline Aşamaları</h3>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" /> Değişiklikleri Kaydet
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'Potansiyel', prob: 10, color: '#94A3B8' },
                      { name: 'Yeterlilik', prob: 25, color: '#6366F1' },
                      { name: 'Teklif', prob: 40, color: '#3B82F6' },
                      { name: 'Müzakere', prob: 65, color: '#F59E0B' },
                      { name: 'Taahhüt', prob: 85, color: '#A855F7' },
                      { name: 'Kazanıldı', prob: 100, color: '#10B981' },
                      { name: 'Kaybedildi', prob: 0, color: '#EF4444' },
                    ].map((stage, i) => (
                      <div key={i} className="glass p-4 rounded-2xl border border-border-subtle flex items-center gap-6 group">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm">
                          {i + 1}
                        </div>
                        <div className="flex-1 flex items-center gap-4">
                          <input 
                            type="text" 
                            defaultValue={stage.name} 
                            className="bg-transparent text-white font-medium border-none outline-none focus:text-blue-400 transition-colors w-48" 
                          />
                          <div className="h-1 w-full bg-slate-800 rounded-full flex-1 max-w-xs relative">
                            <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full" style={{ width: `${stage.prob}%` }} />
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              defaultValue={stage.prob} 
                              className="bg-slate-900 border border-border-subtle rounded-lg py-1 px-3 text-xs text-blue-400 w-16 text-center focus:ring-1 focus:ring-blue-500 outline-none" 
                            />
                            <span className="text-[10px] text-slate-500 font-bold">%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4" /></button>
                          <button className="p-2 text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-4 border border-dashed border-border-subtle rounded-2xl text-slate-500 hover:text-white hover:border-slate-400 transition-all text-sm font-medium flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Yeni Aşama Ekle
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
