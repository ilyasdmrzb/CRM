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
  BarChart,
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { logout, hasRole } from '@/lib/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Pipeline', icon: GitBranch, path: '/pipeline' },
  { name: 'Win / Loss', icon: Trophy, path: '/win-loss' },
  { name: 'Activities', icon: CalendarCheck, path: '/activities' },
  { name: 'Reports', icon: BarChart, path: '/reports' },
  { name: 'Admin Panel', icon: ShieldCheck, path: '/admin', roles: ['Admin'] },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on path change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      logout();
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/10">
            <img src="/hsa-enerji-logo-cropped.png" alt="HSA Enerji" className="h-8 w-8 object-contain" />
          </div>
          <AnimatePresence>
            {(!isCollapsed || isMobileMenuOpen) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl tracking-tight text-white whitespace-nowrap"
              >
                <span className="text-blue-500">H</span>
                <span className="text-white">SA</span>
                <span className="text-blue-500">les</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {isMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="ml-auto p-2 text-slate-400 hover:text-white md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {sidebarItems.map((item) => {
          const canShow = !item.roles || (mounted && hasRole(item.roles));
          if (!canShow) return null;

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
                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                )}
                {isActive && (!isCollapsed || isMobileMenuOpen) && (
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
          className="w-full hidden md:flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all group"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!isCollapsed && <span className="font-medium text-sm">Menüyü Daralt</span>}
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 mt-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {(!isCollapsed || isMobileMenuOpen) && <span className="font-medium text-sm">Çıkış Yap</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="fixed top-4 left-4 z-[60] md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-3 rounded-xl bg-sidebar border border-border-subtle text-white shadow-xl"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-[280px] bg-sidebar border-r border-border-subtle flex flex-col z-[60] md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        className="fixed left-0 top-0 h-screen bg-sidebar border-r border-border-subtle hidden md:flex flex-col z-50 sidebar-transition"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
