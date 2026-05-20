"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { getAdminUsers, type AdminUser } from '@/lib/admin-users';
import { getCustomersFromDb, type CustomerListItem } from '@/lib/customers';
import { addDealToDb, closeDealInDb, dealStages, getLossReasonOptionsFromDb, lossReasonList } from '@/lib/deals';
import { getCurrentUser } from '@/lib/auth';

const inputClass = "w-full bg-slate-900/60 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "text-sm font-medium text-slate-300";

export default function NewDealPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([]);
  useEffect(() => {
    const user = getCurrentUser();
    if (user && selectedOwnerIds.length === 0) {
      setSelectedOwnerIds([user.id]);
    }
  }, []);
  const [isOwnerPickerOpen, setIsOwnerPickerOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(dealStages[0].name);
  const [lossReasonOptions, setLossReasonOptions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const storedCustomers = await getCustomersFromDb();
      setCustomers(storedCustomers);
      setLossReasonOptions(await getLossReasonOptionsFromDb());
      
      try {
        const adminUsers = await getAdminUsers();
        setUsers(adminUsers.filter((user) => user.isActive));
      } catch (error) {
        console.error("Failed to fetch admin users:", error);
      }
    };
    loadData();
  }, []);

  const stageConfig = dealStages.find((stage) => stage.name === selectedStage) ?? dealStages[0];
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );
  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim().toLocaleLowerCase('tr-TR');
    if (!query) return customers;

    return customers.filter((customer) => customer.name.toLocaleLowerCase('tr-TR').includes(query));
  }, [customerQuery, customers]);
  const selectedOwners = useMemo(
    () => users.filter((user) => selectedOwnerIds.includes(user.id)),
    [selectedOwnerIds, users]
  );

  const handleCustomerInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomerQuery(value);
    setIsCustomerPickerOpen(true);

    if (selectedCustomer && value !== selectedCustomer.name) {
      setSelectedCustomerId('');
    }
  };

  const handleSelectCustomer = (customer: CustomerListItem) => {
    setSelectedCustomerId(customer.id);
    setCustomerQuery(customer.name);
    setIsCustomerPickerOpen(false);
  };

  const toggleOwner = (userId: string) => {
    setSelectedOwnerIds((current) => (
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    ));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCustomer) {
      toast.error('Deal oluşturmadan önce kayıtlı bir müşteri seçin.');
      return;
    }
    if (selectedOwners.length === 0) {
      toast.error('En az bir satış sorumlusu seçin.');
      return;
    }

    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const lossReason = String(formData.get('lossReason') ?? '').trim().replace(/\s+/g, ' ');
    if (selectedStage === 'Kaybedildi' && !lossReason) {
      setIsSaving(false);
      toast.error('Kaybedilen deal icin kaybetme nedeni girin.');
      return;
    }
    if (lossReason.split(' ').filter(Boolean).length > 3) {
      setIsSaving(false);
      toast.error('Kaybetme nedeni en fazla 3 kelime olmali.');
      return;
    }
    formData.set('lossReason', lossReason);
    formData.set('company', selectedCustomer.name);
    formData.set('owner', selectedOwners.map((owner) => owner.initials).join(', '));
    formData.set('customerId', selectedCustomer.id);
    formData.set('salesUserId', selectedOwners[0].id);
    if (selectedCustomer.city && !String(formData.get('city') ?? '').trim()) {
      formData.set('city', selectedCustomer.city);
    }

    try {
      let deal = await addDealToDb(formData);
      if (selectedStage === 'Kaybedildi') {
        deal = await closeDealInDb(deal.id, 'lost', {
          lossReason,
          competitorName: String(formData.get('competitorName') ?? '')
        });
      } else if (selectedStage === 'Kazanıldı') {
        deal = await closeDealInDb(deal.id, 'won', {
          competitorName: String(formData.get('competitorName') ?? '')
        });
      }
      toast.success(`${deal.id} oluşturuldu.`);
      router.push('/pipeline');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Deal kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }  };

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="main-content">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link href="/pipeline">
              <button className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="h-6 w-px bg-border-subtle" />
            <div>
              <h1 className="text-2xl font-bold text-white">Yeni Deal</h1>
              <p className="text-sm text-slate-400">Pipeline için yeni fırsat kaydı oluşturun.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <section className="xl:col-span-2 glass rounded-[32px] border border-border-subtle overflow-visible">
              <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
                <Target className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Deal Bilgileri</h2>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Proje Adı <span className="text-rose-500">*</span></label>
                  <input className={inputClass} name="project" placeholder="GES projesi" required />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Şirket <span className="text-rose-500">*</span></label>
                  <div
                    className="relative"
                    onBlur={() => window.setTimeout(() => setIsCustomerPickerOpen(false), 120)}
                  >
                    <input
                      className={inputClass}
                      value={customerQuery}
                      onChange={handleCustomerInputChange}
                      onFocus={() => setIsCustomerPickerOpen(true)}
                      placeholder={customers.length === 0 ? 'Kayitli musteri yok' : 'Musteri secin'}
                      disabled={customers.length === 0}
                      autoComplete="off"
                    />
                    {isCustomerPickerOpen && customers.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-border-subtle bg-slate-900 shadow-2xl shadow-black/30">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full px-4 py-3 text-left text-sm text-slate-200 transition-all hover:bg-blue-600/20 hover:text-white"
                          >
                            {customer.name}
                          </button>
                        ))}
                        {filteredCustomers.length === 0 && (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            Eslesen musteri yok
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <input type="hidden" name="company" value={selectedCustomer?.name ?? ''} />
                  {customers.length === 0 ? (
                    <Link href="/customers/new" className="inline-flex text-xs font-medium text-blue-400 hover:text-blue-300">
                      Once musteri kaydi olusturun
                    </Link>
                  ) : selectedCustomer ? (
                    <p className="text-xs text-slate-500">
                      {selectedCustomer.contactName ?? 'Ilgili kisi yok'}{selectedCustomer.phone ? ` - ${selectedCustomer.phone}` : ''}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Şehir</label>
                  <input className={inputClass} name="city" placeholder="İstanbul" defaultValue={selectedCustomer?.city ?? ''} key={selectedCustomerId} />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Aşama <span className="text-rose-500">*</span></label>
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
                  <label className={labelClass}>Satış Sorumlusu <span className="text-rose-500">*</span></label>
                  <div
                    className="relative"
                    onBlur={() => window.setTimeout(() => setIsOwnerPickerOpen(false), 120)}
                  >
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <button
                      type="button"
                      onClick={() => setIsOwnerPickerOpen(true)}
                      disabled={users.length === 0}
                      className={`${inputClass} min-h-[46px] pl-11 text-left disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <span className={`block truncate ${selectedOwners.length > 0 ? 'text-white' : 'text-slate-600'}`}>
                        {selectedOwners.length > 0
                          ? selectedOwners.map((owner) => owner.initials).join(', ')
                          : users.length === 0 ? 'Kayitli kullanici yok' : 'Satis sorumlusu secin'}
                      </span>
                    </button>
                    {isOwnerPickerOpen && users.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border-subtle bg-slate-900 shadow-2xl shadow-black/30">
                        {users.map((user) => {
                          const isSelected = selectedOwnerIds.includes(user.id);

                          return (
                            <button
                              key={user.id}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => toggleOwner(user.id)}
                              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-200 transition-all hover:bg-blue-600/20 hover:text-white"
                            >
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{user.initials} - {user.fullName}</span>
                                <span className="block truncate text-xs text-slate-500">{user.role} - {user.email}</span>
                              </span>
                              <span className={isSelected
                                ? 'rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400'
                                : 'rounded-full border border-border-subtle px-2 py-1 text-[10px] font-bold text-slate-500'
                              }>
                                {isSelected ? 'Secildi' : 'Sec'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <input type="hidden" name="owner" value={selectedOwners.map((owner) => owner.initials).join(', ')} />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Kapasite (MW)</label>
                  <input className={inputClass} name="capacityMw" type="number" min="0" step="0.001" placeholder="1.25" />
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
                  <label className={labelClass}>Deal Değeri ($) <span className="text-rose-500">*</span></label>
                  <input className={inputClass} name="valueAmount" type="number" min="0" step="1" placeholder="250000" required />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Jinko Fiyatı ($/Wp)</label>
                  <input className={inputClass} name="jinkoPrice" type="number" min="0" step="0.0001" placeholder="0.1250" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>HSA Fiyatı ($/Wp)</label>
                  <input className={inputClass} name="hsaPrice" type="number" min="0" step="0.0001" placeholder="0.1320" />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Hedef Fiyat ($/Wp)</label>
                  <input className={inputClass} name="targetPrice" type="number" min="0" step="0.0001" placeholder="0.1280" />
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
                <input className={inputClass} name="epcPartner" placeholder="Partner firma" />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Rakip</label>
                <input 
                  className={inputClass} 
                  name="competitorName" 
                  placeholder="Rakip firma" 
                />
              </div>

              {selectedStage === 'Kaybedildi' && (
                <div className="space-y-2">
                  <label className={labelClass}>Kaybetme Nedeni <span className="text-rose-500">*</span></label>
                  <select
                    className={inputClass}
                    name="lossReason"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>Seçiniz...</option>
                    {lossReasonList.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className={labelClass}>Tahmini Teslimat</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className={`${inputClass} pl-11`} name="deliveryDate" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Son Temas Tarihi</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className={`${inputClass} pl-11`} name="lastContactDate" type="date" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2 xl:col-span-4">
                <label className={labelClass}>Notlar</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                  <textarea className={`${inputClass} min-h-28 resize-none pl-11`} name="notes" placeholder="Fırsatla ilgili kısa notlar" />
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
              disabled={isSaving || customers.length === 0 || !selectedCustomer || selectedOwners.length === 0}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Kaydediliyor...' : 'Deal Kaydet'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}



