"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Building2, 
  MapPin, 
  Users, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

const mockCustomers = [
  { id: '1', name: 'ABC Solar Energy', code: 'CARI-001', tax: '1234567890', city: 'Istanbul', contacts: 4, deals: 2, owner: 'Gamze K.' },
  { id: '2', name: 'Z-Tech Industrial', code: 'CARI-002', tax: '9876543210', city: 'Ankara', contacts: 2, deals: 5, owner: 'John Doe' },
  { id: '3', name: 'Green Power Systems', code: 'CARI-003', tax: '5554443332', city: 'Izmir', contacts: 8, deals: 1, owner: 'Sarah C.' },
  { id: '4', name: 'Blue Sky Energy', code: 'CARI-004', tax: '1112223334', city: 'Bursa', contacts: 1, deals: 0, owner: 'Michael S.' },
  { id: '5', name: 'Eco-Friendly Solutions', code: 'CARI-005', tax: '9998887776', city: 'Antalya', contacts: 3, deals: 3, owner: 'Gamze K.' },
];

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-bold text-white">Customers</h1>
            <p className="text-sm text-slate-400">Total {mockCustomers.length} companies registered.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Filters & Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search customers by name, city or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>

          {/* Grid View (Cards for mobile/tablet) or Table (Desktop) */}
          <div className="glass rounded-[32px] overflow-hidden border border-border-subtle">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Cari Code</th>
                  <th>City</th>
                  <th>Contacts</th>
                  <th>Deals</th>
                  <th>Account Owner</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mockCustomers.map((customer) => (
                  <tr key={customer.id} className="group">
                    <td>
                      <Link href={`/customers/${customer.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">{customer.name}</span>
                            <span className="text-xs text-slate-500">Tax: {customer.tax}</span>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="text-sm font-mono text-slate-400">{customer.code}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-sm">{customer.city}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-sm">{customer.contacts}</span>
                      </div>
                    </td>
                    <td>
                      <span className={customer.deals > 0 ? "text-blue-400 font-medium" : "text-slate-500"}>
                        {customer.deals} deals
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-slate-300">{customer.owner}</span>
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
                ))}
              </tbody>
            </table>
            
            <div className="p-6 border-t border-border-subtle flex items-center justify-between">
              <span className="text-sm text-slate-500">Showing 1-5 of 120 customers</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-border-subtle rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50" disabled>Previous</button>
                <button className="px-4 py-2 text-sm bg-slate-800 rounded-xl text-white border border-border-subtle">1</button>
                <button className="px-4 py-2 text-sm border border-border-subtle rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">2</button>
                <button className="px-4 py-2 text-sm border border-border-subtle rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
