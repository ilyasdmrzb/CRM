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
  Filter,
  Trash2,
  X
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { getCustomersFromDb, deleteCustomerFromDb, type CustomerListItem } from '@/lib/customers';
import { getDealsFromDb, type DealItem } from '@/lib/deals';
import { isCurrentUserAdmin } from '@/lib/auth';
import toast from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ownerInitials = (owner: string) => {
  return owner
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.includes(' ') ? name.split(' ').map((part) => part[0]).join('').slice(0, 2) : name.slice(0, 4))
    .join('+');
};

const isClosedDeal = (deal: DealItem) => deal.stage.startsWith('Kazan') || deal.stage.includes('Kaybed');

const getCustomerDeals = (customer: CustomerListItem, deals: DealItem[]) => {
  const customerName = customer.name.trim().toLocaleLowerCase('tr-TR');
  return deals.filter((deal) => deal.company.trim().toLocaleLowerCase('tr-TR') === customerName);
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [deals, setDeals] = useState<DealItem[]>([]);

  useEffect(() => {
    getCustomersFromDb()
      .then(setCustomers)
      .catch(() => setCustomers([]));
    getDealsFromDb().then(setDeals).catch(() => setDeals([]));
  }, []);

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz? Bağlı anlaşmalar ve aktiviteler de etkilenebilir.')) return;
    try {
      await deleteCustomerFromDb(id);
      setCustomers(await getCustomersFromDb());
      toast.success('Müşteri silindi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Müşteri silinemedi.');
    }
  };

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
      <main className="main-content">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-4 md:px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="ml-12 md:ml-0 overflow-hidden">
            <h1 className="text-xl md:text-2xl font-bold text-white">Müşteriler</h1>
            <p className="text-xs md:text-sm text-slate-400 hidden sm:block">Toplam {customers.length} şirket kayıtlı.</p>
          </div>
          <Link href="/customers/new">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-xs md:text-sm">
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Müşteri Ekle</span>
            </button>
          </Link>
        </header>

        <div className="p-4 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full max-w-md">
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
                    <th className="hidden lg:table-cell">Telefon</th>
                    <th className="hidden xl:table-cell">Mail Adresi</th>
                    <th className="hidden sm:table-cell">Şehir</th>
                    <th className="hidden md:table-cell">Sorumlu</th>
                    <th className="hidden sm:table-cell text-center">Anlaşmalar</th>
                    <th className="text-center">Durum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const customerDeals = getCustomerDeals(customer, deals);
                    const activeDeals = customerDeals.filter((deal) => !isClosedDeal(deal));
                    const isActive = activeDeals.length > 0;

                    return (
                      <tr key={customer.id} className="group">
                        <td className="px-4 py-3">
                          <Link href={`/customers/${customer.id}`}>
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">
                                <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate max-w-[120px] md:max-w-none">{customer.name}</span>
                                <span className="text-[10px] md:text-xs text-slate-500 truncate">{customer.contactName ?? '-'}</span>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="hidden lg:table-cell px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-sm">{customer.phone ?? '-'}</span>
                          </div>
                        </td>
                        <td className="hidden xl:table-cell px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-sm truncate max-w-[150px]">{customer.email ?? '-'}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-sm">{customer.city ?? '-'}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-border-subtle flex items-center justify-center text-[10px] font-bold text-slate-400">
                              {(customer.owner ?? 'A')[0]}
                            </div>
                            <span className="text-sm text-slate-300">{customer.owner ?? '-'}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3 text-center">
                          <div className="inline-flex items-center justify-center bg-slate-800/50 px-2 py-1 rounded-lg border border-border-subtle">
                            <span className="text-xs font-bold text-white">{customerDeals.length}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border",
                            isActive 
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                              : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-slate-500")} />
                            <span className="hidden xs:inline">{isActive ? 'Açık' : 'Kapalı'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 md:gap-2">
                            <Link href={`/customers/${customer.id}`}>
                              <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            </Link>
                            {isCurrentUserAdmin() && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }}
                                className="p-2 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                title="Sil"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                            <button className="p-2 text-slate-500 hover:text-white transition-colors hidden md:block">
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



