"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Building2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { getCustomerById, type CustomerListItem, updateCustomer } from '@/lib/customers';

const ownerInitials = (owner: string) => {
  return owner
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.includes(' ') ? name.split(' ').map((part) => part[0]).join('').slice(0, 2) : name.slice(0, 4))
    .join('+');
};

const inputClass = "w-full bg-slate-900/60 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "text-sm font-medium text-slate-300";

const valueOrEmpty = (value: string | null) => value ?? '';

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerListItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCustomer(getCustomerById(params.id));
  }, [params.id]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const updatedCustomer = updateCustomer(params.id, formData);
    setIsSaving(false);

    if (!updatedCustomer) {
      toast.error('Müşteri bulunamadı.');
      return;
    }

    setCustomer(updatedCustomer);
    toast.success('Müşteri bilgileri güncellendi.');
  };

  if (!customer) {
    return (
      <div className="flex min-h-screen bg-main-bg">
        <Sidebar />
        <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen p-8">
          <div className="glass rounded-[32px] border border-border-subtle p-8">
            <h1 className="text-xl font-bold text-white mb-2">Müşteri bulunamadı</h1>
            <p className="text-sm text-slate-400 mb-6">Bu müşteri kaydı silinmiş veya tarayıcı kaydında yok.</p>
            <Link href="/customers">
              <button className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold">Customers'a Dön</button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isActive = customer.deals > 0;

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <button className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="h-6 w-px bg-border-subtle" />
            <div>
              <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-400">Müşteri detayları ve kayıt bilgileri.</p>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-blue-400 font-bold">{ownerInitials(customer.owner)}</span>
                  <span className="text-xs text-slate-400 font-medium">{customer.owner}</span>
                </div>
              </div>
            </div>
          </div>
          <span className={isActive
            ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500"
            : "rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-xs font-bold text-slate-400"
          }>
            {isActive ? 'Aktif' : 'Pasif'}
          </span>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <section className="xl:col-span-2 glass rounded-[32px] border border-border-subtle overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
                <Building2 className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Şirket Bilgileri</h2>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Şirket Adı</label>
                  <input className={inputClass} name="companyName" defaultValue={customer.name} required />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Cari Kodu</label>
                  <input className={inputClass} name="customerCode" defaultValue={valueOrEmpty(customer.code)} placeholder="Fatura kesilince girilebilir" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Vergi No</label>
                  <input className={inputClass} name="taxNumber" defaultValue={valueOrEmpty(customer.tax)} placeholder="Fatura kesilince girilebilir" inputMode="numeric" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Sektör</label>
                  <select className={inputClass} name="industry" defaultValue={valueOrEmpty(customer.industry)}>
                    <option value="">Sektör seçin</option>
                    <option>Güneş Enerjisi</option>
                    <option>Enerji</option>
                    <option>Üretim</option>
                    <option>İnşaat</option>
                    <option>Teknoloji</option>
                    <option>Diğer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Hesap Sorumlusu</label>
                  <select className={inputClass} name="owner" defaultValue={customer.owner}>
                    <option>Gamze K.</option>
                    <option>John Doe</option>
                    <option>Sarah C.</option>
                    <option>Michael S.</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Anlaşma Sayısı</label>
                  <input className={inputClass} name="deals" type="number" min="0" defaultValue={customer.deals} />
                </div>
              </div>
            </section>

            <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Birincil Kişi</h2>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className={labelClass}>Ad Soyad</label>
                  <input className={inputClass} name="contactName" defaultValue={valueOrEmpty(customer.contactName)} placeholder="Ayşe Yılmaz" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Ünvan</label>
                  <input className={inputClass} name="contactTitle" defaultValue={valueOrEmpty(customer.contactTitle)} placeholder="Satın Alma Müdürü" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className={`${inputClass} pl-11`} name="email" type="email" defaultValue={valueOrEmpty(customer.email)} placeholder="info@company.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className={`${inputClass} pl-11`} name="phone" defaultValue={valueOrEmpty(customer.phone)} placeholder="+90 212 555 0101" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
            <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
              <MapPin className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-white">Adres ve Ek Bilgiler</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Şehir</label>
                <input className={inputClass} name="city" defaultValue={valueOrEmpty(customer.city)} placeholder="İstanbul" />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>İlçe</label>
                <input className={inputClass} name="district" defaultValue={valueOrEmpty(customer.district)} placeholder="Kadıköy" />
              </div>

              <div className="space-y-2 xl:col-span-2">
                <label className={labelClass}>Web Sitesi</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className={`${inputClass} pl-11`} name="website" defaultValue={valueOrEmpty(customer.website)} placeholder="www.company.com" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className={labelClass}>Adres</label>
                <textarea className={`${inputClass} min-h-28 resize-none`} name="address" defaultValue={valueOrEmpty(customer.address)} placeholder="Açık adres bilgisi" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className={labelClass}>Notlar</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                  <textarea className={`${inputClass} min-h-28 resize-none pl-11`} name="notes" defaultValue={valueOrEmpty(customer.notes)} placeholder="Müşteriyle ilgili kısa notlar" />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/customers')}
              className="px-5 py-3 rounded-xl border border-border-subtle text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium"
            >
              Listeye Dön
            </button>
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
