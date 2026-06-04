"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Edit2,
  GitBranch,
  Lock,
  Mail,
  Phone,
  Plus,
  Save,
  Search,
  ShieldCheck,
  ListChecks,
  History,
  Trash2,
  UserPlus,
  Users,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { addAdminUser, getAdminUsers, deleteAdminUser, updateAdminUser, type AdminUser } from '@/lib/admin-users';
import { isCurrentUserAdmin } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { addLossReasonOption, deleteLossReasonOption, getLossReasonOptionRecords, updateLossReasonOption, type LossReasonOption } from '@/lib/deals';
import { getAuditLogs, type AuditLogItem } from '@/lib/audit-logs';

const inputClass = "w-full bg-slate-900/60 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "text-sm font-medium text-slate-300";

const pipelineStages = [
  { name: '1 - ilk temas, ilgi belirleme', prob: 10 },
  { name: '2 - Bütçe & karar yetki doğrulama', prob: 25 },
  { name: '3 - Ticari teklif sunuldu', prob: 40 },
  { name: '4 - Fiyat & koşul müzakeresi', prob: 65 },
  { name: '5 - PO sözleşme bekleniyor', prob: 85 },
  { name: '6 - Kazanıldı', prob: 100 },
  { name: '6 - Kaybedildi', prob: 0 },
  { name: '6 - Durduruldu', prob: 0 },
];

const actionLabel = (actionType: string) => {
  const labels: Record<string, string> = {
    CREATE: 'Oluşturma',
    UPDATE: 'Güncelleme',
    DELETE: 'Silme',
  };

  return labels[actionType] ?? actionType;
};

const tableLabel = (tableName: string) => {
  const labels: Record<string, string> = {
    Activities: 'Aktiviteler',
    AuditLogs: 'Kullanıcı Geçmişi',
    Auth: 'Kullanıcılar',
    Customers: 'Müşteriler',
    Deals: 'Deal',
    LossReasonOptions: 'Kaybetme Nedenleri',
  };

  return labels[tableName] ?? tableName;
};

const parseAuditDetails = (value: string | null) => {
  if (!value) return null;

  try {
    return JSON.parse(value) as { method?: string; path?: string; query?: string; statusCode?: number; requestBody?: unknown };
  } catch {
    return null;
  }
};

