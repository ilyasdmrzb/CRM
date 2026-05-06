"use client";

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  User, 
  Plus,
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  GitBranch,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'deals' | 'activities'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'contacts', label: 'Contacts', icon: User },
    { id: 'deals', label: 'Deals', icon: GitBranch },
    { id: 'activities', label: 'Activities', icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-main-bg">
      <Sidebar />
      <main className="flex-1 ml-[80px] md:ml-[260px] sidebar-transition min-h-screen">
        {/* Header with Breadcrumbs */}
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <button className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="h-6 w-px bg-border-subtle" />
            <div>
              <h1 className="text-xl font-bold text-white">ABC Solar Energy</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Customers</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-blue-400">ABC Solar Energy</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-border-subtle text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all text-sm font-medium">
              Edit Company
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/20">
              New Deal
            </button>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass p-8 rounded-[32px] border border-border-subtle flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-[32px] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6">
                  <Building2 className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">ABC Solar Energy</h2>
                <p className="text-sm text-slate-500 mb-6">Industrial Solar Manufacturer</p>
                
                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>Istanbul, Turkey</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>+90 212 555 0101</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span>info@abcsolar.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Globe className="w-4 h-4" />
                    <span className="text-blue-500 hover:underline cursor-pointer">www.abcsolar.com</span>
                  </div>
                </div>

                <div className="w-full mt-8 pt-8 border-t border-border-subtle space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Cari Code</span>
                    <span className="text-white font-mono">CARI-001</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Tax Number</span>
                    <span className="text-white">1234567890</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Registered</span>
                    <span className="text-white">Jan 12, 2024</span>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-[32px] border border-border-subtle">
                <h4 className="text-white font-semibold mb-4 text-sm">Account Manager</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">GK</div>
                  <div>
                    <p className="text-sm text-white font-medium">Gamze Kılınç</p>
                    <p className="text-xs text-slate-500">Senior Sales Rep</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Content Area with Tabs */}
            <div className="lg:col-span-3 space-y-8">
              {/* Tabs Navigation */}
              <div className="flex gap-1 bg-slate-800/40 p-1 rounded-2xl border border-border-subtle w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
                      activeTab === tab.id 
                        ? "bg-slate-700 text-white shadow-lg" 
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass p-6 rounded-3xl border border-border-subtle">
                          <span className="text-slate-500 text-xs block mb-1">Active Pipeline</span>
                          <span className="text-2xl font-bold text-white">$450,000</span>
                          <div className="mt-4 flex items-center gap-1 text-emerald-500 text-xs font-medium">
                            <TrendingUp className="w-3 h-3" />
                            <span>+12% from last month</span>
                          </div>
                        </div>
                        <div className="glass p-6 rounded-3xl border border-border-subtle">
                          <span className="text-slate-500 text-xs block mb-1">Total Won</span>
                          <span className="text-2xl font-bold text-emerald-500">$1.2M</span>
                          <p className="text-xs text-slate-500 mt-4">3 deals closed won</p>
                        </div>
                        <div className="glass p-6 rounded-3xl border border-border-subtle">
                          <span className="text-slate-500 text-xs block mb-1">Pending Tasks</span>
                          <span className="text-2xl font-bold text-orange-400">4</span>
                          <p className="text-xs text-slate-500 mt-4">Next action: tomorrow</p>
                        </div>
                      </div>

                      <div className="glass p-8 rounded-[32px] border border-border-subtle">
                        <h3 className="text-white font-semibold mb-6">Company Summary</h3>
                        <p className="text-slate-400 leading-relaxed">
                          ABC Solar Energy is a leading industrial partner in the Marmara region. They specialize in large-scale rooftop installations and have been a primary client since early 2024. Current focus is on Phase 2 expansion for their Izmir factory.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'contacts' && (
                    <motion.div
                      key="contacts"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-white font-semibold">Contacts (4)</h3>
                        <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                          <Plus className="w-4 h-4" /> Add Contact
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="glass p-6 rounded-2xl border border-border-subtle group hover:border-blue-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-500 font-bold">JD</div>
                                <div>
                                  <p className="text-white font-medium">Contact Person {i}</p>
                                  <p className="text-xs text-slate-500">Purchasing Manager</p>
                                </div>
                              </div>
                              <button className="p-1.5 text-slate-500 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Mail className="w-3.5 h-3.5" />
                                <span>contact{i}@abcsolar.com</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Phone className="w-3.5 h-3.5" />
                                <span>+90 532 000 000{i}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'activities' && (
                    <motion.div
                      key="activities"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                        {[
                          { type: 'Call', title: 'Phase 2 Follow-up', desc: 'Discussed pricing and logistics for the new factory.', date: 'Today, 2:30 PM', icon: Phone, color: 'blue' },
                          { type: 'Email', title: 'Proposal Sent', desc: 'Sent the revised proposal for Phase 2.', date: 'Yesterday, 10:15 AM', icon: Mail, color: 'indigo' },
                          { type: 'Meeting', title: 'On-site Visit', desc: 'Visited Istanbul facility for site measurements.', date: 'May 10, 2024', icon: Users, color: 'orange' },
                          { type: 'Task', title: 'Internal Review', desc: 'Reviewed tax benefits for the project.', date: 'May 08, 2024', icon: MessageSquare, color: 'slate' },
                        ].map((act, i) => (
                          <div key={i} className="relative">
                            <div className={`absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-sidebar border-2 border-${act.color}-500 flex items-center justify-center z-10 shadow-lg shadow-${act.color}-500/20`}>
                              <act.icon className={`w-3 h-3 text-${act.color}-500`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider text-${act.color}-500`}>{act.type}</span>
                                <span className="text-xs text-slate-500">• {act.date}</span>
                              </div>
                              <h4 className="text-white font-medium mb-1">{act.title}</h4>
                              <p className="text-sm text-slate-400">{act.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
