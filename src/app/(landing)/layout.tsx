'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import TopBar from '@/components/TopBar';

/**
 * Layout comum a TODAS as landings de departamento.
 *
 * Responsabilidades:
 *  1. Validar a sessão (guard) — uma vez, para todas as landings.
 *  2. Renderizar a moldura visual (fundo + gradiente).
 *  3. Renderizar a TopBar, que é exclusiva das landings.
 *
 * O conteúdo de cada departamento fica em <page.tsx>, que é livre
 * para definir seus próprios cards, cores e módulos.
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const sessao = localStorage.getItem('user_juvrio');

    if (!sessao) {
      router.replace('/');
      return;
    }

    try {
      const parsed = JSON.parse(sessao);

      if (!parsed?.id) {
        localStorage.removeItem('user_juvrio');
        router.replace('/');
        return;
      }

      if (String(parsed.status || '').toUpperCase() === 'INATIVO') {
        localStorage.removeItem('user_juvrio');
        router.replace('/');
        return;
      }

      setUser(parsed);
    } catch {
      localStorage.removeItem('user_juvrio');
      router.replace('/');
      return;
    } finally {
      setCarregando(false);
    }
  }, [router]);

  if (carregando) {
    return (
      <div className="h-screen w-full bg-[#F0F7FF] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col font-sans antialiased bg-[#F0F7FF]">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />

      <TopBar user={user} />

      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}