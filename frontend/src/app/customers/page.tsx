"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Building2,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Filter
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { defaultCustomers, getCustomers, type CustomerListItem } from '@/lib/customers';

const ownerInitials = (owner: string) => {
  return owner
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.includes(' ') ? name.split(' ').map((part) => part[0]).join('').slice(0, 2) : name.slice(0, 4))
    .join('+');
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerListItem[]>(defaultCustomers);

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');
    if (!query) return customers;

    return customers.filter((customer) => {
      return [
        customer.name,
        customer.city,
        customer.phone,
        customer.email,
        customer.owner,
      ].some((value) => value?.toLocaleLowerCase('tr-TR').includes(query));
    });
  }, [customers, search]);

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">Customers</h1>
            <p className="text-sm text-slate-400">Toplam {customers.length} şirket kayıtlı.</p>
          </div>
          <Link href="/customers/new">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              <Plus className="w-5 h-5" />
              Müşteri Ekle
            </button>
          </Link>
        </header>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Müşterileri ad, şehir, telefon veya mail ile ara..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-slate-800/50 border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <Filter className="w-4 h-4" />
              Gelişmiş Filtreler
            </button>
          </div>

          <div className="glass rounded-[32px] overflow-hidden border border-border-subtle">
            <div className="overflow-x-auto">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Müşteri Bilgileri</th>
                    <th>Telefon</th>
                    <th>Mail Adresi</th>
                    <th>Şehir</th>
                    <th>Sorumlu</th>
                    <th>Anlaşma Sayısı</th>
                    <th>Durum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const isActive = customer.deals > 0;

                    return (
                      <tr key={customer.id} className="group">
                        <td>
                          <Link href={`/customers/${customer.id}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">{customer.name}</span>
                                <span className="text-xs text-slate-500">{customer.contactName ?? 'İlgili kişi girilmemiş'}</span>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-sm">{customer.phone ?? '-'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-sm">{customer.email ?? '-'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-sm">{customer.city ?? '-'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2" title={customer.owner}>
                            <span className="text-sm font-bold text-slate-300">{ownerInitials(customer.owner)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={isActive ? "text-blue-400 font-medium" : "text-slate-500"}>
                            {customer.deals}
                          </span>
                        </td>
                        <td>
                          <span className={isActive
                            ? "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500"
                            : "inline-flex rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-xs font-bold text-slate-400"
                          }>
                            {isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Link href={`/customers/${customer.id}`}>
                              <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </Link>
                            <button className="p-2 text-slate-500 hover:text-white transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-border-subtle flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {filteredCustomers.length} müşteriden {filteredCustomers.length > 0 ? `1-${filteredCustomers.length}` : '0'} arası gösteriliyor
              </span>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-border-subtle rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50" disabled>Önceki</button>
                <button className="px-4 py-2 text-sm bg-slate-800 rounded-xl text-white border border-border-subtle">1</button>
                <button className="px-4 py-2 text-sm border border-border-subtle rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">Sonraki</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
