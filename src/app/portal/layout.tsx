'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import TopBar from '@/components/TopBar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user_juvrio');
    if (!storedUser) {
      router.push('/');
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      const master = parsedUser.perfil?.Master;
      const temMaster = master === true || master === 'SIM' || master === 'sim';
      if (!parsedUser.perfil || !temMaster) {
        console.warn("Acesso negado: Usuário não possui perfil Master.");
        router.push('/');
        return;
      }
      setUser(parsedUser);
      setLoading(false);
    } catch (error) {
      localStorage.removeItem('user_juvrio');
      router.push('/');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#F0F7FF] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">Validando Acesso...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col font-sans antialiased bg-[#F0F7FF]">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>
      <TopBar user={user} />
      <main className="relative z-10 flex-1 overflow-y-auto p-6 custom-scroll">
        {children}
      </main>
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #CBDCF7; border-radius: 10px; }
      `}</style>
    </div>
  );
}