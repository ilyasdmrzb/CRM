"use client";

import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Users,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { addAdminUser, defaultAdminUsers, getAdminUsers, setAdminUserStatus, type AdminUser } from '@/lib/admin-users';

const inputClass = "w-full bg-slate-900/60 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "text-sm font-medium text-slate-300";

export default function AdminPanelPage() {
  const [users, setUsers] = useState<AdminUser[]>(defaultAdminUsers);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUsers(getAdminUsers());
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim().toLocaleLowerCase('tr-TR');
    const hasDuplicate = users.some((user) => user.email.toLocaleLowerCase('tr-TR') === email);

    if (hasDuplicate) {
      setIsSaving(false);
      toast.error('Bu e-posta adresiyle kayıtlı kullanıcı var.');
      return;
    }

    addAdminUser(formData);
    setUsers(getAdminUsers());
    form.reset();
    setIsSaving(false);
    toast.success('Kullanıcı kaydedildi.');
  };

  const handleStatusChange = (id: string, isActive: boolean) => {
    const updatedUsers = setAdminUserStatus(id, isActive);
    setUsers(updatedUsers);
  };

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-slate-400">Kullanıcı kayıtlarını ve erişim durumlarını yönetin.</p>
          </div>
          <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
            {users.length} kullanıcı
          </div>
        </header>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          <section className="glass rounded-[32px] border border-border-subtle overflow-hidden">
            <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-slate-800/30">
              <UserPlus className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-white">Kullanıcı Kaydet</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className={labelClass}>Ad Soyad</label>
                <input className={inputClass} name="fullName" placeholder="Ayşe Yılmaz" required />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className={`${inputClass} pl-11`} name="email" type="email" placeholder="kullanici@company.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className={`${inputClass} pl-11`} name="phone" placeholder="+90 532 000 0000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Rol</label>
                  <select className={inputClass} name="role" defaultValue="Sales">
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>Sales</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Durum</label>
                  <select className={inputClass} name="status" defaultValue="active">
                    <option value="active">Aktif</option>
                    <option value="passive">Pasif</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70"
              >
                <Plus className="w-4 h-4" />
                {isSaving ? 'Kaydediliyor...' : 'Kullanıcı Kaydet'}
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
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {user.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{user.fullName}</span>
                            <span className="text-xs text-slate-500">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400">
                          <ShieldCheck className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="text-sm text-slate-400">{user.phone ?? '-'}</td>
                      <td>
                        <span className={user.isActive
                          ? "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500"
                          : "inline-flex rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-xs font-bold text-slate-400"
                        }>
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleStatusChange(user.id, !user.isActive)}
                          className="flex items-center gap-2 rounded-xl border border-border-subtle px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                        >
                          {user.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                          {user.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
