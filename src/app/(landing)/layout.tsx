'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import CarregandoJuvrio from '@/components/CarregandoJuvrio';
import { podeAcessarRota, ROTA_SEM_LOTACAO } from '@/lib/landing';

/**
 * Layout comum a TODAS as landings de departamento.
 *
 * Responsabilidades:
 *  1. Validar a sessão (guard).                    -> "estou autenticado?"
 *  2. Validar a permissão na Área Gerencial atual. -> "posso estar aqui?"
 *  3. Renderizar a moldura visual (fundo + gradiente).
 *  4. Renderizar a TopBar, que é exclusiva das landings.
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
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  // 1) GUARD DE SESSÃO: quem é você?
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

  // 2) GUARD DE PERMISSÃO: você pode estar nesta Área Gerencial?
  //
  //    Só roda depois que o usuário está disponível. Como o `carregando`
  //    bloqueia a renderização do conteúdo, a verificação nunca acontece
  //    com `user === null` — o que expulsaria todo mundo no primeiro render.
  useEffect(() => {
    if (!user) return;

    // A própria página de destino do bloqueio não redireciona para si mesma.
    if (pathname === ROTA_SEM_LOTACAO) return;

    if (!podeAcessarRota(pathname, user)) {
      router.replace(ROTA_SEM_LOTACAO);
    }
  }, [user, pathname, router]);

  // Enquanto a sessão está sendo lida, ou enquanto o usuário (inválido) está
  // sendo redirecionado, a tela de carregamento ocupa a área inteira.
  if (carregando || !user) {
    return <CarregandoJuvrio mensagem="Carregando" />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col font-sans antialiased bg-[#F0F7FF]">
      <div className="absolute inset-0 z-0 bg-linear-to-br from-blue-50 via-white to-blue-50" />

      <TopBar user={user} />

      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}