"use client";

import React, { useEffect, useMemo, useState } from 'react';
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
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Trash2,
  TrendingUp,
  FileText,
  UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import { addActivityToDb, getActivitiesFromDb, markActivityCompletedInDb, deleteActivityFromDb, type ActivityItem } from '@/lib/activities';
import { getCustomersFromDb, type CustomerListItem } from '@/lib/customers';
import { getCurrentUser, isCurrentUserAdmin } from '@/lib/auth';

const inputClass = "w-full bg-slate-900/60 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "text-sm font-medium text-slate-300";

const MapPin = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Arama: Phone,
  'Toplantı': Users,
  'E-posta': Mail,
  Ziyaret: MapPin,
  WhatsApp: MessageSquare,
  'Fiyat Güncellemesi': TrendingUp,
  'Not Ekleme': FileText,
  'Yeni Müşteri Ekleme': UserPlus,
  'Fırsat Güncellemesi': Calendar,
};

const typeColors: Record<string, string> = {
  Arama: 'blue',
  'Toplantı': 'purple',
  'E-posta': 'indigo',
  Ziyaret: 'orange',
  WhatsApp: 'emerald',
  'Fiyat Güncellemesi': 'orange',
  'Not Ekleme': 'indigo',
  'Yeni Müşteri Ekleme': 'emerald',
  'Fırsat Güncellemesi': 'purple',
};

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
  orange: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
};

const textColorClasses: Record<string, string> = {
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  indigo: 'text-indigo-500',
  orange: 'text-orange-500',
  emerald: 'text-emerald-500',
};

