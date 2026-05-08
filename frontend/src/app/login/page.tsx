"use client";

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setCurrentUserByEmail } from '@/lib/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? 'admin@company.com');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentUserByEmail(email);
      toast.success('Başarıyla giriş yapıldı!');
      router.push('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-28 h-20 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 overflow-hidden"
          >
            <img src="/hsa-enerji-logo-cropped.png" alt="HSA Enerji" className="h-16 w-24 object-contain" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-blue-500">H</span>
            <span className="text-white">SA</span>
            <span className="text-blue-500">les</span>
            <span className="text-white">'e Hoş Geldiniz</span>
          </h1>
          <p className="text-slate-400 mt-2 text-center">HSA Enerji için kurumsal satış yönetim sistemi.</p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[40px] border border-white/5 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">E-posta Adresi</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  name="email"
                  type="email" 
                  required
                  placeholder="admin@company.com"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-slate-300">Şifre</label>
                <button type="button" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">Şifrenizi mi unuttunuz?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/10 bg-slate-900 text-blue-600 focus:ring-offset-0 focus:ring-blue-500/50" />
              <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer">30 gün boyunca hatırla</label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-slate-500">
              Hesabınız yok mu? <button className="text-blue-500 font-semibold hover:text-blue-400 transition-colors">Yöneticiyle İletişime Geçin</button>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          © 2024 HSAles. Tüm hakları saklıdır. Kurumsal ölçek için geliştirildi.
        </p>
      </motion.div>
    </div>
  );
}
