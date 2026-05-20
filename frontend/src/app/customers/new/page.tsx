"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  FileText,
  Globe,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { getAdminUsers, type AdminUser } from '@/lib/admin-users';
import { addCustomerToDb } from '@/lib/customers';

const inputClass = "w-full bg-slate-900/60 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "text-sm font-medium text-slate-300";

export default function NewCustomerPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    getAdminUsers()
      .then((data) => setUsers(data.filter((user) => user.isActive)))
      .catch(() => {
        setUsers([]);
        toast.error('Hesap sorumluları alınamadı.');
      });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    try {
      await addCustomerToDb(formData);
      toast.success('Müşteri kaydı veritabanına kaydedildi.');
      router.push('/customers');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Müşteri kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="main-content">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <button className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="h-6 w-px bg-border-subtle" />
            <div>
              <h1 className="text-2xl font-bold text-white">Yeni Müşteri</h1>
              <p className="text-sm text-slate-400">Müşteri kartı için temel bilgileri girin.</p>
            </div>
          </div>
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
                  <label className={labelClass}>Şirket Adı <span className="text-rose-500">*</span></label>
                  <input className={inputClass} name="companyName" placeholder="Sirket adi" required />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Şehir</label>
                  <input className={inputClass} name="city" placeholder="İstanbul" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Son Görüşme Tarihi</label>
                  <input className={inputClass} value="Henüz görüşme yok" readOnly />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Sektör</label>
                  <select className={inputClass} name="industry" defaultValue="">
                    <option value="" disabled>Sektör seçin</option>
                    <option>Güneş Enerjisi</option>
                    <option>Üretim</option>
                    <option>İnşaat</option>
                    <option>Teknoloji</option>
                    <option>Diğer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Hesap Sorumlusu</label>
                  <select className={inputClass} name="responsibleUserId" defaultValue="" required disabled={users.length === 0}>
                    <option value="" disabled>{users.length === 0 ? 'Kayıtlı aktif kullanıcı yok' : 'Hesap sorumlusu seçin'}</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.initials})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Firma Yetkilisi</h2>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className={labelClass}>Ad Soyad</label>
                  <input className={inputClass} name="contactName" placeholder="Ayşe Yılmaz" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Ünvan</label>
                  <input className={inputClass} name="contactTitle" placeholder="Satın Alma Müdürü" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className={`${inputClass} pl-11`} name="email" type="email" placeholder="info@company.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className={`${inputClass} pl-11`} name="phone" placeholder="+90 212 555 0101" />
                  </div>
                </div>
              </div>
            </section>
          </div>



          <div className="flex items-center justify-end gap-3">
            <Link href="/customers">
              <button type="button" className="px-5 py-3 rounded-xl border border-border-subtle text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium">
                Vazgeç
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSaving || users.length === 0}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Kaydediliyor...' : 'Müşteriyi Kaydet'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}



