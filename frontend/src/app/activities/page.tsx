"use client";

import React from 'react';
import {
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Clock,
  ChevronRight,
  Plus,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';

const activities = [
  { id: 1, type: 'Arama', user: 'Gamze Kılınç', company: 'ABC Solar Energy', subject: 'Faz 2 Takibi', time: '10:30', date: 'Bugün', status: 'completed' },
  { id: 2, type: 'Toplantı', user: 'John Doe', company: 'Z-Tech Industrial', subject: 'Saha İncelemesi', time: '14:00', date: 'Bugün', status: 'pending' },
  { id: 3, type: 'E-posta', user: 'Sarah Connor', company: 'Green Power Systems', subject: 'Teklif Revizyonu', time: 'Dün', date: '14 Mayıs', status: 'completed' },
  { id: 4, type: 'Ziyaret', user: 'Michael Scott', company: 'Blue Sky Energy', subject: 'Sözleşme Müzakeresi', time: 'Dün', date: '14 Mayıs', status: 'completed' },
  { id: 5, type: 'WhatsApp', user: 'Gamze Kılınç', company: 'Eco-Friendly Solutions', subject: 'Hızlı Güncelleme', time: '12 Mayıs', date: '12 Mayıs', status: 'completed' },
];

const MapPin = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const typeIcons: any = {
  Arama: Phone,
  Toplantı: Users,
  'E-posta': Mail,
  Ziyaret: MapPin,
  WhatsApp: MessageSquare,
};

const typeColors: any = {
  Arama: 'blue',
  Toplantı: 'purple',
  'E-posta': 'indigo',
  Ziyaret: 'orange',
  WhatsApp: 'emerald',
};

export default function ActivitiesPage() {
  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">Activity Tracking</h1>
            <p className="text-sm text-slate-400">Tüm etkileşimleri ve planlanan görevleri takip edin.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            <Plus className="w-5 h-5" />
            Aktivite Ekle
          </button>
        </header>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Aktivitelerde ara..." className="w-full bg-slate-800/40 border border-border-subtle rounded-xl py-2.5 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <button className="p-2.5 rounded-xl border border-border-subtle text-slate-400 hover:text-white transition-all"><Filter className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {activities.map((act) => {
                const Icon = typeIcons[act.type];
                const color = typeColors[act.type];
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={act.id}
                    className="glass p-6 rounded-3xl border border-border-subtle group hover:border-blue-500/30 transition-all flex items-center gap-6"
                  >
                    <div className={`p-4 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-500 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-${color}-500`}>{act.type}</span>
                        <span className="text-xs text-slate-500">• {act.date}, {act.time}</span>
                      </div>
                      <h4 className="text-white font-semibold text-lg">{act.subject}</h4>
                      <p className="text-sm text-slate-400"><span className="text-white">{act.company}</span> ile • Kaydeden <span className="text-blue-400">{act.user}</span></p>
                    </div>

                    <div className="flex items-center gap-6">
                      {act.status === 'completed' ? (
                        <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Tamamlandı
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-orange-400 text-xs font-medium bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                          <Clock className="w-3 h-3" /> Yaklaşan
                        </div>
                      )}
                      <button className="p-2 text-slate-500 hover:text-white transition-colors">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-[32px] border border-border-subtle">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Yaklaşan Görevler
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Proje Başlangıcı', date: 'Yarın, 09:00', type: 'Toplantı' },
                  { title: 'Sözleşme Gönder', date: 'Cuma, 14:00', type: 'E-posta' },
                  { title: 'Saha İncelemesi', date: 'Pazartesi, 10:00', type: 'Ziyaret' },
                ].map((task, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/50 border border-border-subtle group hover:bg-slate-800/80 transition-all cursor-pointer">
                    <p className="text-sm text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">{task.title}</p>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 uppercase font-bold">{task.type}</span>
                      <span className="text-blue-500">{task.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 text-sm font-medium text-blue-500 hover:text-blue-400 transition-all">Tüm Takvimi Gör</button>
            </div>

            <div className="glass p-6 rounded-[32px] border border-border-subtle">
              <h3 className="text-white font-semibold mb-6">Aktivite İstatistikleri</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-border-subtle">
                  <span className="text-2xl font-bold text-white">42</span>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Bu Hafta</p>
                </div>
                <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-border-subtle">
                  <span className="text-2xl font-bold text-emerald-500">+15%</span>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Büyüme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
