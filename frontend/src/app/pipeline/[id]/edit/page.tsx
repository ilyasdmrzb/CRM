"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Gauge,
  Save,
  Target,
  User,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { getCustomers, type CustomerListItem } from '@/lib/customers';
import { dealStages, getDealById, type DealItem, updateDeal } from '@/lib/deals';

const inputClass = "w-full bg-slate-900/60 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "text-sm font-medium text-slate-300";
const valueOrEmpty = (value: string | null) => value ?? '';

export default function EditDealPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [deal, setDeal] = useState<DealItem | null>(null);
  const [selectedStage, setSelectedStage] = useState(dealStages[0].name);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const currentDeal = getDealById(params.id);
    setDeal(currentDeal);
    setCustomers(getCustomers());
    if (currentDeal) setSelectedStage(currentDeal.stage);
  }, [params.id]);

  const stageConfig = dealStages.find((stage) => stage.name === selectedStage) ?? dealStages[0];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const updatedDeal = updateDeal(params.id, formData);
    setIsSaving(false);

    if (!updatedDeal) {
      toast.error('Deal bulunamadı.');
      return;
    }

    setDeal(updatedDeal);
    toast.success(`${updatedDeal.id} güncellendi.`);
    router.push('/pipeline');
  };

  if (!deal) {
    return (
      <div className="flex min-h-screen bg-main-bg">
        <Sidebar />
        <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen p-8">
          <div className="glass rounded-[32px] border border-border-subtle p-8">
            <h1 className="text-xl font-bold text-white mb-2">Deal bulunamadı</h1>
            <p className="text-sm text-slate-400 mb-6">Bu deal kaydı silinmiş veya tarayıcı kaydında yok.</p>
            <Link href="/pipeline">
              <button className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold">Pipeline'a Dön</button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link href="/pipeline">
              <button className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="h-6 w-px bg-border-subtle" />
            <div>
              <h1 className="text-2xl font-bold text-white">{deal.id}</h1>
              <p className="text-sm text-slate-400">Deal bilgilerini düzenleyin. Detay alanları boş bırakılabilir.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <section className="xl:col-span-2 glass rounded-[32px] border border-border-subtle overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
                <Target className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Deal Bilgileri</h2>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Proje Adı</label>
                  <input className={inputClass} name="project" defaultValue={deal.project} required />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Şirket</label>
                  <input className={inputClass} name="company" list="customer-options" defaultValue={deal.company} required />
                  <datalist id="customer-options">
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Şehir</label>
                  <input className={inputClass} name="city" defaultValue={deal.city} />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Aşama</label>
                  <select
                    className={inputClass}
                    name="stage"
                    value={selectedStage}
                    onChange={(event) => setSelectedStage(event.target.value as typeof selectedStage)}
                  >
                    {dealStages.map((stage) => (
                      <option key={stage.name}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Olasılık</label>
                  <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-slate-900/60 px-4 py-3 text-sm text-blue-400">
                    <Gauge className="w-4 h-4" />
                    %{stageConfig.probability}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Satış Sorumlusu</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className={`${inputClass} pl-11`} name="owner" defaultValue={deal.owner} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Kapasite (MW)</label>
                  <input className={inputClass} name="capacityMw" type="number" min="0" step="0.001" defaultValue={deal.capacityMw ?? ''} />
                </div>
              </div>
            </section>

            <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Ticari Bilgiler</h2>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className={labelClass}>Deal Değeri ($)</label>
                  <input className={inputClass} name="valueAmount" type="number" min="0" step="1" defaultValue={deal.valueAmount} required />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Jinko Fiyatı ($/Wp)</label>
                  <input className={inputClass} name="jinkoPrice" type="number" min="0" step="0.0001" defaultValue={valueOrEmpty(deal.jinkoPrice)} />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>HSA Fiyatı ($/Wp)</label>
                  <input className={inputClass} name="hsaPrice" type="number" min="0" step="0.0001" defaultValue={valueOrEmpty(deal.hsaPrice)} />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Hedef Fiyat ($/Wp)</label>
                  <input className={inputClass} name="targetPrice" type="number" min="0" step="0.0001" defaultValue={valueOrEmpty(deal.targetPrice)} />
                </div>
              </div>
            </section>
          </div>

          <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
            <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
              <Building2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-white">Partner, Tarih ve Notlar</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>EPC Partneri</label>
                <input className={inputClass} name="epcPartner" defaultValue={valueOrEmpty(deal.epcPartner)} />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Rakip</label>
                <input className={inputClass} name="competitorName" defaultValue={valueOrEmpty(deal.competitorName)} />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Tahmini Teslimat</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className={`${inputClass} pl-11`} name="deliveryDate" type="date" defaultValue={valueOrEmpty(deal.deliveryDate)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Son Temas Tarihi</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className={`${inputClass} pl-11`} name="lastContactDate" type="date" defaultValue={valueOrEmpty(deal.lastContactDate)} />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2 xl:col-span-4">
                <label className={labelClass}>Notlar</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                  <textarea className={`${inputClass} min-h-28 resize-none pl-11`} name="notes" defaultValue={valueOrEmpty(deal.notes)} />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Link href="/pipeline">
              <button type="button" className="px-5 py-3 rounded-xl border border-border-subtle text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium">
                Vazgeç
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