const getActivityDateTime = (activity: ActivityItem) => {
  if (!activity.date) return null;
  const time = activity.time || '23:59';
  const date = new Date(`${activity.date}T${time}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isActivityOverdue = (activity: ActivityItem) => {
  const date = getActivityDateTime(activity);
  return activity.status === 'planned' && Boolean(date && date.getTime() < Date.now());
};

const formatFullDateTime = (isoString: string | null | undefined) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [activityData, customerData] = await Promise.all([
          getActivitiesFromDb(),
          getCustomersFromDb(),
        ]);

        setActivities(activityData);
        setCustomers(customerData);
      } catch {
        toast.error('Veriler local database üzerinden alınamadı.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');
    if (!query) return activities;

    return activities.filter((activity) => [
      activity.type,
      activity.user,
      activity.company,
      activity.subject,
      activity.date,
    ].some((value) => value.toLocaleLowerCase('tr-TR').includes(query)));
  }, [activities, search]);

  const upcomingCalendar = useMemo(() => {
    return activities
      .filter((activity) => activity.status === 'planned')
      .sort((a, b) => {
        const first = getActivityDateTime(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const second = getActivityDateTime(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return first - second;
      })
      .reduce<Record<string, ActivityItem[]>>((groups, activity) => {
        const dateKey = activity.date || 'Tarihsiz';
        groups[dateKey] = [...(groups[dateKey] ?? []), activity];
        return groups;
      }, {});
  }, [activities]);

  const completedThisWeek = activities.filter((activity) => activity.status === 'completed').length;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const customerId = String(formData.get('customerId') ?? '');
    const selectedCustomer = customers.find((customer) => customer.id === customerId);
    if (!selectedCustomer) {
      setIsSaving(false);
      toast.error('Aktivite eklemek için kayıtlı bir müşteri seçin.');
      return;
    }

    formData.set('company', selectedCustomer.name);
    try {
      const activity = await addActivityToDb(formData);
      setActivities(await getActivitiesFromDb());
      setIsFormOpen(false);
      toast.success(`${activity.type} aktivitesi veritabanına kaydedildi.`);
    } catch {
      toast.error('Aktivite local database içine kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteActivity = async (id: string) => {
    try {
      await markActivityCompletedInDb(id);
      setActivities(await getActivitiesFromDb());
      toast.success('Aktivite tamamlandı olarak işaretlendi.');
    } catch {
      toast.error('Aktivite veritabanında güncellenemedi.');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Bu aktiviteyi silmek istediğinize emin misiniz?')) return;
    try {
      await deleteActivityFromDb(id);
      setActivities(await getActivitiesFromDb());
      toast.success('Aktivite silindi.');
    } catch {
      toast.error('Aktivite silinemedi. Yetkiniz olmayabilir.');
    }
  };
  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="main-content">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-4 md:px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="ml-12 md:ml-0 overflow-hidden">
            <h1 className="text-xl md:text-2xl font-bold text-white">Aktiviteler</h1>
            <p className="text-xs md:text-sm text-slate-400 hidden sm:block">Müşteri etkileşimlerini takip edin.</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-xs md:text-sm"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Aktivite Ekle</span>
          </button>
        </header>

        <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Aktivitelerde ara..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-slate-800/40 border border-border-subtle rounded-xl py-2.5 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <button className="p-2.5 rounded-xl border border-border-subtle text-slate-400 hover:text-white transition-all"><Filter className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {filteredActivities.map((act) => {
                const Icon = typeIcons[act.type] ?? MessageSquare;
                const color = typeColors[act.type] ?? 'blue';
                const isOverdue = isActivityOverdue(act);
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={act.id}
                    className="glass p-4 md:p-6 rounded-3xl border border-border-subtle group hover:border-blue-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6"
                  >
                    <div className={`p-3 md:p-4 rounded-2xl border group-hover:scale-110 transition-transform ${colorClasses[color]}`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${textColorClasses[color]}`}>{act.type}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Kayıt: {formatFullDateTime(act.createdAt)}</span>
                        {act.status === 'planned' && (
                          <span className="text-[10px] text-orange-400 font-bold tracking-tight bg-orange-400/10 px-1.5 py-0.5 rounded">
                            Planlanan: {act.date}, {act.time}
                          </span>
                        )}
                        {act.status === 'completed' && (
                          <span className="text-[10px] text-emerald-400 font-bold tracking-tight bg-emerald-400/10 px-1.5 py-0.5 rounded">
                            Tamamlandı: {formatFullDateTime(act.completedAt)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-white font-semibold text-lg">{act.subject}</h4>
                      <p className="text-sm text-slate-400"><span className="text-white">{act.company}</span> ile • Kaydeden <span className="text-blue-400">{act.user}</span></p>
                    </div>

                    <div className="flex items-center gap-6">
                      {act.status === 'completed' ? (
                        <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Tamamlandı
                        </div>
                      ) : isOverdue ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" /> Süresi Geçti
                          </div>
                          <button
                            onClick={() => handleCompleteActivity(act.id)}
                            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 transition-all"
                          >
                            Tamamlandı olarak işaretle
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-orange-400 text-xs font-medium bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                          <Clock className="w-3 h-3" /> Yaklaşan
                          </div>
                          <button
                            onClick={() => handleCompleteActivity(act.id)}
                            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 transition-all"
                          >
                            Tamamlandı olarak işaretle
                          </button>
                        </div>
                      )}
                      {isCurrentUserAdmin() && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteActivity(act.id); }}
                          className="p-2 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Sil"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      <button className="p-2 text-slate-500 hover:text-white transition-colors">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {filteredActivities.length === 0 && (
                <div className="glass rounded-[32px] border border-border-subtle p-10 text-center">
                  <p className="text-white font-semibold">{isLoading ? 'Aktiviteler yükleniyor' : 'Henüz aktivite yok'}</p>
                  <p className="text-sm text-slate-400 mt-2">
                    {isLoading ? 'Local database kayıtları okunuyor.' : 'İlk görüşme, toplantı veya takip kaydını Aktivite Ekle ile oluşturabilirsiniz.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-[32px] border border-border-subtle">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Yaklaşan Etkinlik Takvimi
              </h3>
              <div className="space-y-4">
                {Object.entries(upcomingCalendar).map(([date, items]) => (
                  <div key={date} className="border-l border-blue-500/30 pl-4">
                    <p className="text-xs font-bold uppercase text-blue-400 mb-3">
                      {date === 'Tarihsiz' ? date : new Date(`${date}T00:00`).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', weekday: 'short' })}
                    </p>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-border-subtle bg-slate-900/40 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">{item.subject}</p>
                              <p className="truncate text-xs text-slate-400">{item.company} - {item.type}</p>
                              <p className="text-[10px] font-bold text-slate-500">{item.time || '-'}</p>
                            </div>
                            <button
                              onClick={() => handleCompleteActivity(item.id)}
                              className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-500 hover:bg-emerald-500/20 transition-all"
                            >
                              Tamamlandı
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(upcomingCalendar).length === 0 && (
                  <p className="text-sm text-slate-500">Takvimde yaklaşan etkinlik bulunmuyor.</p>
                )}
              </div>
            </div>

            <div className="glass p-6 rounded-[32px] border border-border-subtle">
              <h3 className="text-white font-semibold mb-6">Aktivite İstatistikleri</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-border-subtle">
                  <span className="text-2xl font-bold text-white">{completedThisWeek}</span>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Tamamlanan</p>
                </div>
                <div className="text-center p-4 bg-slate-900/50 rounded-2xl border border-border-subtle">
                  <span className="text-2xl font-bold text-emerald-500">{activities.length}</span>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Toplam</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl glass rounded-[32px] border border-border-subtle overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-slate-800/40">
                <div>
                  <h2 className="text-xl font-bold text-white">Yeni Aktivite</h2>
                  <p className="text-sm text-slate-400">Müşteri görüşmesi veya takip görevi oluşturun.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Aktivite Tipi</label>
                  <select className={inputClass} name="type" defaultValue="Arama">
                    <option>Arama</option>
                    <option>Toplantı</option>
                    <option>E-posta</option>
                    <option>Ziyaret</option>
                    <option>WhatsApp</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Durum</label>
                  <select className={inputClass} name="status" defaultValue="completed">
                    <option value="completed">Tamamlandı</option>
                    <option value="planned">Yaklaşan</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Konu</label>
                  <input className={inputClass} name="subject" placeholder="Teklif takibi" required />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Müşteri</label>
                  <select className={inputClass} name="customerId" required disabled={customers.length === 0} defaultValue="">
                    <option value="" disabled>{customers.length === 0 ? 'Kayıtlı müşteri yok' : 'Müşteri seçin'}</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                  <input type="hidden" name="company" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Kaydeden</label>
                  <input className={inputClass} name="user" defaultValue={getCurrentUser()?.fullName || "Sistem Yöneticisi"} required />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Tarih</label>
                  <input className={inputClass} name="date" type="date" required />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Saat</label>
                  <input className={inputClass} name="time" type="time" />
                </div>
              </div>

              <div className="p-6 border-t border-border-subtle flex justify-end gap-3 bg-slate-900/20">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-3 rounded-xl border border-border-subtle text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSaving || customers.length === 0}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Kaydediliyor...' : 'Aktiviteyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}