export default function AdminPanelPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [lossReasons, setLossReasons] = useState<LossReasonOption[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'stages' | 'lossReasons' | 'history'>('users');
  const [hasAdminAccess, setHasAdminAccess] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editingLossReason, setEditingLossReason] = useState<LossReasonOption | null>(null);

  const fetchUsers = async () => {
    const data = await getAdminUsers();
    setUsers(data);
  };

  const fetchLossReasons = async () => {
    const data = await getLossReasonOptionRecords(true);
    setLossReasons(data);
  };

  const fetchAuditLogs = async () => {
    const data = await getAuditLogs({ take: 300 });
    setAuditLogs(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchLossReasons();
    fetchAuditLogs();
    setHasAdminAccess(isCurrentUserAdmin());
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR');
    if (!query) return users;

    return users.filter((user) => {
      return [
        user.fullName,
        user.email,
        user.role,
        user.phone,
        user.isActive ? 'aktif' : 'pasif',
      ].some((value) => value?.toLocaleLowerCase('tr-TR').includes(query));
    });
  }, [search, users]);

  const filteredAuditLogs = useMemo(() => {
    const query = auditSearch.trim().toLocaleLowerCase('tr-TR');
    if (!query) return auditLogs;

    return auditLogs.filter((log) => [
      log.changedByName,
      log.changedByEmail,
      log.tableName,
      log.actionType,
      log.recordId,
      actionLabel(log.actionType),
      tableLabel(log.tableName),
    ].some((value) => value?.toLocaleLowerCase('tr-TR').includes(query)));
  }, [auditLogs, auditSearch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const userData: any = {
      fullName: String(formData.get('fullName')),
      email: String(formData.get('email')),
      role: String(formData.get('role')),
      phone: String(formData.get('phone') || ''),
      isActive: editingUser ? editingUser.isActive : true
    };

    const password = String(formData.get('password') || '');
    if (password) {
      userData.password = password;
    }

    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, userData);
        toast.success('Kullanıcı başarıyla güncellendi.');
        setEditingUser(null);
      } else {
        if (!password) {
          toast.error('Yeni kullanıcı için şifre gereklidir.');
          setIsSaving(false);
          return;
        }
        await addAdminUser(userData);
        toast.success('Kullanıcı başarıyla kaydedildi.');
      }
      form.reset();
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (user: AdminUser) => {
    try {
      await updateAdminUser(user.id, { 
        fullName: user.fullName, 
        role: user.role, 
        isActive: !user.isActive 
      });
      toast.success('Kullanıcı durumu güncellendi.');
      await fetchUsers();
    } catch (error: any) {
      toast.error('Kullanıcı durumu güncellenemedi.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Check if user is trying to delete themselves
    const currentUserJson = localStorage.getItem('crm-user');
    const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
    if (currentUser && currentUser.userId === id) {
      toast.error('Kendi hesabınızı pasifleştiremezsiniz.');
      return;
    }

    const confirmMessage = `Verilerin korunması ve bütünlüğü açısından kullanıcı pasifleştirmek daha iyidir. Silmek istediğinize emin misiniz? (${name})`;
    if (window.confirm(confirmMessage)) {
      try {
        console.log('Deleting user:', id);
        await deleteAdminUser(id);
        toast.success('Kullanıcı kalıcı olarak silindi.');
        await fetchUsers();
      } catch (error: any) {
        console.error('Delete error:', error);
        toast.error(error.message || 'Kullanıcı silinemedi.');
      }
    }
  };

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);
    // Form values will be set via defaultValue in inputs or state if we use controlled components.
    // For simplicity with uncontrolled components, we'll use a key to reset the form.
  };

  const handleLossReasonSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') ?? '').trim().replace(/\s+/g, ' '),
      sortOrder: Number(formData.get('sortOrder') ?? lossReasons.length + 1),
      isActive: formData.get('isActive') === 'on',
    };

    try {
      if (!payload.name) {
        toast.error('Kaybetme nedeni boş olamaz.');
        return;
      }

      const duplicate = lossReasons.find((option) =>
        option.name.toLocaleLowerCase('tr-TR') === payload.name.toLocaleLowerCase('tr-TR') &&
        option.id !== editingLossReason?.id
      );

      if (duplicate) {
        toast.error('Bu kaybetme nedeni zaten listede var.');
        return;
      }

      if (editingLossReason) {
        await updateLossReasonOption(editingLossReason.id, payload);
        toast.success('Kaybetme nedeni güncellendi.');
        setEditingLossReason(null);
      } else {
        await addLossReasonOption(payload);
        toast.success('Kaybetme nedeni eklendi.');
      }
      form.reset();
      await fetchLossReasons();
    } catch (error: any) {
      toast.error(error.message || 'Kaybetme nedeni kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLossReasonDelete = async (option: LossReasonOption) => {
    if (!window.confirm(`${option.name} kaybetme nedenini silmek istediğinize emin misiniz?`)) return;

    try {
      await deleteLossReasonOption(option.id);
      toast.success('Kaybetme nedeni silindi.');
      if (editingLossReason?.id === option.id) setEditingLossReason(null);
      await fetchLossReasons();
    } catch (error: any) {
      toast.error(error.message || 'Kaybetme nedeni silinemedi.');
    }
  };

  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen bg-main-bg">
        <Sidebar />
        <main className="main-content p-4 md:p-8">
          <div className="glass rounded-[32px] border border-border-subtle p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">Admin erişimi gerekli</h1>
            <p className="mb-6 text-sm text-slate-400">Bu panel yalnızca Admin rolündeki kullanıcılar tarafından görüntülenebilir.</p>
            <Link href="/">
              <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Dashboard'a Dön</button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="main-content">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-4 md:px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="ml-12 md:ml-0 overflow-hidden">
            <h1 className="text-xl md:text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-xs md:text-sm text-slate-400 hidden sm:block">Kullanıcıları, rolleri ve pipeline ayarlarını yönetin.</p>
          </div>
          <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] md:text-xs font-bold text-blue-400">
            Yalnızca Admin
          </div>
        </header>

        <div className="p-4 md:p-8">
          <div className="mb-8 flex flex-wrap gap-2">
            {[
              { id: 'users', label: 'Kullanıcı Yönetimi', icon: Users },
              { id: 'roles', label: 'Roller ve Yetkiler', icon: ShieldCheck },
              { id: 'stages', label: 'Pipeline Aşamaları', icon: GitBranch },
              { id: 'lossReasons', label: 'Kaybetme Nedenleri', icon: ListChecks },
              { id: 'history', label: 'Kullanıcı Geçmişi', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "border border-border-subtle text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
                <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    {editingUser ? <Edit2 className="w-5 h-5 text-blue-500" /> : <UserPlus className="w-5 h-5 text-blue-500" />}
                    <h2 className="text-lg font-semibold text-white">
                      {editingUser ? 'Kullanıcı Düzenle' : 'Kullanıcı Kaydet'}
                    </h2>
                  </div>
                  {editingUser && (
                    <button 
                      onClick={() => setEditingUser(null)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <form 
                  key={editingUser?.id || 'new'} 
                  onSubmit={handleSubmit} 
                  className="p-6 space-y-5"
                >
                  <div className="space-y-2">
                    <label className={labelClass}>Ad Soyad</label>
                    <input 
                      className={inputClass} 
                      name="fullName" 
                      placeholder="Ayşe Yılmaz" 
                      defaultValue={editingUser?.fullName || ''}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>E-posta</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        className={`${inputClass} pl-11`} 
                        name="email" 
                        type="email" 
                        placeholder="kullanici@company.com" 
                        defaultValue={editingUser?.email || ''}
                        required 
                        disabled={!!editingUser}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>
                      {editingUser ? 'Şifre (Değiştirmek için doldurun)' : 'Şifre'}
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        name="password"
                        type={showPassword ? "text" : "password"} 
                        required={!editingUser}
                        placeholder="••••••••"
                        className={`${inputClass} pl-11 pr-12`}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        className={`${inputClass} pl-11`} 
                        name="phone" 
                        placeholder="+90 532 000 0000" 
                        defaultValue={editingUser?.phone || ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Rol</label>
                    <select 
                      className={inputClass} 
                      name="role" 
                      defaultValue={editingUser?.role || "Sales"}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70"
                  >
                    {editingUser ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isSaving ? 'Kaydediliyor...' : editingUser ? 'Değişiklikleri Kaydet' : 'Kullanıcı Kaydet'}
                  </button>
                </form>
              </section>

              <section className="xl:col-span-2 glass rounded-[32px] border border-border-subtle overflow-hidden">
                <div className="p-6 border-b border-border-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-white">Kullanıcı Listesi</h2>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      className="w-full bg-slate-900/70 border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Kullanıcı ara..."
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Kullanıcı</th>
                        <th>Rol</th>
                        <th>Telefon</th>
                        <th>Durum</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className={cn(editingUser?.id === user.id && "bg-blue-600/5")}>
                          <td className="cursor-pointer" onClick={() => startEdit(user)}>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                {user.initials || user.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{user.fullName}</span>
                                <span className="text-xs text-slate-500">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="cursor-pointer" onClick={() => startEdit(user)}>
                            <span className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400">
                              <ShieldCheck className="w-3 h-3" />
                              {user.role}
                            </span>
                          </td>
                          <td className="text-sm text-slate-400 cursor-pointer" onClick={() => startEdit(user)}>{user.phone ?? '-'}</td>
                          <td>
                            <button
                              onClick={() => handleStatusChange(user)}
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold transition-all",
                                user.isActive
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                                  : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                              )}
                            >
                              {user.isActive ? 'Aktif' : 'Pasif'}
                            </button>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEdit(user)}
                                className="p-2 rounded-xl border border-border-subtle text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                                title="Düzenle"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id, user.fullName)}
                                className="p-2 rounded-xl border border-border-subtle text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-500">
                            Kullanıcı bulunamadı.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'roles' && (
            <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Roller ve Yetkiler</h2>
              </div>
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  { role: 'Admin', detail: 'Tüm yönetim paneli, kullanıcılar ve ayarlar.' },
                  { role: 'Manager', detail: 'Satış verileri, pipeline ve raporları yönetir.' },
                  { role: 'Sales', detail: 'Müşteri, deal ve aktivite kayıtları oluşturur.' },
                ].map((item) => (
                  <div key={item.role} className="rounded-2xl border border-border-subtle bg-slate-900/30 p-5">
                    <div className="mb-3 inline-flex rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                      {item.role}
                    </div>
                    <p className="text-sm text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'stages' && (
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Satış Pipeline Aşamaları</h3>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" /> Değişiklikleri Kaydet
                </button>
              </div>

              <div className="space-y-3">
                {pipelineStages.map((stage, i) => (
                  <div key={stage.name} className="glass p-4 rounded-2xl border border-border-subtle flex items-center gap-6 group">
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
            </section>
          )}

          {activeTab === 'lossReasons' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
                <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    {editingLossReason ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                    <h2 className="text-lg font-semibold text-white">
                      {editingLossReason ? 'Neden Düzenle' : 'Neden Ekle'}
                    </h2>
                  </div>
                  {editingLossReason && (
                    <button
                      onClick={() => setEditingLossReason(null)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <form key={editingLossReason?.id || 'new-loss-reason'} onSubmit={handleLossReasonSubmit} className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className={labelClass}>Kaybetme Nedeni</label>
                    <input
                      className={inputClass}
                      name="name"
                      placeholder="Fiyat yüksek"
                      defaultValue={editingLossReason?.name || ''}
                      maxLength={80}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Sıra</label>
                    <input
                      className={inputClass}
                      name="sortOrder"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={editingLossReason?.sortOrder ?? lossReasons.length + 1}
                      required
                    />
                  </div>

                  <label className="flex items-center justify-between rounded-xl border border-border-subtle bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
                    Aktif
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={editingLossReason?.isActive ?? true}
                      className="h-4 w-4 accent-blue-600"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Kaydediliyor...' : editingLossReason ? 'Değişiklikleri Kaydet' : 'Neden Ekle'}
                  </button>
                </form>
              </section>

              <section className="xl:col-span-2 glass rounded-[32px] border border-border-subtle overflow-hidden">
                <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
                  <ListChecks className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-white">Kaybetme Nedeni Listesi</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Sıra</th>
                        <th>Neden</th>
                        <th>Durum</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lossReasons.map((option) => (
                        <tr key={option.id} className={cn(editingLossReason?.id === option.id && "bg-blue-600/5")}>
                          <td className="text-sm text-slate-400">{option.sortOrder}</td>
                          <td className="cursor-pointer text-white font-medium" onClick={() => setEditingLossReason(option)}>
                            {option.name}
                          </td>
                          <td>
                            <button
                              onClick={async () => {
                                await updateLossReasonOption(option.id, { name: option.name, sortOrder: option.sortOrder, isActive: !option.isActive });
                                await fetchLossReasons();
                              }}
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold transition-all",
                                option.isActive
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                                  : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                              )}
                            >
                              {option.isActive ? 'Aktif' : 'Pasif'}
                            </button>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingLossReason(option)}
                                className="p-2 rounded-xl border border-border-subtle text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                                title="Düzenle"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleLossReasonDelete(option)}
                                className="p-2 rounded-xl border border-border-subtle text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {lossReasons.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-slate-500">
                            Kaybetme nedeni bulunamadı.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'history' && (
            <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-blue-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-white">Kullanıcı Geçmişi</h2>
                    <p className="text-xs text-slate-500">Sistemde yapılan oluşturma, güncelleme ve silme işlemleri.</p>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      className="w-full bg-slate-900/70 border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={auditSearch}
                      onChange={(event) => setAuditSearch(event.target.value)}
                      placeholder="Geçmişte ara..."
                    />
                  </div>
                  <button
                    onClick={fetchAuditLogs}
                    className="rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                  >
                    Yenile
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Kullanıcı</th>
                      <th>İşlem</th>
                      <th>Alan</th>
                      <th>Detay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => {
                      const details = parseAuditDetails(log.newValue);
                      const bodySummary = details?.requestBody
                        ? JSON.stringify(details.requestBody).slice(0, 160)
                        : log.recordId;

                      return (
                        <tr key={log.id}>
                          <td>
                            <div className="flex flex-col">
                              <span className="text-sm text-white">
                                {new Date(log.changedAt).toLocaleDateString('tr-TR')}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(log.changedAt).toLocaleTimeString('tr-TR')}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{log.changedByName}</span>
                              <span className="text-xs text-slate-500">{log.changedByEmail || log.changedBy}</span>
                            </div>
                          </td>
                          <td>
                            <span className={cn(
                              "inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold",
                              log.actionType === 'DELETE'
                                ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                                : log.actionType === 'CREATE'
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                  : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                            )}>
                              {actionLabel(log.actionType)}
                            </span>
                          </td>
                          <td className="text-sm text-slate-300">{tableLabel(log.tableName)}</td>
                          <td>
                            <div className="max-w-xl">
                              <p className="truncate text-sm text-slate-300">{details?.path ?? log.recordId}</p>
                              <p className="truncate text-xs text-slate-500">{bodySummary}</p>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500">
                          Kullanıcı geçmişi bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}


