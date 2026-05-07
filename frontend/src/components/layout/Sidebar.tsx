"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  Trophy, 
  CalendarCheck, 
  ShieldCheck,
  ChevronLeft, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Pipeline', icon: GitBranch, path: '/pipeline' },
  { name: 'Win / Loss', icon: Trophy, path: '/win-loss' },
  { name: 'Activities', icon: CalendarCheck, path: '/activities' },
  { name: 'Admin Panel', icon: ShieldCheck, path: '/admin' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-border-subtle flex flex-col z-50 sidebar-transition"
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/10">
            <img src="/hsa-enerji-logo-cropped.png" alt="HSA Enerji" className="h-8 w-8 object-contain" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl tracking-tight text-white whitespace-nowrap"
              >
                HSA<span className="text-blue-500">les</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          
          return (
            <Link key={item.name} href={item.path}>
              <div
                className={cn(
                  "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                  isActive 
                    ? "bg-blue-600/10 text-blue-500 border border-blue-500/20" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-500" : "group-hover:text-white")} />
                {!isCollapsed && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border-subtle">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all group"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!isCollapsed && <span className="font-medium text-sm">Menüyü Daralt</span>}
        </button>

        <button className="w-full flex items-center gap-3 px-3 py-3 mt-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium text-sm">Çıkış Yap</span>}
        </button>
      </div>
    </motion.aside>
  );
}
