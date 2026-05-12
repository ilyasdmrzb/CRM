import Sidebar from "@/components/layout/Sidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getCurrentUser();
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SA';

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-main-bg">
        <Sidebar />
        <main className="main-content">
          <header className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-main-bg/80 backdrop-blur-md sticky top-0 z-40">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user?.fullName || 'Sistem Yöneticisi'}</span>
                <span className="text-xs text-slate-400">{user?.email || 'admin@company.com'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold">
                {initials}
              </div>
            </div>
          </header>
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
