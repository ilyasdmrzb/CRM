"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
  Video,
  Users,
  CheckCircle2,
  Circle,
  FileText,
  Activity
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { getActivitiesFromDb, markActivityCompletedInDb, type ActivityItem } from '@/lib/activities';
import { getCustomerByIdFromDb, type CustomerListItem } from '@/lib/customers';
import toast from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getActivityIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('arama') || t.includes('call')) return <Phone className="w-5 h-5" />;
  if (t.includes('mail') || t.includes('e-posta')) return <Mail className="w-5 h-5" />;
  if (t.includes('toplantı') || t.includes('meeting')) return <Users className="w-5 h-5" />;
  if (t.includes('video') || t.includes('online')) return <Video className="w-5 h-5" />;
  return <Activity className="w-5 h-5" />;
};

export default function CustomerActivitiesPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerListItem | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerData, activitiesData] = await Promise.all([
          getCustomerByIdFromDb(params.id),
          getActivitiesFromDb()
        ]);
        
        setCustomer(customerData);
        
        const customerName = customerData?.name.trim().toLocaleLowerCase('tr-TR');
        const filteredActivities = activitiesData.filter(
          (activity) => activity.company.trim().toLocaleLowerCase('tr-TR') === customerName
        );
        
        // Sort activities by date (newest first)
        filteredActivities.sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt).getTime();
          const dateB = new Date(b.date || b.createdAt).getTime();
          return dateB - dateA;
        });
        
        setActivities(filteredActivities);
      } catch (error) {
        toast.error('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);

  const handleMarkAsCompleted = async (id: string) => {
    try {
      await markActivityCompletedInDb(id);
      setActivities(activities.map(a => a.id === id ? { ...a, status: 'completed', isCompleted: true } : a));
      toast.success('Aktivite tamamlandı olarak işaretlendi.');
    } catch (error) {
      toast.error('İşlem başarısız oldu.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-main-bg">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[80px] lg:ml-[260px] sidebar-transition min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex min-h-screen bg-main-bg">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[80px] lg:ml-[260px] sidebar-transition min-h-screen p-8">
          <div className="glass rounded-[32px] border border-border-subtle p-8 text-center max-w-md mx-auto mt-20">
            <h1 className="text-xl font-bold text-white mb-2">Müşteri bulunamadı</h1>
            <p className="text-sm text-slate-400 mb-6">Müşteri kaydı silinmiş veya bulunamadı.</p>
            <Link href="/customers">
              <button className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                Müşterilere Dön
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const completedActivities = activities.filter(a => a.status === 'completed');
  const pendingActivities = activities.filter(a => a.status !== 'completed');

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 min-h-screen ml-0 md:ml-[80px] lg:ml-[260px] sidebar-transition w-full max-w-full overflow-x-hidden">
        <header className="h-auto min-h-[5rem] border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40 gap-4">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <Link href="/customers">
              <button className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="h-6 w-px bg-border-subtle hidden xs:block" />
            <div className="overflow-hidden">
              <h1 className="text-lg md:text-2xl font-bold text-white truncate">{customer.name}</h1>
              <p className="text-[10px] md:text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                <FileText className="w-3.5 h-3.5" />
                Aktivite Geçmişi ve Planlar
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2 rounded-xl border border-border-subtle text-xs font-medium text-slate-300">
              Toplam <span className="text-white font-bold">{activities.length}</span> aktivite
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {activities.length === 0 ? (
            <div className="glass rounded-[32px] border border-dashed border-border-subtle p-12 text-center max-w-2xl mx-auto mt-10">
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Henüz Aktivite Yok</h3>
              <p className="text-sm text-slate-400">Bu müşteri ile henüz kaydedilmiş bir aktivite veya planlanmış bir görüşme bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
              
              {/* Bekleyen Aktiviteler */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <h2 className="text-lg font-bold text-white">Bekleyen Aktiviteler</h2>
                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {pendingActivities.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {pendingActivities.length === 0 ? (
                    <p className="text-sm text-slate-500 italic p-4 glass rounded-2xl border border-border-subtle">
                      Bekleyen aktivite bulunmuyor.
                    </p>
                  ) : (
                    pendingActivities.map((activity) => (
                      <div key={activity.id} className="group glass rounded-2xl border border-border-subtle p-5 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/50 group-hover:bg-amber-400 transition-colors" />
                        
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                              {getActivityIcon(activity.type)}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                                  {activity.type}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {activity.date ? new Date(activity.date).toLocaleDateString('tr-TR') : new Date(activity.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                {activity.time && (
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {activity.time}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-semibold text-white mb-1 mt-2">{activity.subject || 'Konu belirtilmemiş'}</h3>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-3">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-slate-300 font-medium">Sorumlu:</span> {activity.user}
                              </p>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleMarkAsCompleted(activity.id)}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all flex flex-col items-center gap-1"
                            title="Tamamlandı Olarak İşaretle"
                          >
                            <Circle className="w-6 h-6" />
                            <span className="text-[10px]">Tamamla</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Tamamlanan Aktiviteler */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h2 className="text-lg font-bold text-white">Geçmiş Aktiviteler</h2>
                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {completedActivities.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {completedActivities.length === 0 ? (
                    <p className="text-sm text-slate-500 italic p-4 glass rounded-2xl border border-border-subtle">
                      Geçmiş aktivite bulunmuyor.
                    </p>
                  ) : (
                    completedActivities.map((activity) => (
                      <div key={activity.id} className="glass rounded-2xl border border-border-subtle p-5 opacity-75 hover:opacity-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50" />
                        
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              {getActivityIcon(activity.type)}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                                  {activity.type}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {activity.date ? new Date(activity.date).toLocaleDateString('tr-TR') : new Date(activity.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                {activity.time && (
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {activity.time}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-semibold text-slate-200 mb-1 mt-2 line-through decoration-slate-600">{activity.subject || 'Konu belirtilmemiş'}</h3>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-3">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-slate-400 font-medium">Sorumlu:</span> {activity.user}
                              </p>
                            </div>
                          </div>

                          <div className="p-2 text-emerald-500 flex flex-col items-center gap-1">
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="text-[10px]">Tamamlandı</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
